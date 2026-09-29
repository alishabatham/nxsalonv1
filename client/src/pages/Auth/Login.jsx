import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Scissors, Lock, PhoneCall, Sparkles } from 'lucide-react';

export const Login = ({ onSwitchToForgot }) => {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginId, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setLoginId(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-lg shadow-brand-500/30">
            NX
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">NX SALON OS</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Production Salon Business Operating System</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Mobile Number or Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="owner@nxsalon.com or 9876543210"
                className="w-full p-3 pl-10 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">Password</label>
              <button
                type="button"
                onClick={onSwitchToForgot}
                className="text-brand-600 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pl-10 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-98 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Quick Demo Login Presets */}
        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Demo Login Presets
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickFill('owner@nxsalon.com', 'password123')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 text-center transition-all"
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-700" />
              <span className="text-[11px] font-bold block">Owner</span>
            </button>
            <button
              onClick={() => handleQuickFill('reception@nxsalon.com', 'password123')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 text-center transition-all"
            >
              <UserCheck className="w-4 h-4 mx-auto mb-1 text-blue-700" />
              <span className="text-[11px] font-bold block">Reception</span>
            </button>
            <button
              onClick={() => handleQuickFill('rahul@nxsalon.com', 'password123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 text-center transition-all"
            >
              <Scissors className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
              <span className="text-[11px] font-bold block">Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
