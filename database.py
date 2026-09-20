import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)
DB_PATH = DATA / "civic_agent.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        contact TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        authority TEXT NOT NULL,
        severity TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        source TEXT NOT NULL,
        image_path TEXT,
        evidence_json TEXT NOT NULL,
        triage_json TEXT NOT NULL,
        sla_hours INTEGER NOT NULL,
        due_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        agent TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        FOREIGN KEY(complaint_id) REFERENCES complaints(id)
    );
    """)
    conn.commit()
    conn.close()

def insert_complaint(row: Dict[str, Any]):
    conn = get_conn()
    conn.execute("""
        INSERT INTO complaints
        (id, created_at, updated_at, citizen_name, contact, title, description,
         category, department, authority, severity, priority, status, address,
         latitude, longitude, source, image_path, evidence_json, triage_json,
         sla_hours, due_at)
        VALUES
        (:id, :created_at, :updated_at, :citizen_name, :contact, :title, :description,
         :category, :department, :authority, :severity, :priority, :status, :address,
         :latitude, :longitude, :source, :image_path, :evidence_json, :triage_json,
         :sla_hours, :due_at)
    """, {
        **row,
        "evidence_json": json.dumps(row["evidence"], ensure_ascii=False),
        "triage_json": json.dumps(row["triage"], ensure_ascii=False),
    })
    conn.commit()
    conn.close()

def update_complaint(complaint_id: str, **fields):
    if not fields:
        return
    conn = get_conn()
    sets = []
    values = {"id": complaint_id}
    for key, value in fields.items():
        if key in {"evidence", "triage"}:
            key_db = f"{key}_json"
            value = json.dumps(value, ensure_ascii=False)
        else:
            key_db = key
        sets.append(f"{key_db} = :{key_db}")
        values[key_db] = value
    sets.append("updated_at = :updated_at")
    from datetime import datetime, timezone
    values["updated_at"] = datetime.now(timezone.utc).isoformat()
    conn.execute(f"UPDATE complaints SET {', '.join(sets)} WHERE id = :id", values)
    conn.commit()
    conn.close()

def get_complaint(complaint_id: str) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return normalize(row)

def list_complaints(limit=100) -> List[Dict[str, Any]]:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM complaints ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [normalize(r) for r in rows]

def normalize(row):
    d = dict(row)
    d["evidence"] = json.loads(d.pop("evidence_json") or "{}")
    d["triage"] = json.loads(d.pop("triage_json") or "{}")
    return d

def add_event(complaint_id: str, agent: str, action: str, details: str):
    from datetime import datetime, timezone
    conn = get_conn()
    conn.execute(
        "INSERT INTO events (complaint_id, created_at, agent, action, details) VALUES (?, ?, ?, ?, ?)",
        (complaint_id, datetime.now(timezone.utc).isoformat(), agent, action, details),
    )
    conn.commit()
    conn.close()

def get_events(complaint_id: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM events WHERE complaint_id = ? ORDER BY created_at ASC",
        (complaint_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def all_events():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM events ORDER BY created_at ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def seed_demo():
    if list_complaints(1):
        return False
    return True
