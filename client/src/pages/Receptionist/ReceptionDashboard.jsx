import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { LayoutDashboard, Calendar, Users, Receipt, PlusCircle, UserPlus, CheckCircle2, Clock, Play } from 'lucide-react';

export const ReceptionDashboard = ({ onNavigate, onOpenNewAppt }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading Front-Desk Dashboard...</div>;
  }

  const metrics = data?.metrics || {};
  const todayAppointments = data?.todayAppointments || [];
  const checkedInCustomers = data?.checkedInCustomers || [];
  const pendingBills = data?.pendingBills || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Receptionist Front-Desk Operations</h2>
          <p className="text-xs text-slate-500 font-medium">Daily check-in queue, active services, and quick billing</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewAppt}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Quick Appointment
          </button>
          <button
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
          >
            <Receipt className="w-4 h-4" /> Create Bill
          </button>
        </div>
      </div>

      {/* Reception KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Appointments</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.todayAppointmentsCount || 0}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Checked-in / In Service</span>
          <h3 className="text-2xl font-extrabold text-blue-700 mt-2">{metrics.checkedInCount || 0}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Bills</span>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-2">{metrics.pendingBillsCount || 0}</h3>
        </div>
      </div>

      {/* Checked-in Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" /> Currently Checked-in Queue
          </h3>
          {checkedInCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">No customers currently waiting or in service.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {checkedInCustomers.map(a => (
                <div key={a._id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{a.customerId?.name}</span>
                    <span className="text-slate-500">{a.serviceId?.name} with {a.staffId?.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-200 text-blue-900">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Bills Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" /> Pending Bills & Checkout
          </h3>
          {pendingBills.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">No pending unpaid bills.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {pendingBills.map(b => (
                <div key={b._id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{b.invoiceNumber} - {b.customerId?.name}</span>
                    <span className="text-amber-800 font-bold">Pending: ₹{b.pendingAmount}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('billing')}
                    className="bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg"
                  >
                    Checkout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
