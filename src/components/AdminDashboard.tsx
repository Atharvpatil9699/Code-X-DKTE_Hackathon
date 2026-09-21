import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, Officer } from '../types';
import { CheckCircle2, ClipboardList, RefreshCw, UserCheck, Users, XCircle, Clock, MapPin } from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const { currentUser, setSelectedComplaintId, refreshTrigger, triggerRefresh } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, wRes] = await Promise.all([
        fetch('/api/complaints?role=SUPERVISOR'),
        fetch('/api/officers'),
      ]);
      if (cRes.ok) setComplaints(await cRes.json());
      if (wRes.ok) setWorkers(await wRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  const pendingAssignment = useMemo(() => complaints.filter(c => !c.officerId && ['CLASSIFIED','SUBMITTED'].includes(c.status)).length, [complaints]);
  const reviewCount = useMemo(() => complaints.filter(c => c.status === 'PENDING_SUPERVISOR_REVIEW').length, [complaints]);
  const activeCount = useMemo(() => complaints.filter(c => ['ASSIGNED','ACCEPTED','IN_PROGRESS'].includes(c.status)).length, [complaints]);

  const assignWorker = async (complaint: Complaint) => {
    const workerId = selectedWorkers[complaint.id];
    if (!workerId) return;
    setAssigningId(complaint.id);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/assign-worker`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, supervisorId: currentUser.id, supervisorName: currentUser.name }),
      });
      if (res.ok) triggerRefresh();
    } finally { setAssigningId(null); }
  };

  const reviewTask = async (complaint: Complaint, approve: boolean) => {
    const endpoint = approve ? 'approve-completion' : 'reassign-worker';
    if (!approve && !selectedWorkers[complaint.id]) {
      alert('Select a worker before reassigning the task.');
      return;
    }
    const body = approve
      ? { supervisorId: currentUser.id, supervisorName: currentUser.name, notes: 'Supervisor inspected the uploaded completion photo and approved the work.' }
      : { workerId: selectedWorkers[complaint.id], supervisorId: currentUser.id, supervisorName: currentUser.name, reason: 'Supervisor rejected the completion proof; additional field work is required.' };
    const res = await fetch(`/api/complaints/${complaint.id}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) triggerRefresh();
    else { const data = await res.json().catch(() => ({})); alert(data.error || 'Supervisor action failed.'); }
  };

  const availableWorkers = (complaint: Complaint) => workers.filter(w => w.departmentId === complaint.departmentId || !complaint.departmentId);

  const metrics = [
    { label: 'Awaiting assignment', value: pendingAssignment, icon: ClipboardList, cls: 'text-blue-600 bg-blue-50' },
    { label: 'Active worker tasks', value: activeCount, icon: Clock, cls: 'text-amber-600 bg-amber-50' },
    { label: 'Awaiting my approval', value: reviewCount, icon: CheckCircle2, cls: 'text-purple-600 bg-purple-50' },
    { label: 'Workers available', value: workers.filter(w => w.available).length, icon: Users, cls: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Supervisor Operations Console</p>
          <h1 className="text-2xl font-black mt-1">Review, assign & approve civic work</h1>
          <p className="text-sm text-slate-400 mt-1">Every citizen report reaches the supervisor before a worker is assigned.</p>
        </div>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh queue
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`p-2 rounded-lg ${cls}`}><Icon className="w-4 h-4" /></span></div>
            <div className="text-2xl font-black text-slate-900 mt-2">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">Supervisor Work Queue</h2>
          <p className="text-xs text-slate-500 mt-1">Assign workers, inspect completion photos, approve or reassign.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? <div className="p-10 text-center text-sm text-slate-400">Loading supervisor queue...</div> : complaints.map(c => {
            const taskWorkers = availableWorkers(c);
            const needsAssignment = !c.officerId && ['CLASSIFIED','SUBMITTED'].includes(c.status);
            const needsReview = c.status === 'PENDING_SUPERVISOR_REVIEW';
            return (
              <div key={c.id} className="p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setSelectedComplaintId(c.id)} className="font-mono font-black text-blue-700 hover:underline">{c.complaintNumber}</button>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{c.status.replaceAll('_',' ')}</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">{c.severity}</span>
                    </div>
                    <div className="font-bold text-slate-900">{c.issueType}</div>
                    <p className="text-xs text-slate-600">{c.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</div>
                    <div className="text-xs text-slate-500">Current worker: <strong>{c.officerName || 'Not assigned'}</strong></div>
                  </div>

                  <div className="w-full lg:w-80 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Worker</label>
                    <select value={selectedWorkers[c.id] || c.officerId || ''} onChange={e => setSelectedWorkers(s => ({...s, [c.id]: e.target.value}))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white">
                      <option value="">Select worker</option>
                      {taskWorkers.map(w => <option key={w.id} value={w.id}>{w.name}{w.available ? ' • Available' : ' • Busy'}</option>)}
                    </select>
                    {needsAssignment && <button disabled={assigningId === c.id} onClick={() => assignWorker(c)} className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"><UserCheck className="w-4 h-4" />{assigningId === c.id ? 'Assigning...' : 'Assign task to worker'}</button>}
                    {needsReview && <div className="grid grid-cols-2 gap-2"><button onClick={() => reviewTask(c, true)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" />Approve</button><button onClick={() => reviewTask(c, false)} className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><XCircle className="w-4 h-4" />Reject & Reassign</button></div>}
                  </div>
                </div>
                {needsReview && c.resolutionEvidence && c.resolutionEvidence.length > 0 && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <div className="text-xs font-bold text-purple-900 mb-2">Worker completion evidence</div>
                    <div className="flex gap-3 overflow-x-auto">{c.resolutionEvidence.map(ev => <img key={ev.id} src={ev.url} alt="Completion evidence" className="w-32 h-24 object-cover rounded-lg border border-purple-200" />)}</div>
                    <p className="text-xs text-purple-800 mt-2">{c.resolutionNotes || 'Worker submitted completion proof.'}</p>
                  </div>
                )}
              </div>
            );
          })}
          {!loading && complaints.length === 0 && <div className="p-10 text-center text-sm text-slate-400">No complaints in the supervisor queue.</div>}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = SupervisorDashboard;
