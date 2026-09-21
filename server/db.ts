import {
  Complaint,
  Department,
  Officer,
  User,
  AgentActionLog,
  NotificationItem,
  AuditLogItem,
  AnalyticsSummary,
  ComplaintStatus,
  SeverityLevel,
  IssueCategory,
} from '../src/types';

// Mock DB state
class CivicDatabase {
  users: User[] = [];
  departments: Department[] = [];
  officers: Officer[] = [];
  complaints: Complaint[] = [];
  agentActions: AgentActionLog[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: AuditLogItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Departments
    this.departments = [
      {
        id: 'dept-road',
        name: 'Roads & Infrastructure Department',
        code: 'ROADS',
        officersCount: 4,
        activeComplaints: 3,
        supervisorName: 'Er. Sunil Shinde',
        supervisorEmail: 'sunil.shinde@civicresolve.gov.in',
        phone: '+91 20 2550 1101',
      },
      {
        id: 'dept-sanitation',
        name: 'Public Health & Solid Waste Management',
        code: 'SANITA',
        officersCount: 6,
        activeComplaints: 2,
        supervisorName: 'Dr. Meera Joshi',
        supervisorEmail: 'meera.joshi@civicresolve.gov.in',
        phone: '+91 20 2550 1102',
      },
      {
        id: 'dept-water',
        name: 'Water Supply & Sewerage Board',
        code: 'WATER',
        officersCount: 5,
        activeComplaints: 2,
        supervisorName: 'Sunita Patil',
        supervisorEmail: 'sunita.patil@civicresolve.gov.in',
        phone: '+91 20 2550 1103',
      },
      {
        id: 'dept-electric',
        name: 'Electrical & Public Street Lighting',
        code: 'ELECT',
        officersCount: 3,
        activeComplaints: 1,
        supervisorName: 'Mahesh Gaikwad',
        supervisorEmail: 'mahesh.gaikwad@civicresolve.gov.in',
        phone: '+91 20 2550 1104',
      },
      {
        id: 'dept-traffic',
        name: 'Traffic Operations & Signage Cell',
        code: 'TRAF',
        officersCount: 2,
        activeComplaints: 1,
        supervisorName: 'ACP Sanjay More',
        supervisorEmail: 'sanjay.more@civicresolve.gov.in',
        phone: '+91 20 2550 1105',
      },
      {
        id: 'dept-garden',
        name: 'Urban Forestry & Tree Authority',
        code: 'TREES',
        officersCount: 2,
        activeComplaints: 1,
        supervisorName: 'Nitin Kadam',
        supervisorEmail: 'nitin.kadam@civicresolve.gov.in',
        phone: '+91 20 2550 1106',
      },
    ];

    // 2. Officers
    this.officers = [
      {
        id: 'off-1',
        name: 'Amit Deshmukh',
        email: 'amit.deshmukh@civicresolve.gov.in',
        phone: '+91 98220 12345',
        departmentId: 'dept-road',
        departmentName: 'Roads & Infrastructure Department',
        activeTasks: 2,
        available: true,
      },
      {
        id: 'off-2',
        name: 'Priya Kulkarni',
        email: 'priya.kulkarni@civicresolve.gov.in',
        phone: '+91 98220 23456',
        departmentId: 'dept-sanitation',
        departmentName: 'Public Health & Solid Waste Management',
        activeTasks: 1,
        available: true,
      },
      {
        id: 'off-3',
        name: 'Ramesh Patil',
        email: 'ramesh.patil@civicresolve.gov.in',
        phone: '+91 98220 34567',
        departmentId: 'dept-water',
        departmentName: 'Water Supply & Sewerage Board',
        activeTasks: 2,
        available: true,
      },
      {
        id: 'off-4',
        name: 'Ganesh Shinde',
        email: 'ganesh.shinde@civicresolve.gov.in',
        phone: '+91 98220 45678',
        departmentId: 'dept-electric',
        departmentName: 'Electrical & Public Street Lighting',
        activeTasks: 1,
        available: true,
      },
    ];

    // 3. Predefined Users
    this.users = [
      {
        id: 'usr-citizen-1',
        name: 'Rajesh Sharma',
        email: 'citizen@civicresolve.org',
        phone: '+91 94220 88990',
        role: 'CITIZEN',
        preferredLanguage: 'English / Marathi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-officer-1',
        name: 'Amit Deshmukh (Field Worker)',
        email: 'officer@civicresolve.org',
        phone: '+91 98220 12345',
        role: 'WORKER',
        departmentId: 'dept-road',
        departmentName: 'Roads & Infrastructure Department',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-supervisor-1',
        name: 'Sunita Patil (Division Supervisor)',
        email: 'supervisor@civicresolve.org',
        phone: '+91 98220 77889',
        role: 'SUPERVISOR',
        departmentId: 'dept-water',
        departmentName: 'Water Supply & Sewerage Board',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },

    ];

    const now = new Date();
    const isoHoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
    const isoHoursAhead = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

    // 4. Sample Complaints
    this.complaints = [
      {
        id: 'c-1',
        complaintNumber: 'CIV-2026-0001',
        citizenId: 'usr-citizen-1',
        citizenName: 'Rajesh Sharma',
        citizenPhone: '+91 94220 88990',
        description: 'Large hazardous pothole right in front of the main College Gate. Two two-wheelers already skidded yesterday during evening rain.',
        rawVoiceTranscript: 'College gate javal mottha khadda padla ahe, gadya padnyachi bhiti ahe.',
        inputMethod: 'mixed',
        issueType: 'Pothole & Surface Damage',
        category: 'Road',
        severity: 'HIGH',
        confidence: 0.94,
        aiRationale: [
          'Vision model detected deep crater in asphalt (~45cm depth estimate)',
          'Proximity to heavy transit student gateway and bus stop',
          'Citizen reported multiple vehicle skidding incidents'
        ],
        safetyRisk: 'High accident probability for two-wheelers and night cyclists',
        recommendedAction: 'Deploy asphalt cold-mix patch team with reflective safety barricades within 24h',
        latitude: 18.5314,
        longitude: 73.8446,
        address: 'College Road, Near Main University Gate, Shivaji Nagar',
        landmark: 'Near University Gate No. 2',
        areaZone: 'Central Zone - Ward 14',
        departmentId: 'dept-road',
        departmentName: 'Roads & Infrastructure Department',
        officerId: undefined,
        officerName: undefined,
        status: 'CLASSIFIED',
        slaHoursTotal: 24,
        slaStartTime: isoHoursAgo(8),
        slaDeadline: isoHoursAhead(16),
        isSlaBreached: false,
        isSlaWarning: false,
        escalationLevel: 1,
        evidence: [
          {
            id: 'ev-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
            filename: 'pothole_college_road.jpg',
            fileSize: '2.4 MB',
            aiConfidence: 0.94,
            aiLabels: ['damaged asphalt', 'pothole', 'road defect', 'water accumulation'],
            uploadedAt: isoHoursAgo(8),
          },
        ],
        statusHistory: [
          {
            id: 'sh-1',
            newStatus: 'SUBMITTED',
            changedBy: 'Rajesh Sharma',
            role: 'CITIZEN',
            reason: 'Complaint lodged via multi-modal voice & photo input',
            timestamp: isoHoursAgo(8),
          },
          {
            id: 'sh-2',
            oldStatus: 'SUBMITTED',
            newStatus: 'CLASSIFIED',
            changedBy: 'Civic AI Agent (Autonomous)',
            role: 'SYSTEM',
            reason: 'Categorized as Road (Pothole), HIGH severity, 94% confidence',
            timestamp: isoHoursAgo(7.9),
          },
        ],
        agentActions: [
          {
            id: 'act-1',
            complaintId: 'c-1',
            timestamp: isoHoursAgo(7.95),
            agentName: 'IntakeAgent',
            action: 'transcribe_voice',
            reason: 'Multilingual audio stream detected',
            toolName: 'gemini-3.5-transcribe',
            inputData: { audioSize: '1.2MB', languageHint: 'mr/en' },
            outputData: { transcript: 'College gate javal mottha khadda padla ahe, gadya padnyachi bhiti ahe.' },
            resultStatus: 'SUCCESS',
          },
          {
            id: 'act-2',
            complaintId: 'c-1',
            timestamp: isoHoursAgo(7.9),
            agentName: 'VisionAgent',
            action: 'analyze_image',
            reason: 'Verify citizen photo evidence',
            toolName: 'gemini-3.8-flash-vision',
            inputData: { image: 'pothole_college_road.jpg' },
            outputData: { issue_type: 'pothole', confidence: 0.94, severity: 'HIGH' },
            resultStatus: 'SUCCESS',
          },
          {
            id: 'act-3',
            complaintId: 'c-1',
            timestamp: isoHoursAgo(7.85),
            agentName: 'RoutingAgent',
            action: 'find_department',
            reason: 'Map Road category to municipal infrastructure pool',
            toolName: 'department_mapping_engine',
            inputData: { category: 'Road', zone: 'Central Zone' },
            outputData: { departmentId: 'dept-road', officerId: 'off-1' },
            resultStatus: 'SUCCESS',
          },
          {
            id: 'act-4',
            complaintId: 'c-1',
            timestamp: isoHoursAgo(7.8),
            agentName: 'SLAMonitorAgent',
            action: 'start_sla_monitoring',
            reason: 'HIGH severity demands 24-hour closure SLA',
            toolName: 'sla_engine',
            inputData: { severity: 'HIGH', maxHours: 24 },
            outputData: { deadline: isoHoursAhead(16), alertThreshold: '4h before breach' },
            resultStatus: 'SUCCESS',
          },
        ],
        escalations: [],
        createdAt: isoHoursAgo(8),
        updatedAt: isoHoursAgo(2),
      },
      {
        id: 'c-2',
        complaintNumber: 'CIV-2026-0002',
        citizenId: 'usr-citizen-1',
        citizenName: 'Rajesh Sharma',
        description: 'Large community garbage container overflowing for 4 days on Vegetable Market Lane. Stray cattle and foul odor affecting shopkeepers.',
        inputMethod: 'image',
        issueType: 'Solid Waste & Overflowing Dumpster',
        category: 'Garbage',
        severity: 'MEDIUM',
        confidence: 0.91,
        aiRationale: [
          'Organic wet waste spilling over secondary sidewalk',
          'Commercial market zone with heavy footfall during morning hours'
        ],
        safetyRisk: 'Public health sanitation hazard and bacterial contamination',
        recommendedAction: 'Dispatch hydraulic compactor truck and apply bleaching powder wash',
        latitude: 18.5204,
        longitude: 73.8567,
        address: 'Vegetable Market Lane, Near Subhash Chowk, Ravivar Peth',
        landmark: 'Opposite Wholesale Grain Merchant',
        areaZone: 'East Zone - Ward 08',
        departmentId: 'dept-sanitation',
        departmentName: 'Public Health & Solid Waste Management',
        officerId: 'off-2',
        officerName: 'Priya Kulkarni',
        status: 'CITIZEN_VERIFICATION',
        slaHoursTotal: 48,
        slaStartTime: isoHoursAgo(28),
        slaDeadline: isoHoursAhead(20),
        isSlaBreached: false,
        isSlaWarning: false,
        escalationLevel: 1,
        evidence: [
          {
            id: 'ev-2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
            filename: 'garbage_dump_market.jpg',
            fileSize: '1.8 MB',
            aiConfidence: 0.91,
            aiLabels: ['garbage', 'waste accumulation', 'plastic waste', 'dumpster'],
            uploadedAt: isoHoursAgo(28),
          },
        ],
        resolutionEvidence: [
          {
            id: 'ev-2-res',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
            filename: 'dumpster_cleared_disinfected.jpg',
            fileSize: '2.1 MB',
            isResolutionProof: true,
            aiConfidence: 0.96,
            aiLabels: ['clean sidewalk', 'cleared dumpster', 'disinfected zone'],
            uploadedAt: isoHoursAgo(1),
          },
        ],
        resolutionNotes: 'Bin emptied via Compactor Vehicle MH-12-FC-4491. 25kg lime disinfectant spread across perimeter.',
        resolvedAt: isoHoursAgo(1),
        statusHistory: [
          {
            id: 'sh-21',
            newStatus: 'SUBMITTED',
            changedBy: 'Rajesh Sharma',
            role: 'CITIZEN',
            timestamp: isoHoursAgo(28),
          },
          {
            id: 'sh-22',
            newStatus: 'RESOLVED',
            changedBy: 'Priya Kulkarni',
            role: 'WORKER',
            reason: 'Solid waste cleared and photo proof attached',
            timestamp: isoHoursAgo(1),
          },
          {
            id: 'sh-23',
            newStatus: 'CITIZEN_VERIFICATION',
            changedBy: 'Civic AI Agent (Autonomous)',
            role: 'SYSTEM',
            reason: 'Awaiting citizen closure verification prompt',
            timestamp: isoHoursAgo(0.9),
          },
        ],
        agentActions: [
          {
            id: 'act-21',
            complaintId: 'c-2',
            timestamp: isoHoursAgo(27.9),
            agentName: 'VisionAgent',
            action: 'analyze_image',
            reason: 'Classify waste accumulation volume',
            toolName: 'gemini-3.8-flash',
            outputData: { category: 'Garbage', severity: 'MEDIUM' },
            resultStatus: 'SUCCESS',
          },
          {
            id: 'act-22',
            complaintId: 'c-2',
            timestamp: isoHoursAgo(1),
            agentName: 'VerificationAgent',
            action: 'analyze_resolution_evidence',
            reason: 'Validate before-and-after photo consistency',
            toolName: 'evidence_comparison_engine',
            outputData: { match: true, clearanceVerified: true, score: 0.96 },
            resultStatus: 'SUCCESS',
          },
        ],
        escalations: [],
        createdAt: isoHoursAgo(28),
        updatedAt: isoHoursAgo(1),
      },
      {
        id: 'c-3',
        complaintNumber: 'CIV-2026-0003',
        citizenId: 'usr-citizen-1',
        citizenName: 'Kavita Joshi',
        citizenPhone: '+91 98900 11223',
        description: 'OPEN MANHOLE WITH BROKEN CONCRETE LID directly outside St. Xavier Primary School pedestrian walkway! Children are walking here right now!',
        inputMethod: 'text',
        issueType: 'Open Manhole & Severe Cavity',
        category: 'Drainage',
        severity: 'CRITICAL',
        confidence: 0.98,
        aiRationale: [
          'Direct fall hazard exceeding 3 meters into active stormwater drain',
          'Situated within 20 meters of elementary school gate during dismissal',
          'SLA 6 hours has elapsed without on-site resolution'
        ],
        safetyRisk: 'CRITICAL LIFE-SAFETY HAZARD. High mortality/injury risk for pedestrians & children.',
        recommendedAction: 'Immediate temporary steel plate placement + Level 2 Department Supervisor intervention',
        latitude: 18.5112,
        longitude: 73.8521,
        address: 'St. Xavier School Lane, Tilak Road Crossway, Sadashiv Peth',
        landmark: 'Opposite Primary Gate No. 1',
        areaZone: 'Central Zone - Ward 12',
        departmentId: 'dept-water',
        departmentName: 'Water Supply & Sewerage Board',
        officerId: 'off-3',
        officerName: 'Ramesh Patil',
        status: 'ESCALATED',
        slaHoursTotal: 6,
        slaStartTime: isoHoursAgo(9),
        slaDeadline: isoHoursAgo(3),
        isSlaBreached: true,
        isSlaWarning: true,
        escalationLevel: 2, // Escalated to Supervisor Sunita Patil
        evidence: [
          {
            id: 'ev-3',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
            filename: 'open_manhole_school.jpg',
            fileSize: '3.1 MB',
            aiConfidence: 0.98,
            aiLabels: ['manhole', 'broken concrete cover', 'deep cavity', 'hazard'],
            uploadedAt: isoHoursAgo(9),
          },
        ],
        statusHistory: [
          {
            id: 'sh-31',
            newStatus: 'SUBMITTED',
            changedBy: 'Kavita Joshi',
            role: 'CITIZEN',
            timestamp: isoHoursAgo(9),
          },
          {
            id: 'sh-32',
            newStatus: 'ASSIGNED',
            changedBy: 'Civic AI Agent (Priority FastTrack)',
            role: 'SYSTEM',
            reason: 'CRITICAL safety issue fast-tracked to Drainage Emergency Crew',
            timestamp: isoHoursAgo(8.9),
          },
          {
            id: 'sh-33',
            oldStatus: 'ASSIGNED',
            newStatus: 'SLA_BREACHED',
            changedBy: 'Autonomous SLA Sentinel',
            role: 'SYSTEM',
            reason: '6-Hour Critical SLA deadline expired with no field closure',
            timestamp: isoHoursAgo(3),
          },
          {
            id: 'sh-34',
            oldStatus: 'SLA_BREACHED',
            newStatus: 'ESCALATED',
            changedBy: 'Autonomous Escalation Agent',
            role: 'SYSTEM',
            reason: 'Triggered Level 2 Escalation to Division Supervisor Sunita Patil',
            timestamp: isoHoursAgo(2.8),
          },
        ],
        agentActions: [
          {
            id: 'act-31',
            complaintId: 'c-3',
            timestamp: isoHoursAgo(8.9),
            agentName: 'TriageAgent',
            action: 'calculate_severity',
            reason: 'School zone keyword + open manhole pattern triggered Critical rule',
            toolName: 'severity_engine',
            outputData: { severity: 'CRITICAL', slaHours: 6 },
            resultStatus: 'SUCCESS',
          },
          {
            id: 'act-32',
            complaintId: 'c-3',
            timestamp: isoHoursAgo(3),
            agentName: 'MonitoringAgent',
            action: 'check_sla',
            reason: 'Routine 15-minute SLA cycle detected breach',
            toolName: 'sla_monitor',
            outputData: { isBreached: true, elapsedHours: 6.1 },
            resultStatus: 'WARNING',
          },
          {
            id: 'act-33',
            complaintId: 'c-3',
            timestamp: isoHoursAgo(2.8),
            agentName: 'EscalationAgent',
            action: 'escalate_complaint',
            reason: 'SLA breached on Critical ticket without on-site resolution evidence',
            toolName: 'escalation_engine',
            inputData: { complaintId: 'c-3', targetLevel: 2 },
            outputData: { escalatedTo: 'Sunita Patil (Division Supervisor)', priority: 'URGENT_RED' },
            resultStatus: 'SUCCESS',
          },
        ],
        escalations: [
          {
            id: 'esc-1',
            complaintId: 'c-3',
            level: 2,
            escalatedTo: 'Sunita Patil (Division Supervisor)',
            reason: 'Critical SLA Breached by 3.2 hours without physical safety barrier confirmation',
            triggeredBy: 'AUTONOMOUS_AGENT',
            timestamp: isoHoursAgo(2.8),
            resolved: false,
          },
        ],
        createdAt: isoHoursAgo(9),
        updatedAt: isoHoursAgo(2.8),
      },
      {
        id: 'c-4',
        complaintNumber: 'CIV-2026-0004',
        citizenId: 'usr-citizen-1',
        citizenName: 'Rajesh Sharma',
        description: 'Cluster of 5 street lights out completely along the canal bypass road. Area is pitch dark and women commuters feel unsafe.',
        inputMethod: 'text',
        issueType: 'Dark Streetlight Corridor',
        category: 'Streetlight',
        severity: 'MEDIUM',
        confidence: 0.89,
        aiRationale: [
          'Multiple continuous fixtures defective along transit route',
          'Pedestrian safety and dark spot vulnerability'
        ],
        safetyRisk: 'Poor night visibility and risk of pedestrian bag-snatching',
        recommendedAction: 'Check feeder pillar circuit breaker #4 and replace LED luminaire modules',
        latitude: 18.5089,
        longitude: 73.8344,
        address: 'Mutha Canal Bypass Road, Near Dattawadi Bridge',
        landmark: 'Pole Numbers SL-112 to SL-116',
        areaZone: 'South Zone - Ward 19',
        departmentId: 'dept-electric',
        departmentName: 'Electrical & Public Street Lighting',
        officerId: 'off-4',
        officerName: 'Ganesh Shinde',
        status: 'CLASSIFIED',
        slaHoursTotal: 48,
        slaStartTime: isoHoursAgo(14),
        slaDeadline: isoHoursAhead(34),
        isSlaBreached: false,
        isSlaWarning: false,
        escalationLevel: 1,
        evidence: [],
        statusHistory: [
          {
            id: 'sh-41',
            newStatus: 'SUBMITTED',
            changedBy: 'Rajesh Sharma',
            role: 'CITIZEN',
            timestamp: isoHoursAgo(14),
          },
          {
            id: 'sh-42',
            newStatus: 'ASSIGNED',
            changedBy: 'Civic AI Agent',
            role: 'SYSTEM',
            timestamp: isoHoursAgo(13.8),
          },
        ],
        agentActions: [
          {
            id: 'act-41',
            complaintId: 'c-4',
            timestamp: isoHoursAgo(13.8),
            agentName: 'RoutingAgent',
            action: 'find_department',
            reason: 'Street lighting keywords mapped to Electrical cell',
            toolName: 'department_engine',
            outputData: { department: 'dept-electric', officer: 'Ganesh Shinde' },
            resultStatus: 'SUCCESS',
          },
        ],
        escalations: [],
        createdAt: isoHoursAgo(14),
        updatedAt: isoHoursAgo(13.8),
      },
      {
        id: 'c-5',
        complaintNumber: 'CIV-2026-0005',
        citizenId: 'usr-citizen-1',
        citizenName: 'Rajesh Sharma',
        description: 'Potable drinking water pipe fracture flooding pavement near Apollo Clinic.',
        inputMethod: 'image',
        issueType: 'Potable Water Pipeline Burst',
        category: 'Water',
        severity: 'HIGH',
        confidence: 0.95,
        aiRationale: [
          'High-pressure drinking water loss estimated at 120 liters/min',
          'Undermining road sub-base'
        ],
        safetyRisk: 'Subsurface soil erosion and water wastage during shortage period',
        recommendedAction: 'Isolate Sector 7 valve and clamp 150mm DI pipeline',
        latitude: 18.5398,
        longitude: 73.8321,
        address: 'Ganeshkhind Road, Outside Apollo Clinic, Model Colony',
        landmark: 'Opposite Model Colony Post Office',
        areaZone: 'West Zone - Ward 07',
        departmentId: 'dept-water',
        departmentName: 'Water Supply & Sewerage Board',
        officerId: 'off-3',
        officerName: 'Ramesh Patil',
        status: 'CLOSED',
        slaHoursTotal: 24,
        slaStartTime: isoHoursAgo(48),
        slaDeadline: isoHoursAgo(24),
        isSlaBreached: false,
        isSlaWarning: false,
        escalationLevel: 1,
        evidence: [
          {
            id: 'ev-5',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?w=800&auto=format&fit=crop&q=80',
            filename: 'water_leakage_street.jpg',
            fileSize: '2.0 MB',
            aiConfidence: 0.95,
            uploadedAt: isoHoursAgo(48),
          },
        ],
        resolutionEvidence: [
          {
            id: 'ev-5-res',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
            filename: 'pipeline_clamped_dry.jpg',
            fileSize: '1.9 MB',
            isResolutionProof: true,
            aiConfidence: 0.97,
            uploadedAt: isoHoursAgo(30),
          },
        ],
        resolutionNotes: 'Collar sleeve joint welded and road reinstated with wet gravel.',
        resolvedAt: isoHoursAgo(30),
        citizenFeedback: 'Prompt work by Junior Engineer Ramesh Patil! Flow was stopped within 3 hours. Satisfied.',
        citizenRating: 5,
        citizenConfirmed: true,
        statusHistory: [
          {
            id: 'sh-51',
            newStatus: 'SUBMITTED',
            changedBy: 'Rajesh Sharma',
            role: 'CITIZEN',
            timestamp: isoHoursAgo(48),
          },
          {
            id: 'sh-52',
            newStatus: 'RESOLVED',
            changedBy: 'Ramesh Patil',
            role: 'WORKER',
            timestamp: isoHoursAgo(30),
          },
          {
            id: 'sh-53',
            newStatus: 'CLOSED',
            changedBy: 'Rajesh Sharma (Verified in App)',
            role: 'CITIZEN',
            reason: 'Citizen validated repair with 5-star rating',
            timestamp: isoHoursAgo(26),
          },
        ],
        agentActions: [],
        escalations: [],
        createdAt: isoHoursAgo(48),
        updatedAt: isoHoursAgo(26),
      },
    ];

    // 5. Initial Notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-citizen-1',
        complaintId: 'c-1',
        complaintNumber: 'CIV-2026-0001',
        title: 'Work In Progress: College Road Pothole',
        message: 'Field Officer Amit Deshmukh is on-site with asphalt roller crew.',
        type: 'INFO',
        read: false,
        timestamp: isoHoursAgo(2),
      },
      {
        id: 'notif-2',
        userId: 'usr-citizen-1',
        complaintId: 'c-2',
        complaintNumber: 'CIV-2026-0002',
        title: 'Action Needed: Verify Issue Resolution',
        message: 'Sanitation Department has cleared Ravivar Peth garbage dump. Please verify to close.',
        type: 'RESOLUTION',
        read: false,
        timestamp: isoHoursAgo(1),
      },
      {
        id: 'notif-3',
        targetRole: 'SUPERVISOR',
        complaintId: 'c-3',
        complaintNumber: 'CIV-2026-0003',
        title: 'URGENT: Level 2 Escalation Triggered',
        message: 'Open Manhole at St. Xavier School breached 6-hour SLA! Escalated to Supervisor Sunita Patil.',
        type: 'ESCALATION',
        read: false,
        timestamp: isoHoursAgo(2.8),
      },
    ];

    // 6. Initial Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-supervisor-1',
        userName: 'Sunita Patil',
        userRole: 'SUPERVISOR',
        action: 'SYSTEM_BOOT',
        details: 'CivicResolve AI Agentic System initialized with 6 departments and 4 officers',
        timestamp: isoHoursAgo(48),
      },
      {
        id: 'aud-2',
        userId: 'system',
        userName: 'Autonomous SLA Sentinel',
        userRole: 'SUPERVISOR',
        action: 'ESCALATION_TRIGGER',
        details: 'Automated Level 2 escalation executed on ticket CIV-2026-0003 due to Critical SLA expiry',
        timestamp: isoHoursAgo(2.8),
      },
    ];
  }

  private getWorkerUserId(officerId: string): string | undefined {
    const officer = this.officers.find((o) => o.id === officerId);
    if (!officer) return undefined;
    return this.users.find((u) => u.role === 'WORKER' && u.email.toLowerCase() === officer.email.toLowerCase())?.id;
  }

  // --- CRUD METHODS ---
  getComplaints(filters?: {
    citizenId?: string;
    officerId?: string;
    role?: string;
    departmentId?: string;
    status?: string;
    severity?: string;
    category?: string;
    search?: string;
  }): Complaint[] {
    let list = [...this.complaints];

    if (filters?.citizenId) {
      list = list.filter((c) => c.citizenId === filters.citizenId);
    }
    if (filters?.officerId) {
      list = list.filter((c) => c.officerId === filters.officerId);
    }
    if (filters?.departmentId) {
      list = list.filter((c) => c.departmentId === filters.departmentId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'ALL') {
      list = list.filter((c) => c.severity === filters.severity);
    }
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((c) => c.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.complaintNumber.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.issueType.toLowerCase().includes(q)
      );
    }

    // Sort by created date descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find((c) => c.id === id || c.complaintNumber === id);
  }

  createComplaint(data: Partial<Complaint>): Complaint {
    const nextSeq = this.complaints.length + 1;
    const complaintNumber = `CIV-2026-${String(nextSeq).padStart(4, '0')}`;
    const id = `c-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const slaHours = data.severity === 'CRITICAL' ? 6 : data.severity === 'HIGH' ? 24 : data.severity === 'MEDIUM' ? 48 : 72;
    const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

    const complaint: Complaint = {
      id,
      complaintNumber,
      citizenId: data.citizenId || 'usr-citizen-1',
      citizenName: data.citizenName || 'Rajesh Sharma',
      citizenPhone: data.citizenPhone || '+91 94220 88990',
      description: data.description || '',
      rawVoiceTranscript: data.rawVoiceTranscript,
      inputMethod: data.inputMethod || 'text',
      issueType: data.issueType || 'Civic Issue',
      category: data.category || 'Other',
      severity: data.severity || 'MEDIUM',
      confidence: data.confidence || 0.88,
      aiRationale: data.aiRationale || ['Analyzed by CivicResolve Multi-Modal Agent'],
      safetyRisk: data.safetyRisk || 'Moderate public concern',
      recommendedAction: data.recommendedAction || 'Inspect and execute scheduled maintenance',
      latitude: data.latitude || 18.5204,
      longitude: data.longitude || 73.8567,
      address: data.address || 'Central Municipal Zone, Pune',
      landmark: data.landmark || 'Main Road Junction',
      areaZone: data.areaZone || 'Ward 10',
      departmentId: data.departmentId || 'dept-road',
      departmentName: data.departmentName || 'Roads & Infrastructure Department',
      officerId: data.officerId,
      officerName: data.officerName,
      status: 'ASSIGNED',
      slaHoursTotal: slaHours,
      slaStartTime: nowIso,
      slaDeadline,
      isSlaBreached: false,
      isSlaWarning: false,
      escalationLevel: data.severity === 'CRITICAL' ? 1 : 0,
      evidence: data.evidence || [],
      statusHistory: [
        {
          id: `sh-${Date.now()}-1`,
          newStatus: 'SUBMITTED',
          changedBy: data.citizenName || 'Citizen',
          role: 'CITIZEN',
          reason: 'Initial complaint filed with multi-modal evidence',
          timestamp: nowIso,
        },
        {
          id: `sh-${Date.now()}-2`,
          oldStatus: 'SUBMITTED',
          newStatus: 'CLASSIFIED',
          changedBy: 'Civic AI Agent',
          role: 'SYSTEM',
          reason: `Auto-categorized as ${data.category} (${data.severity}) with ${Math.round((data.confidence || 0.88) * 100)}% confidence`,
          timestamp: nowIso,
        },
      ],
      agentActions: [
        {
          id: `act-${Date.now()}-1`,
          complaintId: id,
          timestamp: nowIso,
          agentName: 'IntakeOrchestrator',
          action: 'create_complaint',
          reason: 'Structured complaint generated from multi-modal inputs',
          toolName: 'complaint_generator',
          outputData: { complaintNumber, status: 'CLASSIFIED', department: data.departmentName, slaHours },
          resultStatus: 'SUCCESS',
        },
      ],
      escalations: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.complaints.unshift(complaint);

    // Create notifications
    this.createNotification({
      userId: complaint.citizenId,
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      title: `Complaint Registered: ${complaint.complaintNumber}`,
      message: `Your report for ${complaint.issueType} was received and routed to the supervisor for worker assignment.`,
      type: 'INFO',
    });

    this.createNotification({
      targetRole: 'SUPERVISOR',
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      title: `New citizen report: ${complaint.complaintNumber}`,
      message: `Supervisor action required: review the classified issue and assign a field worker.`,
      type: 'INFO',
    });

    if (complaint.severity === 'CRITICAL') {
      this.createNotification({
        targetRole: 'SUPERVISOR',
        complaintId: complaint.id,
        complaintNumber: complaint.complaintNumber,
        title: `CRITICAL Civic Alert: ${complaint.complaintNumber}`,
        message: `High risk report at ${complaint.address}. 6-Hour SLA started.`,
        type: 'SLA_ALERT',
      });
    }

    this.logAudit({
      userId: complaint.citizenId,
      userName: complaint.citizenName,
      userRole: 'CITIZEN',
      action: 'COMPLAINT_CREATED',
      details: `Created complaint ${complaint.complaintNumber} (${complaint.category} - ${complaint.severity})`,
    });

    return complaint;
  }

  updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    changedBy: string,
    role: string,
    reason?: string
  ): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();

    if (newStatus === 'RESOLVED') {
      complaint.resolvedAt = new Date().toISOString();
      complaint.status = 'CITIZEN_VERIFICATION'; // resolution transitions to citizen verification
    }

    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      oldStatus,
      newStatus: complaint.status,
      changedBy,
      role,
      reason: reason || `Status transitioned to ${complaint.status}`,
      timestamp: new Date().toISOString(),
    });

    // Notify citizen if status is verification
    if (complaint.status === 'CITIZEN_VERIFICATION') {
      this.createNotification({
        userId: complaint.citizenId,
        complaintId: complaint.id,
        complaintNumber: complaint.complaintNumber,
        title: `Resolution Verification: ${complaint.complaintNumber}`,
        message: `Field officer marked this issue resolved. Please review photos and confirm closure.`,
        type: 'RESOLUTION',
      });
    }

    this.logAudit({
      userId: changedBy,
      userName: changedBy,
      userRole: role as any,
      action: 'STATUS_UPDATED',
      details: `${complaint.complaintNumber} changed from ${oldStatus} to ${complaint.status}: ${reason || ''}`,
    });

    return complaint;
  }

  workerAcceptTask(complaintId: string, workerName: string): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint || complaint.status !== 'ASSIGNED') return null;
    complaint.status = 'ACCEPTED';
    complaint.updatedAt = new Date().toISOString();
    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      oldStatus: 'ASSIGNED',
      newStatus: 'ACCEPTED',
      changedBy: workerName,
      role: 'WORKER',
      reason: 'Worker accepted the supervisor assignment.',
      timestamp: new Date().toISOString(),
    });
    this.logAudit({
      userId: workerName, userName: workerName, userRole: 'WORKER',
      action: 'TASK_ACCEPTED', details: `${complaint.complaintNumber} accepted by ${workerName}`
    });
    this.createNotification({
      targetRole: 'SUPERVISOR', complaintId: complaint.id, complaintNumber: complaint.complaintNumber,
      title: `Task accepted: ${complaint.complaintNumber}`,
      message: `${workerName} accepted the assigned field task.`, type: 'INFO'
    });
    return complaint;
  }

  workerStartTask(complaintId: string, workerName: string): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint || complaint.status !== 'ACCEPTED') return null;
    complaint.status = 'IN_PROGRESS';
    complaint.updatedAt = new Date().toISOString();
    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      oldStatus: 'ACCEPTED',
      newStatus: 'IN_PROGRESS',
      changedBy: workerName,
      role: 'WORKER',
      reason: 'Worker started field work.',
      timestamp: new Date().toISOString(),
    });
    this.logAudit({
      userId: workerName, userName: workerName, userRole: 'WORKER',
      action: 'TASK_STARTED', details: `${complaint.complaintNumber} field work started by ${workerName}`
    });
    this.createNotification({
      targetRole: 'SUPERVISOR', complaintId: complaint.id, complaintNumber: complaint.complaintNumber,
      title: `Work started: ${complaint.complaintNumber}`,
      message: `${workerName} started work on the assigned civic issue.`, type: 'INFO'
    });
    return complaint;
  }

  assignOfficer(complaintId: string, officerId: string, departmentId: string | undefined, assignedBy: string): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;
    const worker = this.officers.find((o) => o.id === officerId);
    if (!worker) return null;
    const department = departmentId ? this.departments.find((d) => d.id === departmentId) : this.departments.find((d) => d.id === worker.departmentId);
    complaint.departmentId = department?.id || worker.departmentId;
    complaint.departmentName = department?.name || worker.departmentName;
    complaint.officerId = worker.id;
    complaint.officerName = worker.name;
    complaint.status = 'ASSIGNED';
    complaint.updatedAt = new Date().toISOString();
    worker.activeTasks += 1;
    complaint.statusHistory.push({ id: `sh-${Date.now()}`, newStatus: 'ASSIGNED', changedBy: assignedBy, role: 'SUPERVISOR', reason: `Supervisor assigned task to ${worker.name}.`, timestamp: new Date().toISOString() });
    this.logAgentAction({ complaintId: complaint.id, agentName: 'SupervisorAssignmentAgent', action: 'assign_worker', reason: 'Supervisor selected a field worker for the classified civic issue.', toolName: 'worker_assignment_tool', outputData: { workerId: worker.id, workerName: worker.name }, resultStatus: 'SUCCESS' });
    this.createNotification({ userId: this.getWorkerUserId(worker.id), complaintId: complaint.id, complaintNumber: complaint.complaintNumber, title: `New task assigned: ${complaint.complaintNumber}`, message: `Supervisor assigned ${complaint.issueType} at ${complaint.address} to you.`, type: 'INFO' });
    return complaint;
  }

  reassignWorker(complaintId: string, workerId: string, supervisorName: string, reason = 'Supervisor requested additional field work.'): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    const worker = this.officers.find((o) => o.id === workerId);
    if (!complaint || !worker || complaint.status !== 'PENDING_SUPERVISOR_REVIEW') return null;
    const previousWorker = complaint.officerId ? this.officers.find(o => o.id === complaint.officerId) : undefined;
    if (previousWorker && previousWorker.id !== worker.id) previousWorker.activeTasks = Math.max(0, previousWorker.activeTasks - 1);
    complaint.officerId = worker.id;
    complaint.officerName = worker.name;
    complaint.status = 'ASSIGNED';
    complaint.updatedAt = new Date().toISOString();
    worker.activeTasks += 1;
    complaint.statusHistory.push({ id: `sh-${Date.now()}`, oldStatus: 'PENDING_SUPERVISOR_REVIEW', newStatus: 'ASSIGNED', changedBy: supervisorName, role: 'SUPERVISOR', reason, timestamp: new Date().toISOString() });
    this.createNotification({ userId: this.getWorkerUserId(worker.id), complaintId: complaint.id, complaintNumber: complaint.complaintNumber, title: `Task reassigned: ${complaint.complaintNumber}`, message: `Supervisor requested another visit/work cycle. ${reason}`, type: 'WARNING' });
    return complaint;
  }

  approveCompletion(complaintId: string, supervisorName: string, notes = 'Supervisor approved the worker completion evidence.'): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;
    complaint.status = 'CITIZEN_VERIFICATION';
    complaint.updatedAt = new Date().toISOString();
    complaint.resolvedAt = new Date().toISOString();
    complaint.statusHistory.push({ id: `sh-${Date.now()}`, oldStatus: 'PENDING_SUPERVISOR_REVIEW', newStatus: 'CITIZEN_VERIFICATION', changedBy: supervisorName, role: 'SUPERVISOR', reason: notes, timestamp: new Date().toISOString() });
    this.logAgentAction({ complaintId: complaint.id, agentName: 'SupervisorApprovalAgent', action: 'approve_worker_completion', reason: 'Supervisor reviewed completion evidence submitted by the worker.', toolName: 'completion_approval_tool', outputData: { approved: true }, resultStatus: 'SUCCESS' });
    this.createNotification({ userId: complaint.citizenId, complaintId: complaint.id, complaintNumber: complaint.complaintNumber, title: `Work approved: ${complaint.complaintNumber}`, message: `The supervisor approved the worker completion proof for your report. Please review the result.`, type: 'RESOLUTION' });
    return complaint;
  }

  escalateComplaint(
    complaintId: string,
    reason: string,
    targetLevel: 1 | 2 | 3,
    triggeredBy: 'AUTONOMOUS_AGENT' | 'SUPERVISOR_OVERRIDE' | 'WORKER' = 'AUTONOMOUS_AGENT',
    operatorName = 'Civic AI Agent'
  ): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    complaint.escalationLevel = targetLevel;
    complaint.status = 'ESCALATED';
    complaint.isSlaBreached = true;
    complaint.updatedAt = new Date().toISOString();

    const targetRecipient =
      targetLevel === 2
        ? `Department Division Supervisor (Sunita Patil)`
        : targetLevel === 3
        ? `Department Supervisor`
        : `Field Junior Engineer (Amit Deshmukh)`;

    const escRecord = {
      id: `esc-${Date.now()}`,
      complaintId: complaint.id,
      level: targetLevel,
      escalatedTo: targetRecipient,
      reason,
      triggeredBy,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    complaint.escalations.push(escRecord);

    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      oldStatus,
      newStatus: 'ESCALATED',
      changedBy: operatorName,
      role: triggeredBy === 'AUTONOMOUS_AGENT' ? 'SYSTEM' : 'SUPERVISOR',
      reason: `Escalated to Level ${targetLevel} (${targetRecipient}): ${reason}`,
      timestamp: new Date().toISOString(),
    });

    this.logAgentAction({
      complaintId: complaint.id,
      agentName: 'AutonomousEscalationSentinel',
      action: 'escalate_complaint',
      reason: `Level ${targetLevel} threshold triggered: ${reason}`,
      toolName: 'escalation_engine',
      inputData: { targetLevel, complaintNumber: complaint.complaintNumber },
      outputData: { escalatedTo: targetRecipient, status: 'ESCALATED' },
      resultStatus: 'WARNING',
    });

    this.createNotification({
      targetRole: 'SUPERVISOR',
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      title: `ESCALATION: ${complaint.complaintNumber} -> Level ${targetLevel}`,
      message: `${reason} | Escalated to ${targetRecipient}`,
      type: 'ESCALATION',
    });

    return complaint;
  }

  verifyResolution(
    complaintId: string,
    confirmed: boolean,
    rating?: number,
    feedback?: string,
    reopenReason?: string
  ): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const nowIso = new Date().toISOString();
    complaint.citizenConfirmed = confirmed;
    complaint.citizenRating = rating;
    complaint.citizenFeedback = feedback;
    complaint.updatedAt = nowIso;

    if (confirmed) {
      complaint.status = 'CLOSED';
      complaint.statusHistory.push({
        id: `sh-${Date.now()}`,
        oldStatus: 'CITIZEN_VERIFICATION',
        newStatus: 'CLOSED',
        changedBy: complaint.citizenName,
        role: 'CITIZEN',
        reason: `Citizen verified repair work satisfactory (${rating || 5} stars)`,
        timestamp: nowIso,
      });

      this.logAgentAction({
        complaintId: complaint.id,
        agentName: 'VerificationAgent',
        action: 'close_complaint',
        reason: 'Citizen validated on-site resolution evidence',
        toolName: 'complaint_closure_tool',
        outputData: { rating, feedback },
        resultStatus: 'SUCCESS',
      });
    } else {
      complaint.status = 'REOPENED';
      complaint.reopenReason = reopenReason || 'Citizen indicated issue is still unresolved on ground.';
      complaint.statusHistory.push({
        id: `sh-${Date.now()}`,
        oldStatus: 'CITIZEN_VERIFICATION',
        newStatus: 'REOPENED',
        changedBy: complaint.citizenName,
        role: 'CITIZEN',
        reason: `Citizen rejected closure: ${complaint.reopenReason}`,
        timestamp: nowIso,
      });

      this.logAgentAction({
        complaintId: complaint.id,
        agentName: 'VerificationAgent',
        action: 'reopen_complaint',
        reason: 'Citizen rejected closure verification',
        toolName: 'complaint_reopen_tool',
        outputData: { reopenReason: complaint.reopenReason },
        resultStatus: 'WARNING',
      });

      this.createNotification({
        targetRole: 'SUPERVISOR',
        complaintId: complaint.id,
        complaintNumber: complaint.complaintNumber,
        title: `Complaint Reopened: ${complaint.complaintNumber}`,
        message: `Citizen rejected resolution: "${complaint.reopenReason}"`,
        type: 'WARNING',
      });
    }

    return complaint;
  }

  addResolutionEvidence(
    complaintId: string,
    evidenceItem: any,
    notes: string,
    officerName: string
  ): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint || complaint.status !== 'IN_PROGRESS') return null;
    if (!evidenceItem?.url) return null;

    if (!complaint.resolutionEvidence) {
      complaint.resolutionEvidence = [];
    }
    complaint.resolutionEvidence.push({
      id: `ev-res-${Date.now()}`,
      type: 'image',
      url: evidenceItem.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
      filename: evidenceItem.filename || 'resolution_proof.jpg',
      fileSize: '1.8 MB',
      isResolutionProof: true,
      aiConfidence: 0.96,
      aiLabels: ['repaired road surface', 'cleared debris', 'fixed infrastructure'],
      uploadedAt: new Date().toISOString(),
    });

    complaint.resolutionNotes = notes;
    complaint.status = 'PENDING_SUPERVISOR_REVIEW';
    const currentWorker = complaint.officerId ? this.officers.find(o => o.id === complaint.officerId) : undefined;
    if (currentWorker) currentWorker.activeTasks = Math.max(0, currentWorker.activeTasks - 1);
    complaint.updatedAt = new Date().toISOString();

    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      oldStatus: 'IN_PROGRESS',
      newStatus: 'PENDING_SUPERVISOR_REVIEW',
      changedBy: officerName,
      role: 'WORKER',
      reason: `Worker uploaded completion photo: ${notes}`,
      timestamp: new Date().toISOString(),
    });

    this.logAgentAction({
      complaintId: complaint.id,
      agentName: 'ResolutionAgent',
      action: 'analyze_resolution_evidence',
      reason: 'Verify repair proof against initial defect photos',
      toolName: 'evidence_comparison_tool',
      outputData: { proofAccepted: true, confidence: 0.96 },
      resultStatus: 'SUCCESS',
    });

    this.createNotification({
      targetRole: 'SUPERVISOR',
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      title: `Completion proof awaiting approval: ${complaint.complaintNumber}`,
      message: `Worker ${officerName} uploaded a completion photo. Review the evidence and approve or reassign.`,
      type: 'INFO',
    });

    return complaint;
  }

  adminOverride(
    complaintId: string,
    override: {
      category?: IssueCategory;
      severity?: SeverityLevel;
      departmentId?: string;
      reason: string;
      adminName: string;
    }
  ): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    complaint.aiOverridden = true;
    complaint.overrideReason = override.reason;
    complaint.overrideBy = override.adminName;
    complaint.updatedAt = new Date().toISOString();

    if (override.category) complaint.category = override.category;
    if (override.severity) {
      complaint.severity = override.severity;
      complaint.slaHoursTotal = override.severity === 'CRITICAL' ? 6 : override.severity === 'HIGH' ? 24 : override.severity === 'MEDIUM' ? 48 : 72;
    }
    if (override.departmentId) {
      const dept = this.departments.find((d) => d.id === override.departmentId);
      if (dept) {
        complaint.departmentId = dept.id;
        complaint.departmentName = dept.name;
      }
    }

    this.logAudit({
      userId: override.adminName,
      userName: override.adminName,
      userRole: 'SUPERVISOR',
      action: 'AI_DECISION_OVERRIDE',
      details: `Override on ${complaint.complaintNumber}: ${override.reason} (Category: ${complaint.category}, Severity: ${complaint.severity})`,
    });

    this.logAgentAction({
      complaintId: complaint.id,
      agentName: 'GovernanceAgent',
      action: 'record_admin_override',
      reason: override.reason,
      toolName: 'override_logger',
      outputData: { category: complaint.category, severity: complaint.severity, overrideBy: override.adminName },
      resultStatus: 'SUCCESS',
    });

    return complaint;
  }

  // Autonomous SLA checker loop
  checkAllSlas(): { breachedCount: number; escalatedCount: number } {
    let breachedCount = 0;
    let escalatedCount = 0;
    const now = Date.now();

    for (const c of this.complaints) {
      if (['RESOLVED', 'CLOSED', 'CITIZEN_VERIFICATION'].includes(c.status)) continue;

      const deadline = new Date(c.slaDeadline).getTime();
      const timeRemaining = deadline - now;

      // 1. Check warning threshold (less than 20% SLA remaining)
      if (timeRemaining > 0 && timeRemaining < c.slaHoursTotal * 3600000 * 0.25) {
        if (!c.isSlaWarning) {
          c.isSlaWarning = true;
          this.logAgentAction({
            complaintId: c.id,
            agentName: 'SlaSentinelAgent',
            action: 'initiate_follow_up',
            reason: `Only ${Math.max(1, Math.round(timeRemaining / 3600000))} hour(s) remain before SLA breach`,
            toolName: 'sla_follow_up_engine',
            outputData: { slaDeadline: c.slaDeadline, remainingHours: timeRemaining / 3600000 },
            resultStatus: 'WARNING',
          });
          this.createNotification({
            targetRole: 'SUPERVISOR',
            complaintId: c.id,
            complaintNumber: c.complaintNumber,
            title: `SLA Warning: ${c.complaintNumber}`,
            message: `Complaint is approaching its SLA deadline. Follow-up action has been initiated.`,
            type: 'SLA_ALERT',
          });
        }
      }

      // 2. Check breach
      if (timeRemaining <= 0) {
        c.isSlaBreached = true;
        breachedCount++;

        // If not already escalated, trigger Level 2 escalation
        if (c.escalationLevel < 2) {
          this.escalateComplaint(
            c.id,
            `Automatic SLA breach detected (${Math.abs(Math.round(timeRemaining / 3600000))} hours overdue)`,
            2,
            'AUTONOMOUS_AGENT',
            'Autonomous SLA Sentinel'
          );
          escalatedCount++;
        }
      }
    }

    return { breachedCount, escalatedCount };
  }

  logAgentAction(action: Omit<AgentActionLog, 'id' | 'timestamp'>): AgentActionLog {
    const entry: AgentActionLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...action,
    };
    this.agentActions.unshift(entry);

    // Also attach to complaint
    const c = this.getComplaintById(action.complaintId);
    if (c) {
      c.agentActions.unshift(entry);
    }
    return entry;
  }

  createNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    };
    this.notifications.unshift(item);
    return item;
  }

  logAudit(audit: Omit<AuditLogItem, 'id' | 'timestamp'>): AuditLogItem {
    const item: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...audit,
    };
    this.auditLogs.unshift(item);
    return item;
  }

  getAnalytics(): AnalyticsSummary {
    const total = this.complaints.length;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const newToday = this.complaints.filter((c) => new Date(c.createdAt).getTime() >= startOfToday).length;
    const pending = this.complaints.filter((c) => ['SUBMITTED', 'AI_ANALYZING', 'CLASSIFIED', 'ASSIGNED'].includes(c.status)).length;
    const inProgress = this.complaints.filter((c) => ['ACCEPTED', 'IN_PROGRESS'].includes(c.status)).length;
    const resolved = this.complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_VERIFICATION').length;
    const closed = this.complaints.filter((c) => c.status === 'CLOSED').length;
    const critical = this.complaints.filter((c) => c.severity === 'CRITICAL').length;
    const slaBreached = this.complaints.filter((c) => c.isSlaBreached).length;
    const escalated = this.complaints.filter((c) => c.escalationLevel > 0).length;

    // Categories
    const catMap: Record<string, number> = {};
    this.complaints.forEach((c) => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / (total || 1)) * 100),
    }));

    // Severities
    const sevMap: Record<string, { count: number; color: string }> = {
      CRITICAL: { count: 0, color: '#ef4444' },
      HIGH: { count: 0, color: '#f97316' },
      MEDIUM: { count: 0, color: '#eab308' },
      LOW: { count: 0, color: '#22c55e' },
    };
    this.complaints.forEach((c) => {
      if (sevMap[c.severity]) sevMap[c.severity].count += 1;
    });
    const severityBreakdown = Object.entries(sevMap).map(([severity, val]) => ({
      severity,
      count: val.count,
      color: val.color,
    }));

    // Department Workload
    const deptWorkload = this.departments.map((d) => {
      const deptComplaints = this.complaints.filter((c) => c.departmentId === d.id);
      return {
        department: d.code,
        open: deptComplaints.filter((c) => !['CLOSED', 'RESOLVED'].includes(c.status)).length,
        resolved: deptComplaints.filter((c) => ['CLOSED', 'RESOLVED'].includes(c.status)).length,
        breached: deptComplaints.filter((c) => c.isSlaBreached).length,
      };
    });

    // Hotspots
    const hotspots = [
      { area: 'Shivaji Nagar & University Road', count: 4, dominantIssue: 'Potholes & Pavement Cracks', lat: 18.5314, lng: 73.8446 },
      { area: 'Ravivar Peth Market Lane', count: 3, dominantIssue: 'Garbage & Solid Waste Spills', lat: 18.5204, lng: 73.8567 },
      { area: 'Tilak Road & Sadashiv Peth', count: 2, dominantIssue: 'Open Manholes & Choked Drains', lat: 18.5112, lng: 73.8521 },
      { area: 'Mutha Canal Bypass Corridor', count: 2, dominantIssue: 'Dark Streetlight Clusters', lat: 18.5089, lng: 73.8344 },
    ];

    const resolvedOrClosed = this.complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status) && !c.isSlaBreached).length;
    const slaComplianceRate = Math.round(((total - slaBreached) / (total || 1)) * 100);

    return {
      totalComplaints: total,
      newToday,
      pending,
      inProgress,
      resolved,
      closed,
      critical,
      slaBreached,
      escalated,
      averageResolutionHours: 18.4,
      slaComplianceRate: Math.max(0, slaComplianceRate),
      categoryBreakdown,
      severityBreakdown,
      departmentWorkload: deptWorkload,
      dailyTrend: [
        { date: 'Mon', created: 3, resolved: 2 },
        { date: 'Tue', created: 5, resolved: 4 },
        { date: 'Wed', created: 2, resolved: 3 },
        { date: 'Thu', created: 6, resolved: 4 },
        { date: 'Fri', created: 4, resolved: 5 },
        { date: 'Sat', created: 3, resolved: 2 },
        { date: 'Today', created: newToday, resolved },
      ],
      hotspots,
    };
  }
}

export const db = new CivicDatabase();
