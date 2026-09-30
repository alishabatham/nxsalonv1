import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { ArrowLeft, CheckCircle2, Scissors, Calendar, Clock, User, Phone } from 'lucide-react';
import { CustomerStepper } from '../../components/CustomerStepper';

export const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const { 
    selectedService, 
    selectedStaff, 
    selectedDate, 
    selectedTime, 
    customerName, setCustomerName, 
    customerMobile, setCustomerMobile, 
    customerNotes, setCustomerNotes 
  } = useBooking();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedService || !selectedDate || !selectedTime) {
      navigate('/customer/services');
    }
  }, [selectedService, selectedDate, selectedTime]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerName || !customerMobile) {
      setError('Customer name and mobile number are required');
      return;
    }

    setLoading(true);
    try {
      const staffIdVal = selectedStaff === 'any' ? 'any' : (selectedStaff._id || selectedStaff);
      const data = await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerMobile,
          serviceId: selectedService._id,
          staffId: staffIdVal,
          date: selectedDate,
          startTime: selectedTime,
          notes: customerNotes,
          bookingSource: 'Website'
        })
      });

      // Navigate to Screen 7: Appointment Details Page with appointment ID & token!
      navigate(`/customer/appointment/${data.appointment._id}`, {
        state: { token: data.rescheduleToken }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-2">
      <CustomerStepper />

      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Booking Confirmation (Screen 6)</h2>
            <p className="text-xs text-slate-500 font-medium">Review appointment details & enter contact information</p>
          </div>
          <button type="button" onClick={() => navigate('/customer/time')} className="self-start sm:self-auto flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Change Time Slot
          </button>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

        {/* Summary Review Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Service</span>
            <span className="font-bold text-slate-900">{selectedService?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Stylist</span>
            <span className="font-bold text-slate-900">{selectedStaff === 'any' ? 'Any Available' : selectedStaff?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Date & Time</span>
            <span className="font-bold text-slate-900">{selectedDate} at {selectedTime}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Amount</span>
            <span className="font-extrabold text-brand-600 text-sm">₹{selectedService?.price}</span>
          </div>
        </div>

        <form onSubmit={handleConfirmBooking} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full p-3 rounded-xl border border-slate-200 font-medium text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              value={customerMobile}
              onChange={e => setCustomerMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Special Instructions / Preferences (Optional)</label>
            <input
              type="text"
              value={customerNotes}
              onChange={e => setCustomerNotes(e.target.value)}
              placeholder="e.g. Mild tea preference"
              className="w-full p-3 rounded-xl border border-slate-200 font-medium text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            {loading ? 'Confirming Appointment...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

