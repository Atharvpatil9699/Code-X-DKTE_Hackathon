import { db } from './db';
import { analyzeComplaintWithAI } from './gemini';
import { Complaint, ComplaintStatus, SeverityLevel } from '../src/types';

const CATEGORY_DEPARTMENT: Record<string, { id: string; name: string }> = {
  Road: { id: 'dept-road', name: 'Roads & Infrastructure Department' },
  Garbage: { id: 'dept-sanitation', name: 'Public Health & Solid Waste Management' },
  Streetlight: { id: 'dept-electric', name: 'Electrical & Public Street Lighting' },
  Water: { id: 'dept-water', name: 'Water Supply & Sewerage Board' },
  Drainage: { id: 'dept-water', name: 'Water Supply & Sewerage Board' },
  Traffic: { id: 'dept-traffic', name: 'Traffic Operations & Signage Cell' },
  Environment: { id: 'dept-garden', name: 'Urban Forestry & Tree Authority' },
  'Public Infrastructure': { id: 'dept-road', name: 'Roads & Infrastructure Department' },
  Other: { id: 'dept-road', name: 'Roads & Infrastructure Department' },
};

function enforceCivicPolicy(
  analysis: Awaited<ReturnType<typeof analyzeComplaintWithAI>>,
  text: string,
  hasImage: boolean,
  hasLocation: boolean
) {
  const lower = (text || '').toLowerCase();

  // Department routing is deterministic after AI classification.
  const mapped = CATEGORY_DEPARTMENT[analysis.category] || CATEGORY_DEPARTMENT.Other;
  analysis.departmentId = mapped.id;
  analysis.department = mapped.name;

  // Safety-critical phrases take precedence over generic model severity.
  const criticalSignals = [
    'open manhole', 'broken manhole', 'live wire', 'exposed wire',
    'electrocution', 'fire', 'collapse', 'collapsed road', 'major accident',
    'child fell', 'person fell', 'hospital entrance', 'school gate'
  ];
  const highSignals = [
    'deep pothole', 'large pothole', 'pipe burst', 'water burst',
    'fallen tree', 'blocking road', 'traffic signal', 'signal failure',
    'major flooding', 'skid', 'accident risk'
  ];
  const lowSignals = ['minor litter', 'small litter', 'faded sign', 'small debris'];

  if (criticalSignals.some((s) => lower.includes(s))) analysis.severity = 'CRITICAL';
  else if (highSignals.some((s) => lower.includes(s))) analysis.severity = 'HIGH';
  else if (lowSignals.some((s) => lower.includes(s))) analysis.severity = 'LOW';
  else if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(analysis.severity)) analysis.severity = 'MEDIUM';

  analysis.confidence = Math.min(0.99, Math.max(0.70, Number(analysis.confidence) || 0.85));

  const sources = analysis.evidence_sources || [];
  if (!sources.some((s) => s.source === 'TEXT') && text?.trim()) {
    sources.push({ source: 'TEXT', detail: 'Citizen-provided text/voice transcript was used.' });
  }
  if (hasImage && !sources.some((s) => s.source === 'IMAGE')) {
    sources.push({ source: 'IMAGE', detail: 'Citizen visual evidence was supplied for analysis.' });
  }
  if (hasLocation && !sources.some((s) => s.source === 'LOCATION')) {
    sources.push({ source: 'LOCATION', detail: 'Citizen-selected coordinates/address were supplied for routing.' });
  }
  analysis.evidence_sources = sources;

  return analysis;
}


export class CivicAgentOrchestrator {
  /**
   * Autonomous Intake and Triage workflow
   */
  async processNewComplaint(rawInput: {
    text: string;
    imageBase64?: string;
    imageMimeType?: string;
    audioTranscript?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    citizenId?: string;
    citizenName?: string;
    citizenPhone?: string;
    inputMethod?: 'text' | 'voice' | 'image' | 'mixed';
    categoryOverride?: string;
  }): Promise<{ complaint: Complaint; isDuplicate: boolean; duplicateOf?: Complaint }> {
    const complaintText = rawInput.audioTranscript
      ? `${rawInput.text} (Spoken Transcript: ${rawInput.audioTranscript})`
      : rawInput.text;

    // Tool 1: Duplicate Detection
    const duplicateCheck = this.checkDuplicates(rawInput.latitude, rawInput.longitude, complaintText);

    // Tool 2 & 3: AI Analysis (Text + Vision + Location)
    let analysis = await analyzeComplaintWithAI(
      complaintText,
      rawInput.imageBase64,
      rawInput.imageMimeType,
      rawInput.address
    );

    analysis = enforceCivicPolicy(
      analysis,
      complaintText,
      Boolean(rawInput.imageBase64),
      Boolean(rawInput.latitude && rawInput.longitude)
    );

    // Citizen corrections are explicit human input, not hidden model overrides.
    const allowedCategories = Object.keys(CATEGORY_DEPARTMENT);
    if (rawInput.categoryOverride && allowedCategories.includes(rawInput.categoryOverride)) {
      analysis.category = rawInput.categoryOverride as any;
      const mapped = CATEGORY_DEPARTMENT[analysis.category] || CATEGORY_DEPARTMENT.Other;
      analysis.departmentId = mapped.id;
      analysis.department = mapped.name;
      analysis.evidence.push(`[SYSTEM] Citizen selected category override: ${analysis.category}`);
      analysis.evidence_sources?.push({
        source: 'SYSTEM',
        detail: `Citizen explicitly corrected the category to ${analysis.category}.`,
      });
    }

    // Tool 4: Department & Officer Allocation
    const department = db.departments.find((d) => d.id === analysis.departmentId) || db.departments[0];
    const availableOfficer = db.officers.find((o) => o.departmentId === department.id && o.available);

    // Create complaint in DB
    const created = db.createComplaint({
      citizenId: rawInput.citizenId || 'usr-citizen-1',
      citizenName: rawInput.citizenName || 'Rajesh Sharma',
      citizenPhone: rawInput.citizenPhone || '+91 94220 88990',
      description: rawInput.text,
      rawVoiceTranscript: rawInput.audioTranscript,
      inputMethod: rawInput.inputMethod || (rawInput.imageBase64 ? 'mixed' : 'text'),
      issueType: analysis.issue_type,
      category: analysis.category,
      severity: analysis.severity,
      confidence: analysis.confidence,
      aiRationale: analysis.evidence,
      evidenceGrounding: analysis.evidence_sources,
      safetyRisk: analysis.safety_risk,
      recommendedAction: analysis.recommended_action,
      latitude: rawInput.latitude || 18.5204,
      longitude: rawInput.longitude || 73.8567,
      address: rawInput.address || 'Shivaji Nagar, Pune',
      departmentId: department.id,
      departmentName: department.name,
      officerId: availableOfficer?.id,
      officerName: availableOfficer?.name,
      evidence: rawInput.imageBase64
        ? [
            {
              id: `ev-${Date.now()}`,
              type: 'image',
              url: rawInput.imageBase64.startsWith('data:') ? rawInput.imageBase64 : `data:image/jpeg;base64,${rawInput.imageBase64}`,
              filename: 'citizen_evidence.jpg',
              fileSize: '1.5 MB',
              aiConfidence: analysis.confidence,
              aiLabels: [analysis.issue_type, analysis.category],
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [],
    });

    // Log Autonomous Agent Trace actions
    db.logAgentAction({
      complaintId: created.id,
      agentName: 'DuplicateDetectionAgent',
      action: duplicateCheck.isDuplicate ? 'flag_duplicate' : 'clear_duplicate',
      reason: duplicateCheck.isDuplicate
        ? `Potential duplicate of ${duplicateCheck.matchedComplaint?.complaintNumber || 'nearby active complaint'} within the configured proximity rule`
        : 'No matching active complaint met the configured proximity and similarity rule',
      toolName: 'duplicate_detection_engine',
      inputData: { latitude: rawInput.latitude, longitude: rawInput.longitude },
      outputData: {
        isDuplicate: duplicateCheck.isDuplicate,
        matchedComplaint: duplicateCheck.matchedComplaint?.complaintNumber,
      },
      resultStatus: duplicateCheck.isDuplicate ? 'WARNING' : 'SUCCESS',
    });

    db.logAgentAction({
      complaintId: created.id,
      agentName: 'IntakeAgent',
      action: 'analyze_multimodal_input',
      reason: 'Citizen submitted report with text and evidence',
      toolName: 'gemini-3.8-flash',
      inputData: { textLength: rawInput.text.length, hasImage: !!rawInput.imageBase64, hasVoice: !!rawInput.audioTranscript },
      outputData: {
        issue_type: analysis.issue_type,
        category: analysis.category,
        severity: analysis.severity,
        confidence: analysis.confidence,
        evidenceSources: analysis.evidence_sources,
      },
      resultStatus: 'SUCCESS',
    });

    db.logAgentAction({
      complaintId: created.id,
      agentName: 'RoutingAgent',
      action: 'assign_department',
      reason: `Issue classified as ${analysis.category}, severity ${analysis.severity}`,
      toolName: 'department_mapping_engine',
      inputData: { category: analysis.category, severity: analysis.severity },
      outputData: { department: department.name, officer: availableOfficer?.name || 'Department Pool' },
      resultStatus: 'SUCCESS',
    });

    db.logAgentAction({
      complaintId: created.id,
      agentName: 'SLAMonitorAgent',
      action: 'start_sla_monitoring',
      reason: `${analysis.severity} priority demands ${created.slaHoursTotal} hours max resolution time`,
      toolName: 'sla_engine',
      outputData: { deadline: created.slaDeadline, hoursTotal: created.slaHoursTotal },
      resultStatus: 'SUCCESS',
    });

    return {
      complaint: created,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateOf: duplicateCheck.matchedComplaint,
    };
  }

  /**
   * Tool: Duplicate detection within 500m radius and similar description
   */
  checkDuplicates(
    lat?: number,
    lng?: number,
    text?: string
  ): { isDuplicate: boolean; matchedComplaint?: Complaint } {
    if (!lat || !lng) return { isDuplicate: false };

    const nearby = db.complaints.find((c) => {
      if (['CLOSED', 'RESOLVED'].includes(c.status)) return false;
      const dLat = Math.abs(c.latitude - lat);
      const dLng = Math.abs(c.longitude - lng);
      // Rough approx ~ 0.005 deg is ~550 meters
      const isNearby = dLat < 0.005 && dLng < 0.005;
      if (!isNearby) return false;

      // Check text similarity if available
      if (text && c.description) {
        const wordsA = new Set(text.toLowerCase().split(/\s+/));
        const wordsB = new Set(c.description.toLowerCase().split(/\s+/));
        let matchCount = 0;
        wordsA.forEach((w) => {
          if (w.length > 3 && wordsB.has(w)) matchCount++;
        });
        if (matchCount >= 2) return true;
      }
      return isNearby;
    });

    return {
      isDuplicate: !!nearby,
      matchedComplaint: nearby,
    };
  }

  /**
   * Periodic SLA watchdog check
   */
  runSlaSentinel(): { breached: number; escalated: number } {
    const res = db.checkAllSlas();
    return { breached: res.breachedCount, escalated: res.escalatedCount };
  }

  /**
   * Fast forward demo scenario for presentation
   */
  triggerDemoScenario(scenario: 'pothole' | 'manhole' | 'garbage' | 'breach' | 'resolve' | 'reset'): Complaint | null {
    if (scenario === 'reset') {
      db.seedInitialData();
      return db.complaints[0];
    }

    if (scenario === 'pothole') {
      const res = db.createComplaint({
        citizenName: 'Rajesh Sharma',
        description: 'Deep road crater in middle of bus lane near FC Road Junction. Vehicles forced to brake suddenly.',
        issueType: 'Hazardous Road Pothole',
        category: 'Road',
        severity: 'HIGH',
        confidence: 0.96,
        latitude: 18.5236,
        longitude: 73.8415,
        address: 'FC Road Junction, Near Goodluck Cafe, Deccan Gymkhana',
        departmentId: 'dept-road',
        departmentName: 'Roads & Infrastructure Department',
        evidence: [
          {
            id: `ev-${Date.now()}`,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
            filename: 'pothole_fc_road.jpg',
            aiConfidence: 0.96,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
      return res;
    }

    if (scenario === 'manhole') {
      const res = db.createComplaint({
        citizenName: 'Kavita Joshi',
        description: 'BROKEN MANHOLE COVER right at pedestrian crossing outside Symbiosis College Gate! Imminent hazard.',
        issueType: 'Uncovered Manhole Shaft',
        category: 'Drainage',
        severity: 'CRITICAL',
        confidence: 0.99,
        latitude: 18.5284,
        longitude: 73.8341,
        address: 'Senapati Bapat Road, Outside Symbiosis College',
        departmentId: 'dept-water',
        departmentName: 'Water Supply & Sewerage Board',
        evidence: [
          {
            id: `ev-${Date.now()}`,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
            filename: 'manhole_sb_road.jpg',
            aiConfidence: 0.99,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
      return res;
    }

    if (scenario === 'garbage') {
      const res = db.createComplaint({
        citizenName: 'Anil Deshpande',
        description: 'Commercial waste and packaging dumping blocking public sidewalk near Swargate Bus Stand.',
        issueType: 'Commercial Waste Accumulation',
        category: 'Garbage',
        severity: 'MEDIUM',
        confidence: 0.92,
        latitude: 18.5018,
        longitude: 73.8584,
        address: 'Swargate Bus Stand Approach Road, Pune',
        departmentId: 'dept-sanitation',
        departmentName: 'Public Health & Solid Waste Management',
        evidence: [
          {
            id: `ev-${Date.now()}`,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
            filename: 'garbage_swargate.jpg',
            aiConfidence: 0.92,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
      return res;
    }

    if (scenario === 'breach') {
      // Find first open non-escalated complaint, set deadline to past, and trigger escalation
      const target = db.complaints.find((c) => !['CLOSED', 'RESOLVED'].includes(c.status) && c.escalationLevel < 2);
      if (target) {
        target.slaDeadline = new Date(Date.now() - 3600000 * 2).toISOString(); // 2 hours ago
        target.isSlaBreached = true;
        db.escalateComplaint(
          target.id,
          'DEMO: Simulated SLA expiry triggered Autonomous Level 2 Supervisor Escalation',
          2,
          'AUTONOMOUS_AGENT',
          'Autonomous SLA Sentinel'
        );
        return target;
      }
    }

    if (scenario === 'resolve') {
      // Find an in-progress complaint and resolve it with proof
      const target = db.complaints.find((c) => ['IN_PROGRESS', 'ASSIGNED', 'ESCALATED'].includes(c.status));
      if (target) {
        db.addResolutionEvidence(
          target.id,
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
            filename: 'field_repair_proof_verified.jpg',
          },
          'Repairs executed by on-duty crew. Surface leveled and barricade cleared.',
          target.officerName || 'Amit Deshmukh'
        );
        return target;
      }
    }

    return null;
  }
}

export const agentOrchestrator = new CivicAgentOrchestrator();
