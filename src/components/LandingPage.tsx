import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  MapPin,
  Sparkles,
  Bot,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Eye,
  FileText,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setIsReportModalOpen, setActiveTab, setSelectedComplaintId } = useAuth();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Autonomous Municipal Operating System
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Report. Resolve. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Track. Escalate.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            CivicResolve AI bridges the gap between citizens and municipal maintenance.
            Powered by multi-modal perception, autonomous triage, live GIS geolocation, and hierarchical SLA escalation sentinel.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Report Civic Issue (7-Step Wizard)
            </button>

            <button
              onClick={() => setActiveTab('workflow')}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-blue-400" />
              Explore System Architecture
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Live GIS City Map
            </button>
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Feature Pillars Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Civic Resolution Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From field reporting to verified citizen closure with complete transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: PlusCircle,
              title: 'Multi-Modal Reporting',
              desc: 'Submit complaints via Text, Voice (English/Marathi/Hindi Speech-to-Text), and Photo Evidence.',
              badge: 'Input Engine',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              icon: Bot,
              title: 'Civic AI Agent',
              desc: 'Server-side Gemini Vision classifies defect category, calculates 0-100% confidence, and assesses public risk.',
              badge: 'Intelligent Triage',
              color: 'text-purple-600 bg-purple-50',
            },
            {
              icon: MapPin,
              title: 'Live Location & GIS',
              desc: 'Browser Geolocation + Leaflet interactive draggable pinpoint + reverse geocoding to exact address.',
              badge: 'Location Intelligence',
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              icon: Clock,
              title: 'Autonomous SLA Sentinel',
              desc: 'Dynamic countdowns (Critical 6h, High 24h). Auto-escalates to division supervisor when overdue.',
              badge: 'SLA Watchdog',
              color: 'text-red-600 bg-red-50',
            },
            {
              icon: Wrench,
              title: 'Field Officer Portal',
              desc: 'Engineers accept work, manage crew in-progress status, and upload before/after repair photos.',
              badge: 'Operations',
              color: 'text-amber-600 bg-amber-50',
            },
            {
              icon: ShieldCheck,
              title: 'Citizen Verification',
              desc: 'Tickets cannot be closed without resident sign-off. If unsatisfied, citizens can reopen with reason.',
              badge: 'Governance',
              color: 'text-teal-600 bg-teal-50',
            },
            {
              icon: Activity,
              title: 'Agent Decision Trace',
              desc: 'Every model prompt, input, tool execution, and outcome is logged for municipal accountability.',
              badge: 'Transparency',
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              icon: Sparkles,
              title: 'AI Civic Insights',
              desc: 'City-wide hotspot clustering and predictive infrastructure maintenance recommendations.',
              badge: 'Decision Support',
              color: 'text-pink-600 bg-pink-50',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Flow banner */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">How CivicResolve AI Operates</h2>
            <p className="text-xs text-slate-500 mt-0.5">Continuous automated feedback loop from report to verified repair</p>
          </div>
          <button
            onClick={() => setActiveTab('workflow')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Inspect Interactive Flowchart
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Citizen Reports', desc: 'Capture voice, photos, and exact pin on map in under 45 seconds.' },
            { step: '02', title: 'Agent Triage', desc: 'Gemini Vision AI classifies defect, assigns department & sets SLA.' },
            { step: '03', title: 'Field Crew Repair', desc: 'Junior Engineer arrives on site, fixes issue, and uploads repair proof.' },
            { step: '04', title: 'Citizen Sign-Off', desc: 'Citizen verifies repair quality; ticket closes or auto-reopens.' },
          ].map((s, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative">
              <span className="text-2xl font-black text-blue-600/30">{s.step}</span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">{s.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
