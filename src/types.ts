export type UserRole = 'CITIZEN' | 'WORKER' | 'SUPERVISOR';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZING'
  | 'CLASSIFIED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'PENDING_SUPERVISOR_REVIEW'
  | 'SLA_WARNING'
  | 'SLA_BREACHED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CITIZEN_VERIFICATION'
  | 'CLOSED'
  | 'REOPENED';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IssueCategory =
  | 'Road'
  | 'Garbage'
  | 'Streetlight'
  | 'Water'
  | 'Drainage'
  | 'Traffic'
  | 'Environment'
  | 'Public Infrastructure'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  preferredLanguage?: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  officersCount: number;
  activeComplaints: number;
  supervisorName: string;
  supervisorEmail: string;
  phone: string;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  activeTasks: number;
  available: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename?: string;
  fileSize?: string;
  aiConfidence?: number;
  aiLabels?: string[];
  isResolutionProof?: boolean;
  uploadedAt: string;
}

export interface AgentActionLog {
  id: string;
  complaintId: string;
  timestamp: string;
  agentName: string;
  action: string;
  reason: string;
  toolName: string;
  inputData?: Record<string, any> | string;
  outputData?: Record<string, any> | string;
  resultStatus: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface StatusHistoryItem {
  id: string;
  oldStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedBy: string;
  role: string;
  reason?: string;
  timestamp: string;
}

export interface EscalationRecord {
  id: string;
  complaintId: string;
  level: 1 | 2 | 3;
  escalatedTo: string;
  reason: string;
  triggeredBy: 'AUTONOMOUS_AGENT' | 'SUPERVISOR_OVERRIDE' | 'WORKER';
  timestamp: string;
  resolved: boolean;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  description: string;
  rawVoiceTranscript?: string;
  inputMethod: 'text' | 'voice' | 'image' | 'mixed';
  issueType: string;
  category: IssueCategory;
  severity: SeverityLevel;
  confidence: number;
  aiRationale: string[];
  evidenceGrounding?: {
    source: 'TEXT' | 'VOICE' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
    detail: string;
  }[];
  safetyRisk: string;
  recommendedAction: string;
  
  // Location
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  areaZone?: string;

  // Assignment & Dept
  departmentId: string;
  departmentName: string;
  officerId?: string;
  officerName?: string;

  // Status & SLA
  status: ComplaintStatus;
  slaHoursTotal: number;
  slaStartTime: string;
  slaDeadline: string;
  isSlaBreached: boolean;
  isSlaWarning: boolean;
  escalationLevel: number; // 0=None, 1=Officer, 2=Supervisor, 3=Supervisor

  // Evidence
  evidence: EvidenceItem[];
  resolutionEvidence?: EvidenceItem[];
  resolutionNotes?: string;
  resolvedAt?: string;

  // Citizen verification
  citizenFeedback?: string;
  citizenRating?: number;
  citizenConfirmed?: boolean;
  reopenReason?: string;

  // AI Override
  aiOverridden?: boolean;
  overrideReason?: string;
  overrideBy?: string;

  // History & Agent
  statusHistory: StatusHistoryItem[];
  agentActions: AgentActionLog[];
  escalations: EscalationRecord[];

  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'ALL';
  complaintId?: string;
  complaintNumber?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ESCALATION' | 'RESOLUTION' | 'SLA_ALERT';
  read: boolean;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  newToday: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  slaBreached: number;
  escalated: number;
  averageResolutionHours: number;
  slaComplianceRate: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  severityBreakdown: { severity: string; count: number; color: string }[];
  departmentWorkload: { department: string; open: number; resolved: number; breached: number }[];
  dailyTrend: { date: string; created: number; resolved: number }[];
  hotspots: { area: string; count: number; dominantIssue: string; lat: number; lng: number }[];
}

export type AnalyticsData = AnalyticsSummary;

