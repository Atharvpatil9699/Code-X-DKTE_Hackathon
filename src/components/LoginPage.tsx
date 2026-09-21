import React, { useState } from 'react';
import { ShieldCheck, UserRound, LockKeyhole, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  ['Citizen', 'citizen@civicresolve.org', 'citizen123'],
  ['Supervisor', 'supervisor@civicresolve.org', 'supervisor123'],
  ['Worker', 'officer@civicresolve.org', 'worker123'],
] as const;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('citizen@civicresolve.org');
  const [password, setPassword] = useState('citizen123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true);
    const result = await login(email.trim(), password);
    if (!result.ok) setError(result.error || 'Invalid credentials');
    setBusy(false);
  };

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-7 text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-5"><ShieldCheck className="w-7 h-7" /></div>
        <h1 className="text-2xl font-black">CivicResolve</h1>
        <p className="text-blue-100 text-sm mt-1">Secure civic issue resolution platform</p>
      </div>
      <form onSubmit={submit} className="p-7 space-y-5">
        <div><label className="text-xs font-bold text-slate-600">Email</label><div className="relative mt-1"><UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"/></div></div>
        <div><label className="text-xs font-bold text-slate-600">Password</label><div className="relative mt-1"><LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"/></div></div>
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">{error}</div>}
        <button disabled={busy} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">{busy ? 'Signing in...' : 'Sign in'}<ArrowRight className="w-4 h-4"/></button>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Info className="w-4 h-4 text-blue-600"/> Demo credentials</div><div className="mt-2 space-y-1">{DEMO_ACCOUNTS.map(([role,e,p])=><button type="button" key={role} onClick={()=>{setEmail(e);setPassword(p)}} className="w-full text-left text-[11px] text-slate-600 hover:text-blue-700"><strong>{role}:</strong> {e} / {p}</button>)}</div></div>
      </form>
    </div>
  </div>;
};
