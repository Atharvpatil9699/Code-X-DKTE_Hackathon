import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { Camera, CheckCircle2, Clock, MapPin, Play, RefreshCw, Upload } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { currentUser, setSelectedComplaintId, refreshTrigger, triggerRefresh } = useAuth();
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!currentUser) return;
    setError(null);
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || 'Unable to load assigned tasks.');
      setTasks(data);
    } catch (e: any) {
      setError(e.message || 'Unable to load assigned tasks.');
    }
  };

  useEffect(() => { load(); }, [refreshTrigger, currentUser?.id]);

  const workerAction = async (id: string, action: 'accept' | 'start') => {
    setBusy(id); setError(null);
    try {
      const res = await fetch(`/api/complaints/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Unable to ${action === 'accept' ? 'accept the task' : 'start work'}.`);
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      triggerRefresh();
    } catch (e: any) {
      setError(e.message || 'Worker action failed.');
    } finally { setBusy(null); }
  };

  const submitProof = async (c: Complaint) => {
    const file = files[c.id];
    if (!file) { setError('Please choose the completed-work photo before submitting.'); return; }
    setBusy(c.id); setError(null);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const res = await fetch(`/api/complaints/${c.id}/evidence`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes[c.id] || 'Work completed at the reported location.',
          evidenceItem: { url, filename: file.name, type: 'image' }
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit completion proof.');
      setTasks(prev => prev.map(t => t.id === c.id ? data : t));
      setFiles(prev => ({ ...prev, [c.id]: null }));
      setNotes(prev => ({ ...prev, [c.id]: '' }));
      triggerRefresh();
    } catch (e: any) {
      setError(e.message || 'Completion upload failed.');
    } finally { setBusy(null); }
  };

  const active = tasks.filter(t => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(t.status));
  const review = tasks.filter(t => t.status === 'PENDING_SUPERVISOR_REVIEW');

  return <div className="space-y-6">
    <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between gap-4">
      <div><p className="text-xs uppercase tracking-wider font-bold text-emerald-400">Worker Field Portal</p><h1 className="text-2xl font-black mt-1">{currentUser?.name?.replace(/\s*\(Field Worker\)\s*$/i, '')} (Field Worker)</h1><p className="text-xs text-slate-400 mt-1">Accept → Start Work → Upload completed-work photo → Supervisor approval</p></div>
      <button onClick={load} className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-bold flex gap-2 items-center"><RefreshCw className="w-4 h-4"/> Refresh</button>
    </div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm font-semibold">{error}</div>}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[['Assigned / active', active.length, Clock], ['Awaiting supervisor approval', review.length, CheckCircle2], ['Total tasks', tasks.length, MapPin]].map(([l,v,I],i)=><div key={i} className="bg-white border border-slate-200 rounded-xl p-4"><span className="text-xs font-semibold text-slate-500">{l as string}</span><div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">{v as number}<I className="w-4 h-4 text-blue-600"/></div></div>)}</div>
    <div className="space-y-3">
      {tasks.map(c => <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1"><button onClick={() => setSelectedComplaintId(c.id)} className="font-mono font-black text-blue-700 hover:underline">{c.complaintNumber}</button><span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">{c.status.replaceAll('_',' ')}</span><div className="font-bold text-slate-900">{c.issueType}</div><p className="text-xs text-slate-600">{c.description}</p><div className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/>{c.address}</div></div>
          <div className="flex gap-2 flex-wrap">
            {c.status === 'ASSIGNED' && <button disabled={busy===c.id} onClick={() => workerAction(c.id,'accept')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold">{busy===c.id ? 'Working...' : 'Accept Task'}</button>}
            {c.status === 'ACCEPTED' && <button disabled={busy===c.id} onClick={() => workerAction(c.id,'start')} className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex gap-1"><Play className="w-4 h-4"/>Start Work</button>}
          </div>
        </div>
        {c.status === 'ASSIGNED' && <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">Supervisor assigned this task to you. Click <strong>Accept Task</strong> first.</div>}
        {c.status === 'ACCEPTED' && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">Task accepted. Click <strong>Start Work</strong> when you begin the field work.</div>}
        {c.status === 'IN_PROGRESS' && <div className="border-t pt-4 space-y-3">
          <div className="text-xs font-bold text-slate-700">Complete task and upload proof</div>
          <textarea value={notes[c.id] || ''} onChange={e => setNotes(n => ({...n,[c.id]:e.target.value}))} placeholder="Describe the work completed..." className="w-full border border-slate-200 rounded-xl p-3 text-xs min-h-20"/>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-2"><Camera className="w-4 h-4"/> {files[c.id]?.name || 'Choose completed-work photo'}<input type="file" accept="image/*" className="hidden" onChange={e => setFiles(f => ({...f,[c.id]:e.target.files?.[0] || null}))}/></label>
            <button onClick={() => submitProof(c)} disabled={busy===c.id || !files[c.id]} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2"><Upload className="w-4 h-4"/>{busy===c.id?'Submitting...':'Submit completion proof'}</button>
          </div>
          <p className="text-[11px] text-slate-500">The photo and notes will be sent to the supervisor for approval.</p>
        </div>}
        {c.status === 'PENDING_SUPERVISOR_REVIEW' && <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800"><strong>Completion submitted.</strong> Supervisor must approve or reject/reassign this work.</div>}
      </div>)}
      {tasks.length === 0 && <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400">No tasks have been assigned to you yet.</div>}
    </div>
  </div>;
};
