import asyncio
from datetime import datetime, timezone
from .database import list_complaints, update_complaint, add_event

OPEN = {"Submitted", "In Review", "Assigned", "In Progress", "Follow-up Required"}

async def monitoring_loop():
    while True:
        try:
            run_monitor_once()
        except Exception:
            pass
        await asyncio.sleep(30)

def run_monitor_once():
    now = datetime.now(timezone.utc)
    changed = 0
    for complaint in list_complaints(500):
        if complaint["status"] not in OPEN:
            continue
        try:
            due = datetime.fromisoformat(complaint["due_at"])
        except Exception:
            continue
        if now >= due:
            if complaint["status"] != "Escalated":
                update_complaint(complaint["id"], status="Escalated")
                add_event(
                    complaint["id"],
                    "Monitoring Agent",
                    "SLA_ESCALATION",
                    f"SLA deadline {complaint['due_at']} passed without resolution. Complaint escalated to {complaint['authority']}."
                )
                changed += 1
        else:
            # Add one follow-up event only when status is Submitted and enough time has passed.
            created = datetime.fromisoformat(complaint["created_at"])
            age_hours = (now - created).total_seconds() / 3600
            if age_hours >= max(1, complaint["sla_hours"] * 0.5) and complaint["status"] == "Submitted":
                update_complaint(complaint["id"], status="Follow-up Required")
                add_event(
                    complaint["id"],
                    "Follow-up Agent",
                    "FOLLOW_UP",
                    "Complaint reached the configured follow-up checkpoint before SLA expiry."
                )
                changed += 1
    return changed
