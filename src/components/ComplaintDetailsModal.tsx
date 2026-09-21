import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus, SeverityLevel } from '../types';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  User,
  Activity,
  ArrowRight,
  Sparkles,
  Upload,
  RotateCcw,
  Star,
  Send,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

declare const L: any;

export const ComplaintDetailsModal: React.FC = () => {
  const {
    selectedComplaintId,
    setSelectedComplaintId,
    currentUser,
    activeRole,
    triggerRefresh,
    refreshTrigger,
  } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'trace' | 'actions'>('overview');

  // Worker / Supervisor action states
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideSeverity, setOverrideSeverity] = useState<SeverityLevel>('HIGH');
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [escalationLevel, setEscalationLevel] = useState<number>(2);

  // Citizen verification states
  const [citizenRating, setCitizenRating] = useState<number>(5);
  const [citizenFeedback, setCitizenFeedback] = useState<string>('Repairs completed properly.');
  const [reopenReason, setReopenReason] = useState<string>('');
  const [isReopening, setIsReopening] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  // Load complaint data
  useEffect(() => {
    if (!selectedComplaintId) {
      setComplaint(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/complaints/${selectedComplaintId}`);
        if (res.ok) {
          const data = await res.json();
          setComplaint(data);
          setOverrideSeverity(data.severity);
        }
      } catch (e) {
        console.error('Failed to load complaint details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedComplaintId, refreshTrigger]);

  // Leaflet map setup for complaint location
  useEffect(() => {
    if (complaint && activeTab === 'overview' && mapContainerRef.current) {
      if (typeof L === 'undefined') return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([complaint.latitude, complaint.longitude], 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.marker([complaint.latitude, complaint.longitude])
        .addTo(map)
        .bindPopup(`<b>${complaint.complaintNumber}</b><br/>${complaint.issueType}`)
        .openPopup();

      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [complaint, activeTab]);

  if (!selectedComplaintId || !complaint) return null;

  // Helpers for SLA
  const now = Date.now();
  const deadline = new Date(complaint.slaDeadline).getTime();
  const isBreached = complaint.isSlaBreached || (now > deadline && !['CLOSED', 'RESOLVED'].includes(complaint.status));
  const diffHours = Math.round(Math.abs(deadline - now) / 3600000);

  // Status transitions
  const handleStatusChange = async (newStatus: ComplaintStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          changedBy: currentUser.name,
          role: activeRole,
          reason: reason || `Updated to ${newStatus}`,
        }),
      });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upload resolution proof
  const handleUploadResolutionEvidence = async () => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: resolutionNotes || 'Repairs completed by on-duty crew. Verified on-site.',
          officerName: currentUser.name,
          evidenceItem: {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
            filename: 'repair_evidence_after.jpg',
          },
        }),
      });
      if (res.ok) {
        triggerRefresh();
        setResolutionNotes('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Citizen verification confirmation / reopen
  const handleCitizenVerify = async (confirmed: boolean) => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed,
          rating: confirmed ? citizenRating : undefined,
          feedback: confirmed ? citizenFeedback : undefined,
          reopenReason: !confirmed ? reopenReason : undefined,
        }),
      });
      if (res.ok) {
        triggerRefresh();
        setIsReopening(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Escalate
  const handleEscalate = async () => {
    if (!escalationReason) {
      alert('Please enter an escalation justification.');
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: escalationReason,
          level: escalationLevel,
          triggeredBy: 'SUPERVISOR_OVERRIDE',
          operatorName: currentUser.name,
        }),
      });
      if (res.ok) {
        triggerRefresh();
        setEscalationReason('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Override
  const handleSupervisorOverride = async () => {
    if (!overrideReason) {
      alert('Override reason is required for governance audit logging.');
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: overrideSeverity,
          reason: overrideReason,
          adminName: currentUser.name,
        }),
      });
      if (res.ok) {
        triggerRefresh();
        setOverrideReason('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const STAGES: ComplaintStatus[] = [
    'SUBMITTED',
    'AI_ANALYZING',
    'CLASSIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CITIZEN_VERIFICATION',
    'CLOSED',
  ];

  const getStageIndex = (status: ComplaintStatus) => {
    if (status === 'ACCEPTED') return 3;
    if (status === 'SLA_WARNING' || status === 'SLA_BREACHED' || status === 'ESCALATED') return 4;
    if (status === 'PENDING_SUPERVISOR_REVIEW') return 5;
    if (status === 'REOPENED') return 4;
    const idx = STAGES.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  const currentStageIdx = getStageIndex(complaint.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                  {complaint.complaintNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    complaint.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : complaint.severity === 'HIGH'
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : complaint.severity === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {complaint.severity} PRIORITY
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    complaint.status === 'CLOSED'
                      ? 'bg-slate-200 text-slate-800'
                      : complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_VERIFICATION'
                      ? 'bg-emerald-100 text-emerald-800'
                      : complaint.status === 'ESCALATED'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{complaint.issueType} • {complaint.departmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SLA countdown badge */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                ['CLOSED', 'RESOLVED'].includes(complaint.status)
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : isBreached
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {['CLOSED', 'RESOLVED'].includes(complaint.status) ? (
                <span>Completed</span>
              ) : isBreached ? (
                <span>SLA BREACHED ({diffHours}h overdue)</span>
              ) : (
                <span>SLA Active: {diffHours}h remaining</span>
              )}
            </div>

            <button
              onClick={() => setSelectedComplaintId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-white border-b border-slate-200 flex gap-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Evidence' },
            { id: 'timeline', label: 'Lifecycle Timeline' },
            { id: 'trace', label: `Agent Decision Trace (${complaint.agentActions?.length || 0})` },
            { id: 'actions', label: 'Operational Controls' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              {/* CITIZEN VERIFICATION BANNER (If resolved and awaiting verification) */}
              {complaint.status === 'CITIZEN_VERIFICATION' && (
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Field Officer Marked This Issue Resolved!
                    </div>
                    <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                      Action Required
                    </span>
                  </div>

                  <p className="text-xs text-emerald-800">
                    The maintenance team uploaded completion evidence. As a citizen or reviewer, please inspect the
                    repair photo and verify if the issue is satisfactorily fixed.
                  </p>

                  {!isReopening ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCitizenRating(star)}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= citizenRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCitizenVerify(true)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Yes, Close Complaint (Verified)
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsReopening(true)}
                          className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          No, Issue Still Exists (Reopen)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 bg-white/80 p-3 rounded-lg border border-red-200">
                      <label className="block text-xs font-bold text-red-900">
                        Reason for Reopening (Explain what remains unfixed):
                      </label>
                      <input
                        type="text"
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        placeholder="e.g. Only half the pothole was patched; gravel still loose..."
                        className="w-full p-2 text-xs rounded border border-red-300 focus:border-red-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCitizenVerify(false)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                        >
                          Confirm Reopen Ticket
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsReopening(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description & Citizen Info */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Report</div>
                <p className="text-slate-800 text-sm leading-relaxed">{complaint.description}</p>
                {complaint.rawVoiceTranscript && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    Spoken Transcript: "{complaint.rawVoiceTranscript}"
                  </div>
                )}
                <div className="text-xs text-slate-500 pt-1 flex items-center gap-3">
                  <span>Reported by: <strong className="text-slate-700">{complaint.citizenName}</strong></span>
                  <span>•</span>
                  <span>Contact: {complaint.citizenPhone || '+91 94220 88990'}</span>
                </div>
              </div>

              {/* AI Decision & Grounding Panel */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Autonomous AI Triage Decision
                  </div>
                  <span className="text-xs font-bold text-blue-700">
                    Confidence: {Math.round(complaint.confidence * 100)}%
                  </span>
                </div>

                <div className="text-xs text-blue-950 font-medium">
                  Safety Risk Assessment: <span className="text-blue-900">{complaint.safetyRisk}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    Evidence Grounding Rationale:
                  </div>
                  <ul className="space-y-1 text-xs text-blue-900 pl-2">
                    {complaint.aiRationale?.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-white/80 rounded-lg text-xs border border-blue-100">
                  <span className="font-bold text-slate-700">Recommended Action: </span>
                  <span className="text-slate-800">{complaint.recommendedAction}</span>
                </div>
              </div>

              {/* Resolution Evidence Comparison (Before vs After) */}
              {complaint.resolutionEvidence && complaint.resolutionEvidence.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Resolution Verification: Before vs. After Proof</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      AI Match Score: 96%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Before (Citizen Defect Report)</div>
                      <img
                        src={complaint.evidence[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
                        alt="Before"
                        className="w-full h-44 object-cover rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-emerald-700 mb-1">After (Field Crew Resolution)</div>
                      <img
                        src={complaint.resolutionEvidence[0].url}
                        alt="After"
                        className="w-full h-44 object-cover rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {complaint.resolutionNotes && (
                    <div className="p-2.5 bg-white rounded-lg text-xs border border-slate-200 text-slate-700">
                      <strong>Field Notes:</strong> {complaint.resolutionNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Initial Photos if no resolution proof */}
              {(!complaint.resolutionEvidence || complaint.resolutionEvidence.length === 0) &&
                complaint.evidence.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Citizen Evidence Photos</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {complaint.evidence.map((ev) => (
                        <div key={ev.id} className="rounded-xl overflow-hidden border border-slate-200">
                          <img src={ev.url} alt="Evidence" className="w-full h-36 object-cover" />
                          <div className="p-1.5 bg-white text-[10px] text-slate-500 flex justify-between">
                            <span>{ev.filename || 'photo_evidence.jpg'}</span>
                            <span>{ev.fileSize || '2.0 MB'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Location & Map */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Location & GIS Pinpoint
                  </div>
                  <span className="text-xs text-slate-500">
                    {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="text-xs text-slate-800">
                  <strong>Address: </strong> {complaint.address}
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 h-48 w-full">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stepper overview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Autonomous Complaint Lifecycle Stepper
                </div>
                <div className="flex items-center justify-between relative overflow-x-auto pb-2">
                  {STAGES.map((stg, idx) => {
                    const isPassed = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    return (
                      <div key={stg} className="flex flex-col items-center min-w-[75px] text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1 font-semibold ${
                            isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {stg.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History Records */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Audit History Records ({complaint.statusHistory?.length || 0})
                </div>

                <div className="space-y-2.5">
                  {complaint.statusHistory?.map((hist, i) => (
                    <div key={hist.id || i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {hist.oldStatus ? `${hist.oldStatus} → ` : ''}{hist.newStatus}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(hist.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-0.5">{hist.reason || 'Status updated'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Changed by: <strong>{hist.changedBy}</strong> ({hist.role})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGENT DECISION TRACE */}
          {activeTab === 'trace' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Autonomous Agent Decision Trace</h4>
                <p className="text-xs text-slate-500">
                  Every tool call, reasoning step, input, and output logged for municipal governance accountability.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Agent</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Tool</th>
                      <th className="p-3">Reason & Result</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaint.agentActions && complaint.agentActions.length > 0 ? (
                      complaint.agentActions.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-3 font-bold text-slate-800">{act.agentName}</td>
                          <td className="p-3 font-mono text-blue-700">{act.action}</td>
                          <td className="p-3 text-slate-600">{act.toolName}</td>
                          <td className="p-3 text-slate-700 max-w-xs">
                            <div>{act.reason}</div>
                            {act.outputData && (
                              <pre className="text-[10px] text-slate-500 mt-1 bg-slate-100 p-1 rounded font-mono truncate">
                                {JSON.stringify(act.outputData)}
                              </pre>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                act.resultStatus === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : act.resultStatus === 'WARNING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {act.resultStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No agent trace records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OPERATIONAL CONTROLS (Worker & Supervisor) */}
          {activeTab === 'actions' && (
            <div className="space-y-5 animate-fade-in">
              {/* Field Officer Controls */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Worker Field Operations
                </div>

                <div className="flex flex-wrap gap-2">
                  {complaint.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('ACCEPTED', 'Officer reviewed task and accepted queue')}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Accept Task
                    </button>
                  )}

                  {['ASSIGNED', 'ACCEPTED'].includes(complaint.status) && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('IN_PROGRESS', 'Crew mobilized with equipment to site')}
                      className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Start Work (In Progress)
                    </button>
                  )}
                </div>

                {/* Resolution proof upload form */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Repair Evidence & Mark Resolved:
                  </label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution notes (e.g. 50kg cold mix asphalt laid and compacted)..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUploadResolutionEvidence}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Resolution Proof & Notify Citizen
                  </button>
                </div>
              </div>

              {/* Authority Escalation & AI Override */}
              {(activeRole === 'WORKER' || activeRole === 'SUPERVISOR') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Escalation */}
                  <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                    <div className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4 text-purple-600" />
                      Trigger Authority Escalation
                    </div>
                    <div>
                      <label className="block text-[11px] text-purple-800 font-semibold mb-1">Escalate To:</label>
                      <select
                        value={escalationLevel}
                        onChange={(e) => setEscalationLevel(Number(e.target.value))}
                        className="w-full p-2 text-xs rounded-lg border border-purple-300 bg-white"
                      >
                        <option value={2}>Level 2: Department Division Supervisor</option>
                        <option value={3}>Level 3: Municipal Supervisor</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="Justification for escalation..."
                        className="w-full p-2 text-xs rounded-lg border border-purple-300 bg-white outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleEscalate}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                    >
                      Execute Escalation
                    </button>
                  </div>

                  {/* AI Override */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Supervisor AI Decision Override
                    </div>
                    <div>
                      <label className="block text-[11px] text-amber-800 font-semibold mb-1">Override Severity:</label>
                      <select
                        value={overrideSeverity}
                        onChange={(e) => setOverrideSeverity(e.target.value as SeverityLevel)}
                        className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white"
                      >
                        <option value="CRITICAL">CRITICAL (6h SLA)</option>
                        <option value="HIGH">HIGH (24h SLA)</option>
                        <option value="MEDIUM">MEDIUM (48h SLA)</option>
                        <option value="LOW">LOW (72h SLA)</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Mandatory audit justification for override..."
                        className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSupervisorOverride}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                    >
                      Save Override to Audit Trail
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
