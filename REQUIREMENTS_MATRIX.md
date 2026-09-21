# CivicResolve AI — Core Requirements & Evaluation Mapping

This version is structured directly around the supplied hackathon requirements.

| Requirement | Implementation |
|---|---|
| Accept text, voice, image, or supported inputs | 7-step citizen intake accepts typed text, browser speech-to-text, image evidence, and mixed submissions. |
| Identify/classify civic issue | `/api/ai/analyze` performs multimodal classification; deterministic fallback works without an API key. |
| Analyze location + evidence | GPS/browser geolocation + draggable Leaflet pin + reverse geocoding; image evidence is passed to vision analysis when available. |
| Estimate priority/severity | Severity is produced by AI/rules and then checked against explicit safety signals before complaint creation. |
| Identify department/authority | Category-to-department routing matrix is enforced server-side after classification, preventing department hallucinations. |
| Generate structured complaint | `POST /api/complaints` creates a ticket with category, severity, confidence, evidence, location, department, officer, SLA and history. |
| Track complaint after submission | Citizen/officer/admin dashboards, complaint detail modal, lifecycle timeline, notifications and status APIs. |
| Monitor unresolved complaints + follow-up | Autonomous SLA Sentinel runs every 60 seconds, creates SLA-warning follow-up actions, and sends notifications. |
| Escalate predefined conditions | SLA breach automatically escalates unresolved complaints to Level 2; manual escalation controls are also available. |
| Traceability | Agent action logs capture agent, action, tool, reason, inputs/outputs and result status; complaint timelines and audit logs are retained in runtime state. |
| Evidence grounding | AI responses expose evidence points plus source labels (`TEXT`, `VOICE`, `IMAGE`, `LOCATION`, `SYSTEM`), shown in the UI and stored on the complaint. |
| Practical usability | Role-based dashboards, 7-step intake, map pin correction, duplicate preview, resolution proof and citizen verification. |

## Evaluation metric mapping

### 1. Issue Classification Accuracy
- AI classification is supported by a deterministic civic-rule fallback.
- Explicit normalization maps model output into the allowed civic categories.
- Human category correction is supported as an explicit, traceable citizen action.

### 2. Department Mapping Accuracy
- Department mapping is **not left to free-form model output**.
- The server applies a fixed category → department matrix after AI classification.

### 3. Severity Assessment
- Severity is based on AI/rule output plus explicit critical/high/low safety signals.
- The final severity and evidence rationale are stored with the complaint.

### 4. Agentic Workflow Execution
The operational path is:

`Intake → Duplicate Check → Classification → Evidence/Severity → Department Routing → Officer Assignment → SLA Monitoring → Follow-up → Escalation → Resolution Evidence → Citizen Verification → Closure/Reopen`

### 5. Evidence Grounding
Every analysis can identify which sources were available:
- `TEXT`
- `VOICE`
- `IMAGE`
- `LOCATION`
- `SYSTEM`

### 6. Practical Usability
The demo flow is intentionally visible and testable from the UI:
- Report Issue
- AI classification
- Location pin
- Evidence rationale
- Duplicate check
- Ticket number
- Lifecycle timeline
- Agent trace
- SLA warning/escalation
- Resolution proof
- Citizen verification

## Important runtime note

The application has a deterministic fallback engine, so core classification/routing/SLA demonstration does not depend on Gemini being available. If `GEMINI_API_KEY` is configured, Gemini is used for multimodal analysis first and the server-side civic policy layer still validates department routing and safety severity.

## Role Workflow Alignment

| Workflow step | Implementation |
|---|---|
| Citizen reports issue | Authenticated Citizen + 7-step multi-modal intake |
| Supervisor receives issue | Classified complaint creates Supervisor notification and queue entry |
| Supervisor assigns worker | `assign-worker` endpoint + Supervisor dashboard |
| Worker receives task | User-targeted notification + Worker task queue |
| Worker completes task | Worker accepts/starts work and uploads completion photo |
| Supervisor reviews | Completion enters `PENDING_SUPERVISOR_REVIEW` |
| Supervisor approves/reassigns | Approve or reassign actions with audit/status history |
| Citizen notification | Approval creates a Citizen resolution notification |
| Citizen verification | Citizen confirms or reopens the issue |
| Authentication | HTTP-only session cookie + server-side role authorization |
