import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  PlusCircle, 
  UserPlus, 
  Receipt, 
  PackagePlus, 
  UserCheck, 
  Scissors,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const OwnerDashboard = ({ onNavigate, onOpenNewAppt }) => {
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
      console.error('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading Owner Business Dashboard...</div>;
  }

  const metrics = data?.metrics || {};
  const todayAppointments = data?.todayAppointments || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const staffSummary = data?.staffSummary || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Owner Business Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time salon operations and daily financial overview</p>
        </div>

        {/* Quick Actions Bar (Spec Section 66) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenNewAppt}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> New Appt
          </button>
          <button
            onClick={() => onNavigate('customers')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" /> New Customer
          </button>
          <button
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
          >
            <Receipt className="w-4 h-4" /> Create Bill
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl transition-all"
          >
            <PackagePlus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">₹{metrics.todaySales || 0}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Total Sales: ₹{metrics.totalSales || 0}</p>
          </div>
        </div>

        {/* Card 2: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Appts</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{metrics.todayAppointmentsCount || 0}</h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
              <span className="text-emerald-600 font-bold">{metrics.completedToday || 0} Done</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">{metrics.cancelledToday || 0} Cancel</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{metrics.noShowToday || 0} No-show</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{metrics.todayCustomersCount || 0}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Total Lifetime Customers: {metrics.totalCustomersCount || 0}</p>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-amber-700">₹{metrics.pendingAmount || 0}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Collectable balance from pending bills</p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              Today's Schedule & Appointments
            </h3>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-brand-600 text-xs font-bold hover:underline"
            >
              View All
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              No appointments scheduled for today yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
              {todayAppointments.map(appt => (
                <div key={appt._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center bg-slate-100 py-1.5 px-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block">{appt.startTime}</span>
                      <span className="text-[10px] text-slate-400">{appt.duration}m</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{appt.customerId?.name || 'Walk-in Customer'}</div>
                      <div className="text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Scissors className="w-3 h-3 text-slate-400" /> {appt.serviceId?.name} • <span className="font-semibold text-slate-700">{appt.staffId?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                      appt.status === 'No-show' ? 'bg-slate-100 text-slate-700' :
                      appt.status === 'Checked-in' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Low Stock Warnings & Staff Performance */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Stock Alerts
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-brand-600 text-xs font-bold hover:underline"
              >
                Manage Inventory
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 bg-emerald-50/50 rounded-xl text-xs text-emerald-700 font-medium">
                ✓ All products are sufficiently stocked.
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map(prod => (
                  <div key={prod._id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-amber-800 text-[11px] font-medium">Min threshold: {prod.minStock}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded-lg text-xs">
                      {prod.currentStock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Summary Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Staff Activity Summary
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {staffSummary.map(st => (
                <div key={st.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{st.name}</span>
                    <span className="text-[10px] text-slate-400 block">{st.role}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{st.completedCount} services done</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
