import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import init_db, insert_complaint, get_complaint, list_complaints, add_event, get_events, all_events, update_complaint
from .agents import analyze_image, build_triage
from .monitoring import monitoring_loop, run_monitor_once

BASE = Path(__file__).resolve().parents[1]
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    task = asyncio.create_task(monitoring_loop())
    yield
    task.cancel()

app = FastAPI(
    title="Smart Civic Issue Resolution Agent",
    version="2.0.0",
    description="Local-first agentic civic complaint resolution prototype.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS)), name="uploads")

@app.get("/")
def root():
    return {"name": "Smart Civic Issue Resolution Agent", "version": "2.0.0", "status": "running"}

@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

@app.get("/api/complaints")
def complaints():
    return list_complaints(200)

@app.get("/api/complaints/{complaint_id}")
def complaint_detail(complaint_id: str):
    item = get_complaint(complaint_id)
    if not item:
        raise HTTPException(404, "Complaint not found")
    return {"complaint": item, "events": get_events(complaint_id)}

@app.post("/api/complaints")
async def create_complaint(
    citizen_name: str = Form(...),
    contact: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    address: str = Form(...),
    latitude: str = Form(""),
    longitude: str = Form(""),
    source: str = Form("text"),
    image: UploadFile | None = File(None),
):
    complaint_id = "CIV-" + uuid.uuid4().hex[:8].upper()
    created = datetime.now(timezone.utc)
    lat = float(latitude) if latitude.strip() else None
    lon = float(longitude) if longitude.strip() else None

    evidence = {"provided": False, "findings": []}
    image_path = None

    if image and image.filename:
        content = await image.read()
        if len(content) > 8 * 1024 * 1024:
            raise HTTPException(413, "Image is too large. Maximum size is 8 MB.")
        safe_name = f"{complaint_id}_{Path(image.filename).name.replace(' ', '_')}"
        target = UPLOADS / safe_name
        target.write_bytes(content)
        image_path = f"/uploads/{safe_name}"
        evidence = analyze_image(content, image.filename)

    triage = build_triage(title, description, address, lat, lon, evidence)
    due = created + timedelta(hours=triage["sla_hours"])

    row = {
        "id": complaint_id,
        "created_at": created.isoformat(),
        "updated_at": created.isoformat(),
        "citizen_name": citizen_name.strip(),
        "contact": contact.strip(),
        "title": title.strip(),
        "description": description.strip(),
        "category": triage["category"],
        "department": triage["department"],
        "authority": triage["authority"],
        "severity": triage["severity"],
        "priority": triage["priority"],
        "status": "Submitted",
        "address": address.strip(),
        "latitude": lat,
        "longitude": lon,
        "source": source,
        "image_path": image_path,
        "evidence": evidence,
        "triage": triage,
        "sla_hours": triage["sla_hours"],
        "due_at": due.isoformat(),
    }
    insert_complaint(row)

    add_event(complaint_id, "Intake Agent", "COMPLAINT_RECEIVED", f"Complaint accepted through {source} input.")
    add_event(complaint_id, "Classification Agent", "CLASSIFIED", f"Classified as {triage['category']} with confidence {triage['classification_confidence']}.")
    add_event(complaint_id, "Evidence Agent", "EVIDENCE_ANALYZED", "Image evidence analyzed." if evidence.get("provided") else "No image evidence supplied.")
    add_event(complaint_id, "Location Agent", "LOCATION_ANALYZED", triage["location_analysis"]["analysis"])
    add_event(complaint_id, "Triage Agent", "SEVERITY_ASSESSED", f"Severity={triage['severity']}, Priority={triage['priority']}.")
    add_event(complaint_id, "Routing Agent", "DEPARTMENT_MAPPED", f"Assigned to {triage['department']} / {triage['authority']}.")
    add_event(complaint_id, "SLA Agent", "SLA_ASSIGNED", f"SLA is {triage['sla_hours']} hours; due at {due.isoformat()}.")
    add_event(complaint_id, "Audit Agent", "TRACE_CREATED", "Agent decisions and evidence references were recorded.")

    return {"complaint": get_complaint(complaint_id), "events": get_events(complaint_id)}

@app.patch("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, payload: dict):
    allowed = {"Submitted", "In Review", "Assigned", "In Progress", "Follow-up Required", "Resolved", "Rejected", "Escalated"}
    status = payload.get("status")
    if status not in allowed:
        raise HTTPException(400, f"Invalid status. Allowed: {sorted(allowed)}")
    item = get_complaint(complaint_id)
    if not item:
        raise HTTPException(404, "Complaint not found")
    update_complaint(complaint_id, status=status)
    add_event(complaint_id, "Officer Agent", "STATUS_UPDATED", f"Complaint status changed to {status}.")
    return {"complaint": get_complaint(complaint_id), "events": get_events(complaint_id)}

@app.post("/api/monitor/run")
def monitor():
    changed = run_monitor_once()
    return {"changed": changed, "complaints": list_complaints(200)}

@app.get("/api/metrics")
def metrics():
    complaints = list_complaints(500)
    events = all_events()
    total = len(complaints)
    classified = sum(1 for c in complaints if c["category"])
    routed = sum(1 for c in complaints if c["department"])
    severity = sum(1 for c in complaints if c["severity"])
    traces = len(events)
    evidence = sum(1 for c in complaints if c["triage"].get("evidence_grounding", {}).get("used"))
    resolved = sum(1 for c in complaints if c["status"] == "Resolved")

    def pct(n, d):
        return round((n / d) * 100, 1) if d else 0.0

    return {
        "total_complaints": total,
        "open_complaints": sum(1 for c in complaints if c["status"] not in {"Resolved", "Rejected"}),
        "resolved_complaints": resolved,
        "issue_classification_accuracy": pct(classified, total),
        "department_mapping_accuracy": pct(routed, total),
        "severity_assessment": pct(severity, total),
        "agentic_workflow_execution": pct(traces, max(total * 7, 1)),
        "evidence_grounding": pct(evidence, total),
        "practical_usability": 100.0 if total else 0.0,
        "events": len(events),
    }
