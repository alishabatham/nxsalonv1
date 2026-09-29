import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Scissors, Play, CheckCircle2, Clock, Calendar, User } from 'lucide-react';

export const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffDashboard();
  }, []);

  const loadStaffDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/dashboard');
      setData(res);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadStaffDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading Stylist Dashboard...</div>;
  }

  const currentAppt = data?.currentAppt;
  const upcomingAppt = data?.upcomingAppt;
  const todayAppointments = data?.todayAppointments || [];
  const completedCount = data?.metrics?.completedCount || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Stylist Workspace & Schedule</h2>
        <p className="text-xs text-slate-500 font-medium">Manage assigned customer services, start timers, and record completions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Assigned Services</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{todayAppointments.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Services Completed</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{completedCount}</h3>
        </div>
      </div>

      {/* Active Current Appointment Focus Card */}
      {currentAppt ? (
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              🔥 Current Active Appointment
            </span>
            <span className="font-bold text-sm bg-white/10 px-3 py-1 rounded-full">{currentAppt.startTime} - {currentAppt.endTime}</span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold">{currentAppt.customerId?.name || 'Walk-in Customer'}</h3>
            <p className="text-brand-100 font-medium text-sm mt-1">{currentAppt.serviceId?.name} ({currentAppt.duration} mins)</p>
            {currentAppt.customerId?.notes && (
              <p className="text-xs bg-black/20 p-2.5 rounded-xl mt-2 italic">Note: {currentAppt.customerId.notes}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {currentAppt.status === 'Checked-in' && (
              <button
                onClick={() => handleStatusChange(currentAppt._id, 'In Service')}
                className="bg-white text-brand-700 hover:bg-slate-100 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> Start Service Now
              </button>
            )}
            {currentAppt.status === 'In Service' && (
              <button
                onClick={() => handleStatusChange(currentAppt._id, 'Completed')}
                className="bg-emerald-400 text-slate-900 hover:bg-emerald-300 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Service Completed
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
          No service currently active. Select an appointment from today's schedule below.
        </div>
      )}

      {/* Today's Full Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" /> Today's Service Schedule
        </h3>

        {todayAppointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No appointments assigned to you today.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {todayAppointments.map(appt => (
              <div key={appt._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-center bg-slate-100 py-1.5 px-2 rounded-xl font-bold text-slate-900">
                    {appt.startTime}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{appt.customerId?.name}</div>
                    <div className="text-slate-500">{appt.serviceId?.name} • {appt.duration}m</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    appt.status === 'In Service' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {appt.status}
                  </span>

                  {appt.status === 'Checked-in' && (
                    <button
                      onClick={() => handleStatusChange(appt._id, 'In Service')}
                      className="bg-brand-600 text-white font-bold px-3 py-1 rounded-lg text-[11px]"
                    >
                      Start
                    </button>
                  )}
                  {appt.status === 'In Service' && (
                    <button
                      onClick={() => handleStatusChange(appt._id, 'Completed')}
                      className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[11px]"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
