import React, { useState } from 'react';
import { fetchApi } from '../../api';
import { ArrowLeft, KeyRound, PhoneCall, CheckCircle } from 'lucide-react';

export const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Enter mobile/email, 2: OTP & New Password
  const [loginId, setLoginId] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ loginId })
      });
      setSimulatedOtp(data.simulatedOtp || '123456');
      setUserId(data.userId || '');
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          otp,
          newPassword,
          confirmPassword
        })
      });
      setMessage(data.message);
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-6 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-500 mt-1">Reset your account password securely</p>
        </div>

        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}
        {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Enter Mobile Number or Email</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="9876543210 or owner@nxsalon.com"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 font-medium"
                />
                <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            {simulatedOtp && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-center">
                <span className="font-semibold">Simulated Verification OTP:</span> <span className="font-bold text-sm tracking-widest">{simulatedOtp}</span>
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Enter 6-digit OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-center tracking-widest text-base"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              {loading ? 'Updating Password...' : 'Reset Password & Proceed'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
