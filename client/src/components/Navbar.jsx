import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Sparkles, PlusCircle, ShieldCheck, UserCheck, Scissors, Search } from 'lucide-react';
import { fetchApi } from '../api';

export const Navbar = ({ onOpenNewAppt, onOpenNotifications }) => {
  const { user, salon, logout, quickSwitchRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const data = await fetchApi('/notifications');
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Silent fail for notification check
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Owner / Admin</span>;
      case 'receptionist':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold"><UserCheck className="w-3.5 h-3.5" /> Receptionist</span>;
      case 'staff':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold"><Scissors className="w-3.5 h-3.5" /> Stylist / Staff</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-semibold">Customer</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            NX
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight text-base tracking-tight">{salon?.name || 'NX Salon OS'}</h1>
            <p className="text-xs text-slate-500 font-medium">Salon Business Operating System</p>
          </div>
        </div>
      </div>

      {/* Role Switcher & Action Items */}
      <div className="flex items-center gap-3">
        {/* Quick Role Tester Bar */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-400 font-medium px-2">Switch View:</span>
          <button
            onClick={() => quickSwitchRole('owner')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${user?.role === 'owner' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Owner
          </button>
          <button
            onClick={() => quickSwitchRole('receptionist')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${user?.role === 'receptionist' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Reception
          </button>
          <button
            onClick={() => quickSwitchRole('staff')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${user?.role === 'staff' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Staff
          </button>
          <button
            onClick={() => quickSwitchRole('customer')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${user?.role === 'customer' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Public Booking
          </button>
        </div>

        {/* Quick New Appointment button */}
        {user && user.role !== 'customer' && (
          <button
            onClick={onOpenNewAppt}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        )}

        {/* Notifications Icon */}
        {user && user.role !== 'customer' && (
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* User Info / Logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-800">{user.name}</div>
              {getRoleBadge(user.role)}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-sm"
          >
            Staff Login
          </a>
        )}
      </div>
    </header>
  );
};
