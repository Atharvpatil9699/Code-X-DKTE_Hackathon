import io
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from PIL import Image, ImageStat, ImageFilter

from .models import KEYWORDS, ROUTES

def now():
    return datetime.now(timezone.utc)

def classify_issue(text: str, image_hint: str = ""):
    hay = f"{text} {image_hint}".lower()
    scores = {}
    for category, words in KEYWORDS.items():
        scores[category] = sum(1 for w in words if w in hay)
    category = max(scores, key=scores.get)
    if scores[category] == 0:
        category = "Other Civic Issue"
    confidence = 0.55 + min(scores.get(category, 0) * 0.10, 0.35)
    return category, round(min(confidence, 0.95), 2), scores

def analyze_location(address: str, latitude: Optional[float], longitude: Optional[float]):
    # Local deterministic location analysis. It does not call an external geocoder.
    zone = "Unknown Zone"
    lower = address.lower()
    known = {
        "pune": "Pune Urban Area",
        "kolhapur": "Kolhapur Urban Area",
        "mumbai": "Mumbai Urban Area",
        "nagpur": "Nagpur Urban Area",
    }
    for key, value in known.items():
        if key in lower:
            zone = value
            break
    coordinate_quality = "Provided" if latitude is not None and longitude is not None else "Address only"
    return {
        "zone": zone,
        "coordinate_quality": coordinate_quality,
        "latitude": latitude,
        "longitude": longitude,
        "analysis": "Location attached to complaint and retained for routing/audit."
    }

def analyze_image(data: bytes, filename: str):
    result = {
        "provided": True,
        "filename": filename,
        "analyzer": "Local Pillow evidence analyzer",
        "findings": [],
        "confidence": 0.0,
        "metadata": {}
    }
    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
        w, h = image.size
        stat = ImageStat.Stat(image)
        brightness = sum(stat.mean) / 3
        small = image.resize((160, max(1, int(h * 160 / w))))
        gray = small.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_stat = ImageStat.Stat(edges)
        edge_density = edge_stat.mean[0] / 255.0

        result["metadata"] = {
            "width": w,
            "height": h,
            "brightness": round(brightness, 2),
            "edge_density": round(edge_density, 3),
            "format": image.format or "unknown"
        }

        name = filename.lower()
        if any(x in name for x in ["pothole", "road", "crater"]):
            result["findings"].append("Filename indicates possible road-surface evidence.")
        if any(x in name for x in ["garbage", "waste", "trash"]):
            result["findings"].append("Filename indicates possible waste accumulation evidence.")
        if any(x in name for x in ["light", "streetlight", "lamp"]):
            result["findings"].append("Filename indicates possible street-light evidence.")
        if any(x in name for x in ["water", "leak", "pipe"]):
            result["findings"].append("Filename indicates possible water-leak evidence.")

        if edge_density > 0.20:
            result["findings"].append("Image contains substantial visual edges/structures.")
        if brightness < 70:
            result["findings"].append("Image is relatively dark; low-light evidence may limit analysis.")

        if not result["findings"]:
            result["findings"].append("Image received and inspected for basic visual metadata.")

        result["confidence"] = round(min(0.55 + 0.05 * len(result["findings"]), 0.85), 2)
    except Exception as exc:
        result["findings"] = [f"Image could not be decoded: {exc}"]
        result["confidence"] = 0.20
    return result

def assess_severity(text: str, category: str):
    t = text.lower()
    high = ["accident", "injury", "danger", "life threatening", "school", "hospital", "fire", "overflow", "blocked"]
    medium = ["traffic", "large", "major", "urgent", "unsafe", "night", "repeated"]
    high_hits = sum(1 for x in high if x in t)
    medium_hits = sum(1 for x in medium if x in t)

    if high_hits >= 2:
        severity = "Critical"
    elif high_hits == 1 or medium_hits >= 2:
        severity = "High"
    elif medium_hits == 1:
        severity = "Medium"
    else:
        severity = "Low"

    if severity == "Critical":
        priority = "P1"
    elif severity == "High":
        priority = "P2"
    elif severity == "Medium":
        priority = "P3"
    else:
        priority = "P4"

    return severity, priority

def route(category: str):
    rule = ROUTES.get(category, ROUTES["Other Civic Issue"])
    return rule

def build_triage(title, description, address, latitude, longitude, evidence):
    combined = f"{title}. {description}"
    image_hint = " ".join(evidence.get("findings", []))
    category, confidence, scores = classify_issue(combined, image_hint)
    severity, priority = assess_severity(combined, category)
    rule = route(category)
    location = analyze_location(address, latitude, longitude)

    reasons = [
        f"Classification matched category '{category}' using complaint text and available evidence.",
        f"Severity '{severity}' and priority '{priority}' were derived from safety/urgency indicators.",
        f"Department mapped to '{rule.department}' using the local civic routing rule set.",
    ]
    if evidence.get("provided"):
        reasons.append("Uploaded evidence was incorporated into the triage record.")

    return {
        "category": category,
        "classification_confidence": confidence,
        "classification_scores": scores,
        "severity": severity,
        "priority": priority,
        "department": rule.department,
        "authority": rule.authority,
        "sla_hours": rule.sla_hours,
        "location_analysis": location,
        "evidence_grounding": {
            "used": bool(evidence.get("provided")),
            "findings": evidence.get("findings", []),
        },
        "reasons": reasons,
    }
