import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AgentActionLog } from '../types';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
} from 'lucide-react';

export const AgentTraceView: React.FC = () => {
  const { setSelectedComplaintId, refreshTrigger } = useAuth();
  const [logs, setLogs] = useState<AgentActionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchTraces = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/agent-traces');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [refreshTrigger]);

  const filtered = logs.filter((l) => {
    const matchAgent = agentFilter === 'ALL' || l.agentName === agentFilter;
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      l.complaintId.toLowerCase().includes(search.toLowerCase()) ||
      (l.toolName && l.toolName.toLowerCase().includes(search.toLowerCase()));
    return matchAgent && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            AI Governance & Agentic Observability
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Autonomous Agent Decision Traces</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full transparency logs of every AI perception, classification, tool call, and municipal escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            Logged Actions: <strong>{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, tool, or ticket..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 outline-none w-56"
            />
          </div>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Agents</option>
            <option value="CivicIntakeAgent">CivicIntakeAgent</option>
            <option value="TriageAgent">TriageAgent</option>
            <option value="RoutingAgent">RoutingAgent</option>
            <option value="SlaSentinelAgent">SlaSentinelAgent</option>
            <option value="ResolutionVerificationAgent">ResolutionVerificationAgent</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {logs.length} records
        </div>
      </div>

      {/* Traces List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading traces...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No agent actions match the filter.</div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                    {log.agentName}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{log.action}</span>
                  <span className="text-xs text-slate-400">• Tool: <code className="text-slate-600 font-mono">{log.toolName}</code></span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.resultStatus === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.resultStatus === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.resultStatus}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Reasoning: </span>
                {log.reason}
              </div>

              {/* JSON Payload preview */}
              {log.outputData && (
                <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 overflow-x-auto">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    Structured Tool Output Data:
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                    {JSON.stringify(log.outputData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Associated Ticket ID: <strong className="text-slate-700">{log.complaintId}</strong></span>
                <button
                  onClick={() => setSelectedComplaintId(log.complaintId)}
                  className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  View Complaint Details →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
