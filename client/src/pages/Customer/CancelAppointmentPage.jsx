import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { XCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const CancelAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [reason, setReason] = useState('Customer Request');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await fetchApi(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Cancelled',
          cancellationReason: reason
        })
      });
      setSuccessMessage('Appointment cancelled successfully.');
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
          <span className="font-bold text-rose-600">Screen 8: Cancel Appointment</span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Cancel Appointment (Screen 8)</h2>
          <p className="text-xs text-slate-500 font-medium">Are you sure you want to cancel this booking?</p>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}
        {successMessage && <div className="p-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {successMessage}</div>}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-900">Appointment #: {appointment?.appointmentNumber}</div>
          <div className="text-slate-600">Service: <strong>{appointment?.serviceId?.name}</strong></div>
          <div className="text-slate-600">Date & Time: <strong>{appointment?.date} at {appointment?.startTime}</strong></div>
        </div>

        <form onSubmit={handleCancel} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason for Cancellation *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white text-xs"
            >
              <option value="Customer Request">Change of plans / Schedule conflict</option>
              <option value="Booked by Mistake">Booked by mistake</option>
              <option value="Found Alternative">Found alternative time</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/customer/appointment/${id}`)}
              className="w-1/2 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
