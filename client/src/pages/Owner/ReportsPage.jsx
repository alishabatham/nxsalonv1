import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { BarChart3, TrendingUp, Calendar, Users, Scissors, Package } from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/reports');
      setReports(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading salon analytics reports...</div>;
  }

  const sales = reports?.salesReport || {};
  const appts = reports?.appointmentReport || {};
  const staff = reports?.staffReport || [];
  const services = reports?.serviceReport || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports & Operational Analytics</h2>
        <p className="text-xs text-slate-500 font-medium">Aggregated metrics from actual database sales, appointments, staff, and services</p>
      </div>

      {/* Sales Summary Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Financial Sales Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Gross Sales</span>
            <span className="text-xl font-extrabold text-slate-900">₹{sales.grossSales || 0}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Total Discounts</span>
            <span className="text-xl font-extrabold text-emerald-700">-₹{sales.totalDiscounts || 0}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Total Tax Collected</span>
            <span className="text-xl font-extrabold text-slate-700">₹{sales.totalTax || 0}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Grand Total Revenue</span>
            <span className="text-xl font-extrabold text-brand-600">₹{sales.grandTotalSales || 0}</span>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2">Payment Method Breakdown</h4>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {Object.entries(sales.paymentMethodBreakdown || {}).map(([method, amt]) => (
              <div key={method} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-600">{method}:</span>
                <span className="font-bold text-slate-900">₹{amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment & Staff Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-brand-600" /> Appointment Status Distribution
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium block">Total Bookings</span>
              <span className="text-xl font-extrabold text-slate-900">{appts.total || 0}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-700 font-medium block">Completed Services</span>
              <span className="text-xl font-extrabold text-emerald-800">{appts.completed || 0}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <span className="text-rose-700 font-medium block">Cancelled Appts</span>
              <span className="text-xl font-extrabold text-rose-800">{appts.cancelled || 0}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="text-amber-800 font-medium block">No-shows</span>
              <span className="text-xl font-extrabold text-amber-900">{appts.noShow || 0}</span>
            </div>
          </div>
        </div>

        {/* Staff Performance Report */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-indigo-600" /> Staff Performance & Sales Generated
          </h3>
          <div className="space-y-2 text-xs">
            {staff.map(st => (
              <div key={st.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{st.name}</span>
                  <span className="text-[10px] text-slate-400 block">{st.role}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{st.appointmentsHandled} completed</span>
                  <span className="text-emerald-600 font-bold text-[11px]">₹{st.salesGenerated} revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Revenue Performance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
          <Scissors className="w-4 h-4 text-purple-600" /> Top Services & Revenue Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {services.map(s => (
            <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{s.name}</span>
                <span className="text-slate-400 text-[10px]">{s.category}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 block">{s.count} done</span>
                <span className="font-extrabold text-slate-900">₹{s.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
