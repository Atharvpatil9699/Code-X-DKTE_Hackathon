import React, { useState } from 'react';
import {
  User,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Mic,
  Image as ImageIcon,
  MapPin,
  Bot,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Cpu,
  Ticket,
  ShieldAlert,
  UserCheck,
  Wrench,
  Clock,
  CheckCircle2,
  RotateCcw,
  Activity,
  BarChart3,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WorkflowVisualizer: React.FC = () => {
  const { setActiveTab, setIsReportModalOpen } = useAuth();
  const [selectedNode, setSelectedNode] = useState<string>('civic-ai');

  const nodes = [
    {
      id: 'citizen',
      title: '1. Citizen Intake',
      role: 'CITIZEN',
      icon: User,
      color: 'bg-blue-50 border-blue-300 text-blue-800',
      description: 'Resident accesses responsive portal to register complaints across municipal jurisdictions.',
      details: 'Supports self-registration, SMS alerts preference, and saved neighborhood locations.',
    },
    {
      id: 'multimodal',
      title: '2. Multi-Modal Input',
      role: 'INPUT_PROCESSOR',
      icon: PlusCircle,
      color: 'bg-indigo-50 border-indigo-300 text-indigo-800',
      description: 'Accepts plain text, multi-lingual voice recording, and camera photos/videos.',
      details: 'Speech-to-Text normalizer supports English, Marathi, and Hindi audio streams.',
    },
    {
      id: 'location',
      title: '3. Live Geolocation',
      role: 'GIS_ENGINE',
      icon: MapPin,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      description: 'Browser Geolocation API + Leaflet drag marker + Reverse geocoding.',
      details: 'Captures lat/lng coordinates and converts them to human-readable landmarks and ward zones.',
    },
    {
      id: 'civic-ai',
      title: '4. Civic AI Agent',
      role: 'AGENTIC_CORE',
      icon: Bot,
      color: 'bg-purple-50 border-purple-300 text-purple-800',
      description: 'Autonomous Gemini vision & linguistic triage: Classification + Evidence Grounding + Severity.',
      details: 'Evaluates physical defect size, pedestrian exposure, vehicle hazard, and calculates 0-100% confidence.',
    },
    {
      id: 'department',
      title: '5. Department & Rules',
      role: 'RULE_ENGINE',
      icon: Building2,
      color: 'bg-cyan-50 border-cyan-300 text-cyan-800',
      description: 'Routes to Roads, Sanitation, Drainage, Electrical, Traffic, or Water Supply.',
      details: 'Applies municipal jurisdiction matrix, duplicate detection (<500m), and generates ticket CIV-2026-XXXX.',
    },
    {
      id: 'assignment',
      title: '6. Supervisor Assignment',
      role: 'SUPERVISOR_COMMAND',
      icon: UserCheck,
      color: 'bg-blue-50 border-blue-300 text-blue-800',
      description: 'Supervisor reviews the classified citizen report and assigns an appropriate field worker.',
      details: 'Creates an auditable assignment record and sends the worker a task notification.',
    },
    {
      id: 'officer',
      title: '7. Worker Task Execution',
      role: 'FIELD_WORKER',
      icon: Wrench,
      color: 'bg-amber-50 border-amber-300 text-amber-800',
      description: 'Assigned worker receives the notification, accepts the task, performs the field work, and updates progress.',
      details: 'Worker can open the location, accept/start the task, and upload a completion photo after the work is done.',
    },
    {
      id: 'sla',
      title: '8. SLA Sentinel Watchdog',
      role: 'AUTONOMOUS_SENTINEL',
      icon: Clock,
      color: 'bg-red-50 border-red-300 text-red-800',
      description: 'Calculates dynamic countdown (Critical: 6h, High: 24h, Medium: 48h).',
      details: 'Triggers Level 2 (Supervisor) or Level 3 (Supervisor) escalations if deadline breached.',
    },
    {
      id: 'resolution',
      title: '9. Worker Completion Proof',
      role: 'VERIFICATION_ENGINE',
      icon: CheckCircle2,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      description: 'Worker uploads a photo of the completed work. The task moves to supervisor review.',
      details: 'Completion evidence is stored against the ticket and a supervisor notification is created.',
    },
    {
      id: 'verification',
      title: '10. Supervisor Approval & Citizen Notification',
      role: 'CITIZEN_GATE',
      icon: ShieldCheck,
      color: 'bg-pink-50 border-pink-300 text-pink-800',
      description: 'Supervisor reviews the worker photo and either approves the work or reassigns the task. Approved work notifies the reporting citizen.',
      details: 'Supervisor approval creates a citizen verification step; the citizen can confirm or reopen the issue.',
    },
    {
      id: 'trace',
      title: '11. Agent Decision Trace',
      role: 'GOVERNANCE',
      icon: Activity,
      color: 'bg-slate-50 border-slate-300 text-slate-800',
      description: 'Complete audit log of every model prompt, tool call, timestamp, input, and output.',
      details: 'Full transparency for municipal supervisors and civic oversight committees.',
    },
    {
      id: 'analytics',
      title: '12. City Analytics & Insights',
      role: 'DECISION_SUPPORT',
      icon: BarChart3,
      color: 'bg-teal-50 border-teal-300 text-teal-800',
      description: 'Hotspot detection, department SLA compliance rates, and AI civic recommendations.',
      details: 'Identifies recurring seasonal defects, contractor performance, and city-wide trend lines.',
    },
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[3];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Interactive System Architecture
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            CivicResolve AI Complete Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any stage below to inspect the underlying autonomous agent logic, rule engine validations, and data flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Test Live Intake
          </button>
        </div>
      </div>

      {/* Interactive Workflow Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Flowchart Nodes */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node, idx) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${node.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{node.title}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                        {node.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Deep Node Inspector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className={`p-2 rounded-lg ${activeNodeData.color}`}>
              {React.createElement(activeNodeData.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Stage Inspector</div>
              <h3 className="text-sm font-black text-slate-900">{activeNodeData.title}</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Functional Description:</span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {activeNodeData.description}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Agent & System Logic:</span>
              <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                {activeNodeData.details}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700 block mb-1.5">Associated Prototype Actions:</span>
              <div className="space-y-1.5">
                {activeNodeData.id === 'citizen' || activeNodeData.id === 'multimodal' ? (
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Launch 7-Step Intake Wizard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : activeNodeData.id === 'location' ? (
                  <button
                    onClick={() => setActiveTab('map')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Open Live Civic GIS Map</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : activeNodeData.id === 'trace' ? (
                  <button
                    onClick={() => setActiveTab('agent-trace')}
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>View Agent Decision Traces</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : activeNodeData.id === 'analytics' ? (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Inspect City Analytics & SLA</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>View All Live Complaints</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
