import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, PlusCircle, FileText, Activity, BarChart3, ShieldCheck, LogOut, UserRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, activeRole, activeTab, setActiveTab, setIsReportModalOpen, notifications, unreadCount, markNotificationAsRead, setSelectedComplaintId, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck, roles: ['CITIZEN','WORKER','SUPERVISOR'] },
    { id: 'workflow', label: 'Workflow', icon: Activity, roles: ['CITIZEN','WORKER','SUPERVISOR'] },
    { id: 'complaints', label: activeRole === 'CITIZEN' ? 'My Reports' : activeRole === 'WORKER' ? 'My Tasks' : 'Supervisor Queue', icon: FileText, roles: ['CITIZEN','WORKER','SUPERVISOR'] },
    { id: 'map', label: 'Civic Map', icon: MapPin, roles: ['CITIZEN','WORKER','SUPERVISOR'] },
    { id: 'agent-trace', label: 'Agent Trace', icon: Activity, roles: ['SUPERVISOR'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['SUPERVISOR'] },
    { id: 'profile', label: 'Profile', icon: UserRound, roles: ['CITIZEN'] },
  ];

  return <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <button onClick={()=>setActiveTab('dashboard')} className="flex items-center gap-2.5 text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><ShieldCheck className="w-6 h-6"/></div>
        <div><div className="font-bold text-slate-900 text-lg">CivicResolve <span className="text-blue-600">AI</span></div><p className="text-[11px] text-slate-500 hidden sm:block">Citizen → Supervisor → Worker → Verification</p></div>
      </button>
      <nav className="hidden lg:flex items-center gap-1">{links.filter(l=>l.roles.includes(activeRole || '')).map(l=>{const I=l.icon; return <button key={l.id} onClick={()=>setActiveTab(l.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab===l.id?'bg-blue-50 text-blue-700':'text-slate-600 hover:bg-slate-50'}`}><I className="w-4 h-4"/>{l.label}</button>})}</nav>
      <div className="flex items-center gap-2">
        {activeRole==='CITIZEN' && <button onClick={()=>setIsReportModalOpen(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"><PlusCircle className="w-4 h-4"/> Report Issue</button>}
        <div className="relative"><button onClick={()=>setIsNotifOpen(v=>!v)} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Bell className="w-5 h-5"/>{unreadCount>0&&<span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}</button>
        {isNotifOpen&&<div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"><div className="p-3 border-b font-bold text-xs">Notifications</div><div className="max-h-80 overflow-auto">{notifications.length===0?<div className="p-6 text-center text-xs text-slate-400">No notifications</div>:notifications.map(n=><button key={n.id} onClick={()=>{markNotificationAsRead(n.id);if(n.complaintId)setSelectedComplaintId(n.complaintId);}} className={`w-full text-left p-3 border-b hover:bg-slate-50 ${n.read?'':'bg-blue-50/50'}`}><div className="text-xs font-bold text-slate-800">{n.title}</div><div className="text-[11px] text-slate-500 mt-1">{n.message}</div></button>)}</div></div>}</div>
        <div className="hidden sm:block text-right"><div className="text-xs font-bold text-slate-800">{currentUser?.name}</div><div className="text-[10px] text-blue-600 font-bold uppercase">{activeRole}</div></div>
        <button onClick={logout} title="Sign out" className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4"/></button>
      </div>
    </div>
  </header>;
};
