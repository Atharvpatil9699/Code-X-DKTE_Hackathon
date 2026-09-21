import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoBar } from './components/DemoBar';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { SupervisorDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { CivicMapView } from './components/CivicMapView';
import { AgentTraceView } from './components/AgentTraceView';
import { CitizenProfile } from './components/CitizenProfile';
import { LandingPage } from './components/LandingPage';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { ReportIssueModal } from './components/ReportIssueModal';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { ShieldCheck, PhoneCall, HeartHandshake, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeRole, activeTab, authenticated } = useAuth();

  if (!authenticated) return <LoginPage />;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;

      case 'workflow':
        return <WorkflowVisualizer />;

      case 'dashboard':
        if (activeRole === 'CITIZEN') return <CitizenDashboard />;
        if (activeRole === 'WORKER') return <OfficerDashboard />;
        return <SupervisorDashboard />;

      case 'complaints':
        if (activeRole === 'CITIZEN') return <CitizenDashboard />;
        if (activeRole === 'WORKER') return <OfficerDashboard />;
        return <SupervisorDashboard />;

      case 'map':
        return <CivicMapView />;

      case 'agent-trace':
        return <AgentTraceView />;

      case 'analytics':
        return <SupervisorDashboard />;

      case 'profile':
        return <CitizenProfile />;

      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* 1-Click Sandbox Test Scenarios Toolbar */}
      <DemoBar />

      {/* Primary Sticky Navbar */}
      <Navbar />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderActiveView()}
      </main>

      {/* Modals */}
      <ReportIssueModal />
      <ComplaintDetailsModal />

      {/* Municipal Civic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">CivicResolve AI Municipal Operating System</span>
            <span>•</span>
            <span>Powered by Gemini & Agentic Orchestration</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              SLA Sentinel: Active
            </span>
            <span>Toll-Free Helpline: 1800-PMC-CIVIC</span>
            <span>Wards 1–18 Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
