import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertTriangle, CheckCircle2, RotateCcw, Zap, Clock, ShieldAlert } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { triggerRefresh, setSelectedComplaintId, setActiveTab } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [demoStatusMsg, setDemoStatusMsg] = useState<string | null>(null);

  const runScenario = async (scenario: 'pothole' | 'manhole' | 'garbage' | 'breach' | 'resolve' | 'reset') => {
    setLoadingAction(scenario);
    setDemoStatusMsg(null);
    try {
      const res = await fetch('/api/demo/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      triggerRefresh();

      if (scenario === 'reset') {
        setDemoStatusMsg('Database reset to initial sample state.');
        setActiveTab('dashboard');
      } else if (data.complaint) {
        setSelectedComplaintId(data.complaint.id);
        if (scenario === 'breach') {
          setDemoStatusMsg(`SLA Breach simulated on ${data.complaint.complaintNumber}! Level 2 Escalation activated.`);
        } else if (scenario === 'resolve') {
          setDemoStatusMsg(`Repair evidence uploaded for ${data.complaint.complaintNumber}! Status: Citizen Verification.`);
        } else {
          setDemoStatusMsg(`Demo ticket ${data.complaint.complaintNumber} (${data.complaint.issueType}) generated and triaged.`);
        }
      }
    } catch (e) {
      console.error(e);
      setDemoStatusMsg('Action failed. Check console.');
    } finally {
      setLoadingAction(null);
      setTimeout(() => setDemoStatusMsg(null), 5000);
    }
  };

  return (
    <div id="hackathon-demo-bar" className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            Hackathon Live Demo Sandbox
          </span>
          <span className="text-slate-400 hidden sm:inline">1-Click Test Scenarios:</span>
        </div>

        {demoStatusMsg && (
          <span className="text-emerald-400 font-medium animate-fade-in bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
            {demoStatusMsg}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="demo-pothole-btn"
            onClick={() => runScenario('pothole')}
            disabled={!!loadingAction}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Create High Priority Road Pothole Complaint"
          >
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            Pothole (High)
          </button>

          <button
            id="demo-manhole-btn"
            onClick={() => runScenario('manhole')}
            disabled={!!loadingAction}
            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white border border-red-800/60 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Create Critical Open Manhole Complaint in School Zone"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            Open Manhole (Critical)
          </button>

          <button
            id="demo-garbage-btn"
            onClick={() => runScenario('garbage')}
            disabled={!!loadingAction}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Create Solid Waste Accumulation Complaint"
          >
            <Zap className="w-3 h-3 text-yellow-400" />
            Garbage Dump
          </button>

          <button
            id="demo-breach-btn"
            onClick={() => runScenario('breach')}
            disabled={!!loadingAction}
            className="px-2.5 py-1 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-800/80 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Simulate SLA Expiry and trigger Level 2 Supervisor Escalation"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            Simulate SLA Breach
          </button>

          <button
            id="demo-resolve-btn"
            onClick={() => runScenario('resolve')}
            disabled={!!loadingAction}
            className="px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Officer uploads repair photos & triggers citizen verification"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Field Resolve Proof
          </button>

          <button
            id="demo-reset-btn"
            onClick={() => runScenario('reset')}
            disabled={!!loadingAction}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-50 ml-1"
            title="Reset database to initial seed data"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
