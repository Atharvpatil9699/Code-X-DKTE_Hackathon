import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { agentOrchestrator } from './server/agent';
import { analyzeComplaintWithAI, generateCivicInsightsAI } from './server/gemini';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON & base64 image evidence
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API ROUTES ---

  // Simple in-memory session authentication for the hackathon demo.
  const sessions = new Map<string, string>();
  const makeToken = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  const parseCookies = (header = '') => Object.fromEntries(header.split(';').filter(Boolean).map(part => { const [k, ...v] = part.trim().split('='); return [k, decodeURIComponent(v.join('='))]; }));

  const requireAuth = (req: any, res: any, next: any) => {
    const cookies = parseCookies(req.headers.cookie || '');
    const userId = sessions.get(cookies.civic_session || '');
    const user = userId ? db.users.find((u) => u.id === userId) : undefined;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    req.user = user;
    next();
  };

  const requireRole = (...roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'This action is not allowed for your role' });
    next();
  };

  // Workers authenticate with a User ID (usr-officer-1), while complaint assignments
  // are stored against the field-worker/officer ID (off-1). Always resolve the
  // authenticated worker to the canonical officer record before filtering or authorizing.
  const getWorkerProfile = (user: any) => {
    if (!user || user.role !== 'WORKER') return undefined;
    // Demo accounts use civic login emails (e.g. officer@civicresolve.org),
    // while field-worker records use official municipal emails. Resolve the
    // canonical worker explicitly first, then fall back to email matching.
    const workerUserMap: Record<string, string> = {
      'usr-officer-1': 'off-1',
    };
    const mappedOfficerId = workerUserMap[String(user.id || '')];
    if (mappedOfficerId) {
      const mapped = db.officers.find((o) => o.id === mappedOfficerId);
      if (mapped) return mapped;
    }
    return db.officers.find((o) => o.email.toLowerCase() === String(user.email || '').toLowerCase());
  };

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CivicResolve AI Agentic System', version: '2.0.0' });
  });

  // 1. Authentication
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const credentials: Record<string, string> = {
      'citizen@civicresolve.org': 'citizen123',
      'supervisor@civicresolve.org': 'supervisor123',
      'officer@civicresolve.org': 'worker123',
    };
    const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user || credentials[user.email.toLowerCase()] !== password) return res.status(401).json({ error: 'Invalid email or password' });
    const token = makeToken();
    sessions.set(token, user.id);
    res.setHeader('Set-Cookie', `civic_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
    res.json({ user });
  });

  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie || '');
    if (cookies.civic_session) sessions.delete(cookies.civic_session);
    res.setHeader('Set-Cookie', 'civic_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req: any, res) => res.json(req.user));
  app.get('/api/auth/users', requireAuth, (req, res) => res.json(db.users));

  // All remaining API routes require an authenticated citizen, worker or supervisor.
  app.use('/api', requireAuth);

  // 2. Departments & Officers
  app.get('/api/departments', (req, res) => {
    res.json(db.departments);
  });

  app.get('/api/officers', (req, res) => {
    const { departmentId } = req.query;
    let list = db.officers;
    if (departmentId) {
      list = list.filter((o) => o.departmentId === departmentId);
    }
    res.json(list);
  });

  // 3. Complaints
  app.get('/api/complaints', (req: any, res) => {
    const { status, severity, category, search } = req.query;
    const user = req.user;
    const worker = user.role === 'WORKER' ? getWorkerProfile(user) : undefined;
    const complaints = db.getComplaints({
      citizenId: user.role === 'CITIZEN' ? user.id : undefined,
      officerId: worker?.id,
      departmentId: user.role === 'SUPERVISOR' ? undefined : user.departmentId,
      status: status as string,
      severity: severity as string,
      category: category as string,
      search: search as string,
    });
    res.json(complaints);
  });

  app.get('/api/complaints/:id', (req: any, res) => {
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role === 'CITIZEN' && complaint.citizenId !== req.user.id) return res.status(403).json({ error: 'Not your complaint' });
    if (req.user.role === 'WORKER' && complaint.officerId !== getWorkerProfile(req.user)?.id) return res.status(403).json({ error: 'Not assigned to you' });
    res.json(complaint);
  });

  // Duplicate check preview before final submission
  app.post('/api/complaints/duplicate-check', (req, res) => {
    const { latitude, longitude, text, audioTranscript } = req.body || {};
    const result = agentOrchestrator.checkDuplicates(
      Number(latitude),
      Number(longitude),
      `${text || ''} ${audioTranscript || ''}`.trim()
    );
    res.json({
      isDuplicate: result.isDuplicate,
      matchedComplaint: result.matchedComplaint
        ? {
            complaintNumber: result.matchedComplaint.complaintNumber,
            issueType: result.matchedComplaint.issueType,
            status: result.matchedComplaint.status,
            address: result.matchedComplaint.address,
          }
        : null,
    });
  });

  // Citizen Complaint Submission through Agent Orchestrator
  app.post('/api/complaints', requireRole('CITIZEN'), async (req: any, res) => {
    try {
      const result = await agentOrchestrator.processNewComplaint(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      console.error('Complaint intake error:', err);
      res.status(500).json({ error: err.message || 'Failed to process complaint' });
    }
  });

  // Worker lifecycle actions are explicit endpoints so the UI cannot silently
  // jump between arbitrary states. Each action verifies the authenticated
  // worker owns the assignment and returns a useful error to the UI.
  app.post('/api/complaints/:id/accept', requireRole('WORKER'), (req: any, res) => {
    const complaint = db.getComplaintById(req.params.id);
    const worker = getWorkerProfile(req.user);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (!worker || complaint.officerId !== worker.id) return res.status(403).json({ error: 'This task is not assigned to you' });
    const updated = db.workerAcceptTask(req.params.id, worker.name);
    if (!updated) return res.status(409).json({ error: 'Task can only be accepted while it is assigned.' });
    res.json(updated);
  });

  app.post('/api/complaints/:id/start', requireRole('WORKER'), (req: any, res) => {
    const complaint = db.getComplaintById(req.params.id);
    const worker = getWorkerProfile(req.user);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (!worker || complaint.officerId !== worker.id) return res.status(403).json({ error: 'This task is not assigned to you' });
    const updated = db.workerStartTask(req.params.id, worker.name);
    if (!updated) return res.status(409).json({ error: 'Accept the task before starting work.' });
    res.json(updated);
  });

  // Legacy status endpoint retained for other supervisor flows, but workers
  // must use the explicit accept/start endpoints above.
  app.put('/api/complaints/:id/status', (req: any, res) => {
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role === 'WORKER') return res.status(400).json({ error: 'Use the Accept Task or Start Work action.' });
    if (req.user.role === 'CITIZEN') return res.status(403).json({ error: 'Citizens use the verification action' });
    const { status, reason } = req.body;
    const updated = db.updateComplaintStatus(req.params.id, status, req.user.name, req.user.role, reason);
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });
    res.json(updated);
  });

  // Assign Officer / Department
  app.put('/api/complaints/:id/assign', requireRole('SUPERVISOR'), (req, res) => {
    const { officerId, departmentId, assignedBy } = req.body;
    const updated = db.assignOfficer(req.params.id, officerId, departmentId, assignedBy || 'Admin');
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(updated);
  });


  // Supervisor assigns a worker and notifies that worker.
  app.put('/api/complaints/:id/assign-worker', requireRole('SUPERVISOR'), (req: any, res) => {
    const { workerId, supervisorName } = req.body || {};
    const updated = db.assignOfficer(req.params.id, workerId, req.body?.departmentId, supervisorName || req.user.name);
    if (!updated) return res.status(404).json({ error: 'Complaint or worker not found' });
    res.json(updated);
  });

  // Worker submits completion evidence for supervisor review.
  app.post('/api/complaints/:id/evidence', requireRole('WORKER'), (req: any, res) => {
    const { evidenceItem, notes } = req.body || {};
    const updated = db.addResolutionEvidence(req.params.id, evidenceItem || {}, notes || 'Work completed in the field.', req.user.name);
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });
    res.json(updated);
  });

  // Supervisor approves completion and notifies the reporting citizen.
  app.post('/api/complaints/:id/approve-completion', requireRole('SUPERVISOR'), (req: any, res) => {
    const updated = db.approveCompletion(req.params.id, req.user.name, req.body?.notes);
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });
    res.json(updated);
  });

  // Supervisor sends the task back to a worker.
  app.post('/api/complaints/:id/reassign-worker', requireRole('SUPERVISOR'), (req: any, res) => {
    const updated = db.reassignWorker(req.params.id, req.body?.workerId, req.user.name, req.body?.reason);
    if (!updated) return res.status(404).json({ error: 'Complaint or worker not found' });
    res.json(updated);
  });

  // Escalate
  app.post('/api/complaints/:id/escalate', (req, res) => {
    const { reason, level, triggeredBy, operatorName } = req.body;
    const updated = db.escalateComplaint(
      req.params.id,
      reason || 'Escalation triggered by authority',
      Number(level) as 1 | 2 | 3 || 2,
      triggeredBy || 'SUPERVISOR_OVERRIDE',
      operatorName || 'Supervisor'
    );
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(updated);
  });

  // Citizen Verification
  app.post('/api/complaints/:id/verify', requireRole('CITIZEN'), (req, res) => {
    const { confirmed, rating, feedback, reopenReason } = req.body;
    const updated = db.verifyResolution(req.params.id, confirmed, rating, feedback, reopenReason);
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(updated);
  });

  // Admin AI Decision Override
  app.post('/api/complaints/:id/override', requireRole('SUPERVISOR'), (req: any, res) => {
    const { category, severity, departmentId, reason, adminName } = req.body;
    const updated = db.adminOverride(req.params.id, {
      category,
      severity,
      departmentId,
      reason: reason || 'Administrative decision adjustment',
      adminName: adminName || 'Admin',
    });
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(updated);
  });

  // 4. AI Endpoints
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { text, imageBase64, imageMimeType, locationHint } = req.body;
      const analysis = await analyzeComplaintWithAI(text, imageBase64, imageMimeType, locationHint);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI analysis failed' });
    }
  });

  app.get('/api/ai/insights', async (req, res) => {
    try {
      const analytics = db.getAnalytics();
      const insights = await generateCivicInsightsAI(analytics);
      res.json({ insights });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate insights' });
    }
  });

  // 5. Reverse Geocode helper (simulated + OpenStreetMap reverse nominatim fallback)
  app.post('/api/location/reverse-geocode', async (req, res) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    try {
      const fetchRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: { 'User-Agent': 'CivicResolve-Hackathon-Agent' },
        }
      );
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        return res.json({
          address: data.display_name || `Near Coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          landmark: data.address?.amenity || data.address?.road || 'Main Road',
          zone: data.address?.suburb || data.address?.city_district || 'Municipal Ward',
        });
      }
    } catch (e) {
      // Fallback
    }

    res.json({
      address: `Ward 14, Near Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      landmark: 'Near Municipal Junction',
      zone: 'Central Zone',
    });
  });

  // 6. Analytics, Traces & Audit
  app.get('/api/analytics', (req, res) => {
    res.json(db.getAnalytics());
  });

  app.get('/api/agent-traces', (req, res) => {
    const { complaintId } = req.query;
    if (complaintId) {
      const filtered = db.agentActions.filter((a) => a.complaintId === complaintId);
      return res.json(filtered);
    }
    res.json(db.agentActions);
  });

  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  app.get('/api/notifications', (req: any, res) => {
    const list = db.notifications.filter(n => (!n.userId || n.userId === req.user.id) && (!n.targetRole || n.targetRole === 'ALL' || n.targetRole === req.user.role));
    res.json(list);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  // 7. SLA Sentinel Check & Demo Triggers
  app.post('/api/sla/check', (req, res) => {
    const result = agentOrchestrator.runSlaSentinel();
    res.json(result);
  });

  app.post('/api/demo/scenario', (req, res) => {
    const { scenario } = req.body;
    const result = agentOrchestrator.triggerDemoScenario(scenario);
    res.json({ success: true, complaint: result });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Autonomous unresolved-complaint monitoring. The sentinel runs independently
  // of the UI so SLA warnings, follow-ups, and escalations do not depend on a user
  // manually opening the dashboard.
  const sentinelTimer = setInterval(() => {
    const result = agentOrchestrator.runSlaSentinel();
    if (result.breached || result.escalated) {
      console.log('[SLA Sentinel]', result);
    }
  }, 60_000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve AI Agentic Server running on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => clearInterval(sentinelTimer));
  process.on('SIGINT', () => clearInterval(sentinelTimer));
}

startServer();
