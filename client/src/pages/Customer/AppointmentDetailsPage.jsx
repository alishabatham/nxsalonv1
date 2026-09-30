import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../../api';
import { CheckCircle2, RefreshCw, XCircle, Scissors, Calendar, Clock, User, ArrowLeft } from 'lucide-react';

export const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState(null);
  const [token, setToken] = useState(location.state?.token || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/appointments/${id}`);
      setAppointment(res.appointment);
      if (!token) setToken(res.appointment.rescheduleToken || '');
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading appointment details...</div>;
  }

  if (!appointment) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Appointment Not Found</h3>
        <button onClick={() => navigate('/customer/salon')} className="bg-brand-600 text-white font-bold text-xs py-2 px-4 rounded-xl">
          Back to Salon Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button onClick={() => navigate('/customer/salon')} className="flex items-center gap-1 text-xs text-slate-500 font-semibold hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Salon
          </button>
          <span className="font-bold text-slate-400">Screen 7: Appointment Details</span>
        </div>

        <div className="text-center py-2 space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Details & Self-Service</h2>
          <p className="text-xs text-slate-500 font-medium">Your booking is active in our salon system</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3.5 max-w-lg mx-auto">
          <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-3">
            <span>Appointment Number:</span>
            <span className="text-brand-600 text-base">{appointment.appointmentNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-bold text-slate-900">{appointment.customerId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service Name:</span>
            <span className="font-bold text-slate-900">{appointment.serviceId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Stylist:</span>
            <span className="font-semibold text-slate-800">{appointment.staffId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time:</span>
            <span className="font-bold text-slate-900">{appointment.date} at {appointment.startTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Current Status:</span>
            <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${
              appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
              appointment.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {appointment.status}
            </span>
          </div>
          {token && (
            <div className="flex justify-between border-t border-slate-200 pt-3 font-mono">
              <span className="text-slate-500">Self-Service Token:</span>
              <span className="font-bold text-brand-600 bg-white px-2 py-0.5 rounded border border-slate-200">{token}</span>
            </div>
          )}
        </div>

        {/* Self-Service Actions (Navigates to Screen 8: Cancel and Screen 9: Reschedule) */}
        {['Booked', 'Confirmed'].includes(appointment.status) && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate(`/customer/reschedule/${appointment._id}`)}
              className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs transition-colors text-xs"
            >
              <RefreshCw className="w-4 h-4" /> Reschedule Appointment (Screen 9)
            </button>
            <button
              onClick={() => navigate(`/customer/cancel/${appointment._id}`)}
              className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs transition-colors text-xs"
            >
              <XCircle className="w-4 h-4" /> Cancel Appointment (Screen 8)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
