import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { Bell, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-2xs animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm">Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400">System alerts and low-stock warnings will appear here</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  n.read 
                    ? 'bg-white border-slate-200 opacity-70' 
                    : 'bg-brand-50/50 border-brand-200 shadow-2xs font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-bold ${n.type === 'Low Stock' ? 'text-amber-700' : 'text-slate-900'}`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{n.message}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">{n.channel} ({n.deliveryStatus})</span>
                  {!n.read && <span className="text-brand-600 font-bold">Mark as read</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
