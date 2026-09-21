import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const {
    currentUser,
    setIsReportModalOpen,
    setSelectedComplaintId,
    setActiveTab,
    refreshTrigger,
  } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/complaints?citizenId=${currentUser.id}&role=CITIZEN`);
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (e) {
        console.error('Failed to load citizen complaints:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [currentUser.id, refreshTrigger]);

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issueType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !['CLOSED', 'RESOLVED'].includes(c.status)) ||
      (statusFilter === 'RESOLVED' && ['CLOSED', 'RESOLVED', 'CITIZEN_VERIFICATION'].includes(c.status));
    return matchSearch && matchStatus;
  });

  const totalCount = complaints.length;
  const activeCount = complaints.filter((c) => !['CLOSED', 'RESOLVED'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ['CLOSED', 'RESOLVED'].includes(c.status)).length;
  const verificationCount = complaints.filter((c) => c.status === 'CITIZEN_VERIFICATION').length;

  const topActiveComplaint = complaints.find((c) => !['CLOSED', 'RESOLVED'].includes(c.status));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Citizen Self-Service Portal • Pune Municipal Corporation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Namaste, {currentUser.name}!
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Report civic defects in your neighborhood. Our autonomous multi-modal agent classifies severity, notifies
            the assigned municipal ward team, and tracks repairs until you confirm resolution.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="btn-report-issue-dashboard"
              onClick={() => setIsReportModalOpen(true)}
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Report New Issue (7-Step Wizard)
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="px-4 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-blue-300" />
              View City Issue Map
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: totalCount, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Under Action', value: activeCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Fully Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Awaiting Your Review', value: verificationCount, icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                <div className={`p-2 rounded-lg ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Prominent Active Tracking Card if any complaint is active */}
      {topActiveComplaint && (
        <div className="p-5 bg-white rounded-2xl border-2 border-blue-600/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Active Live Ticket Tracking
              </span>
              <span className="font-bold text-slate-900 text-sm">
                #{topActiveComplaint.complaintNumber}
              </span>
            </div>

            <button
              onClick={() => setSelectedComplaintId(topActiveComplaint.id)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              Open Full Ticket Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <div className="text-base font-bold text-slate-900">{topActiveComplaint.issueType}</div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {topActiveComplaint.address}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  topActiveComplaint.status === 'CITIZEN_VERIFICATION'
                    ? 'bg-purple-100 text-purple-800 animate-pulse'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                Status: {topActiveComplaint.status.replace('_', ' ')}
              </span>

              {topActiveComplaint.status === 'CITIZEN_VERIFICATION' && (
                <button
                  onClick={() => setSelectedComplaintId(topActiveComplaint.id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Verify Repair Now
                </button>
              )}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width:
                  topActiveComplaint.status === 'CLOSED'
                    ? '100%'
                    : topActiveComplaint.status === 'CITIZEN_VERIFICATION'
                    ? '85%'
                    : topActiveComplaint.status === 'IN_PROGRESS'
                    ? '60%'
                    : topActiveComplaint.status === 'ASSIGNED'
                    ? '40%'
                    : '20%',
              }}
            />
          </div>
        </div>
      )}

      {/* Complaints List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Submitted Complaints</h3>
            <p className="text-xs text-slate-500">Track real-time progress and verify municipal actions</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket or keyword..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 outline-none w-44 sm:w-56"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="RESOLVED">Resolved Only</option>
            </select>
          </div>
        </div>

        {/* List items */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-700">No complaints found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't reported any civic defects yet, or none match the selected filter.
              </p>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Report First Issue
              </button>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedComplaintId(c.id)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{c.complaintNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : c.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">• {c.departmentName}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-1">{c.description}</p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{c.address}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-700'
                        : c.status === 'CITIZEN_VERIFICATION'
                        ? 'bg-purple-100 text-purple-800 font-bold animate-pulse'
                        : c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
