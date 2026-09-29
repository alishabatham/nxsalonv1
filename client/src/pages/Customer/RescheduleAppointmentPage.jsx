import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const RescheduleAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  useEffect(() => {
    if (appointment && newDate) {
      loadSlots();
    }
  }, [appointment, newDate]);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/appointments/${id}`);
      setAppointment(res.appointment);
      setNewDate(res.appointment.date);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!appointment) return;
    setSlotsLoading(true);
    try {
      const serviceIdVal = appointment.serviceId?._id || appointment.serviceId;
      const staffIdVal = appointment.staffId?._id || appointment.staffId;
      const data = await fetchApi(`/appointments/available-slots?date=${newDate}&serviceId=${serviceIdVal}&staffId=${staffIdVal}`);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newStartTime) {
      setError('Please select a new time slot');
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi(`/appointments/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate,
          newStartTime
        })
      });
      setSuccessMessage('Appointment rescheduled successfully!');
      setTimeout(() => {
        navigate(`/customer/appointment/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading appointment details...</div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button onClick={() => navigate(`/customer/appointment/${id}`)} className="flex items-center gap-1 text-xs text-slate-500 font-semibold hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Appointment
          </button>
          <span className="font-bold text-brand-600">Screen 9: Reschedule Appointment</span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reschedule Appointment (Screen 9)</h2>
          <p className="text-xs text-slate-500 font-medium">Select a new date & available time slot for your booking</p>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}
        {successMessage && <div className="p-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {successMessage}</div>}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900">Appointment #: {appointment?.appointmentNumber}</div>
          <div className="text-slate-600">Service: <strong>{appointment?.serviceId?.name}</strong></div>
          <div className="text-slate-600">Current Slot: <strong>{appointment?.date} at {appointment?.startTime}</strong></div>
        </div>

        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select New Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Select New Time Slot</label>
            {slotsLoading ? (
              <div className="py-6 text-center text-slate-400">Checking slot availability...</div>
            ) : availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-900 font-semibold rounded-xl text-center">
                No slots available on this date. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setNewStartTime(slot.startTime)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      newStartTime === slot.startTime
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs scale-105'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-brand-500'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !newStartTime}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all"
          >
            {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </form>
      </div>
    </div>
  );
};
