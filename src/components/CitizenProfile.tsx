import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [language, setLanguage] = useState<string>('English / Marathi');
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(true);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                Active Citizen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Ward 14 • Pune Municipal Corporation (PMC)</p>
          </div>
        </div>

        {/* Civic Impact Badge */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">Civic Sentinel Level 3</div>
            <div className="text-[11px] text-emerald-700">12 neighborhood defects resolved</div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Contact & Location Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="bg-transparent outline-none flex-1 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Phone (for SMS notifications)</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  defaultValue={currentUser.phone || '+91 94220 88990'}
                  className="bg-transparent outline-none flex-1 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Registered Email</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="bg-transparent outline-none flex-1 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Preferred Language for Voice & SMS</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                <Globe className="w-4 h-4 text-slate-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-slate-800 text-xs"
                >
                  <option value="English / Marathi">English / Marathi (मराठी)</option>
                  <option value="English / Hindi">English / Hindi (हिंदी)</option>
                  <option value="English Only">English Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            My Frequent Neighborhood Locations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Home Residence</div>
              <div className="text-slate-500 mt-0.5">Plot 42, Model Colony, Shivaji Nagar, Pune 411016</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Office / Workplace</div>
              <div className="text-slate-500 mt-0.5">Tech Park, Senapati Bapat Road, Pune 411004</div>
            </div>
          </div>
        </div>

        {/* Notification settings */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Automated SLA & Resolution Alerts
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">Send SMS updates when status changes or repair crew mobilizes</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-800 font-medium">Receive WhatsApp photo proofs before citizen verification</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Preferences
          </button>

          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
