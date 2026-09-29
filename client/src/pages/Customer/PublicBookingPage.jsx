import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Scissors, Calendar, Clock, User, Phone, CheckCircle2, RefreshCw, XCircle, Sparkles, MapPin } from 'lucide-react';

export const PublicBookingPage = () => {
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [step, setStep] = useState(1); // 1: Service, 2: Staff & Slot, 3: Customer Details, 4: Confirmation

  // Booking selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('any');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Customer info
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Self Service Portal view by token
  const [tokenInput, setTokenInput] = useState('');
  const [portalAppt, setPortalAppt] = useState(null);
  const [portalMessage, setPortalMessage] = useState('');

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadSlots();
    }
  }, [selectedService, selectedDate, selectedStaff]);

  const loadPublicData = async () => {
    try {
      const [salonRes, sRes, stRes] = await Promise.all([
        fetchApi('/salon/public'),
        fetchApi('/services?activeOnly=true'),
        fetchApi('/staff?activeOnly=true')
      ]);
      setSalon(salonRes.salon);
      setServices(sRes.services || []);
      setStaffList(stRes.staff || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const loadSlots = async () => {
    if (!selectedService) return;
    setSlotsLoading(true);
    try {
      const data = await fetchApi(`/appointments/available-slots?date=${selectedDate}&serviceId=${selectedService._id}&staffId=${selectedStaff}`);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          customerName: name,
          customerMobile: mobile,
          serviceId: selectedService._id,
          staffId: selectedStaff,
          date: selectedDate,
          startTime: selectedTime,
          notes,
          bookingSource: 'Website'
        })
      });
      setConfirmedBooking(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupToken = async () => {
    if (!tokenInput) return;
    try {
      const res = await fetchApi(`/appointments/${tokenInput.trim()}`);
      setPortalAppt(res.appointment);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelSelfService = async () => {
    if (!portalAppt) return;
    try {
      const res = await fetchApi(`/appointments/${portalAppt._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled', cancellationReason: 'Customer self-service cancellation' })
      });
      setPortalAppt(res.appointment);
      setPortalMessage('Appointment cancelled successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Public Salon Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Public Online Salon Booking
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{salon?.name || 'NX Studio & Salon'}</h1>
          <p className="text-xs text-brand-100 flex items-center gap-1.5 mt-2">
            <MapPin className="w-4 h-4" /> {salon?.address || '102 Luxury Blvd'}, {salon?.city || 'Mumbai'}
          </p>
        </div>

        {/* Token Lookup Tool */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md text-xs space-y-2 w-full md:w-72">
          <span className="font-bold block text-white">Already Booked? Look Up Token</span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Enter booking token"
              className="w-full p-2 rounded-xl text-slate-900 font-mono text-[11px] font-bold"
            />
            <button
              onClick={handleLookupToken}
              className="bg-white text-slate-900 font-bold px-3 py-2 rounded-xl"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Customer Self Service Portal Lookup Modal */}
      {portalAppt && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Your Appointment Details</h3>
            <button onClick={() => setPortalAppt(null)} className="text-slate-400 font-bold">Close</button>
          </div>

          {portalMessage && <div className="p-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl">{portalMessage}</div>}

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Appointment #</span>
              <span className="font-bold text-slate-900 text-sm">{portalAppt.appointmentNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
              <span className="font-bold text-emerald-700 text-sm">{portalAppt.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Service</span>
              <span className="font-semibold text-slate-800">{portalAppt.serviceId?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
              <span className="font-semibold text-slate-800">{portalAppt.date} at {portalAppt.startTime}</span>
            </div>
          </div>

          {['Booked', 'Confirmed'].includes(portalAppt.status) && (
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancelSelfService}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl"
              >
                Cancel Appointment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Steps */}
      {!portalAppt && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          {/* Step Stepper */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs">
            <span className={`font-bold ${step === 1 ? 'text-brand-600' : 'text-slate-400'}`}>1. Select Service</span>
            <span className={`font-bold ${step === 2 ? 'text-brand-600' : 'text-slate-400'}`}>2. Date & Slot</span>
            <span className={`font-bold ${step === 3 ? 'text-brand-600' : 'text-slate-400'}`}>3. Your Details</span>
            <span className={`font-bold ${step === 4 ? 'text-emerald-600' : 'text-slate-400'}`}>4. Confirmation</span>
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Select Service for Your Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(s => (
                  <div
                    key={s._id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedService?._id === s._id ? 'border-brand-600 bg-brand-50/40 shadow-xs' : 'border-slate-200 hover:border-brand-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                      <span className="font-extrabold text-slate-900 text-base">₹{s.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.description || 'Professional styling service'}</p>
                    <div className="text-[11px] text-brand-600 font-semibold mt-2">Duration: {s.duration} minutes</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time Slot */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Select Date & Time Slot</h3>
                <button onClick={() => setStep(1)} className="text-brand-600 font-semibold">Change Service</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Stylist</label>
                  <select
                    value={selectedStaff}
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
                  >
                    <option value="any">Any Available Stylist</option>
                    {staffList.map(st => (
                      <option key={st._id} value={st._id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Available Slots for {selectedDate}</label>
                {slotsLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading available time slots...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold">
                    No slots available on this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.startTime}
                        onClick={() => setSelectedTime(slot.startTime)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                          selectedTime === slot.startTime 
                            ? 'bg-brand-600 text-white border-brand-600 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-800 hover:border-brand-400'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl shadow-xs"
                >
                  Proceed to Customer Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Enter Customer Mobile & Details */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Enter Your Contact Information</h3>
                <button type="button" onClick={() => setStep(2)} className="text-brand-600 font-semibold">Change Slot</button>
              </div>

              {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Special Preferences (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl shadow-md"
              >
                {loading ? 'Confirming Appointment...' : 'Confirm Appointment'}
              </button>
            </form>
          )}

          {/* Step 4: Confirmation Screen */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Appointment Booked Successfully!</h2>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-sm mx-auto text-xs space-y-1.5 text-left">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Appt Number:</span>
                  <span>{confirmedBooking.appointment?.appointmentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-800">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-500">Self-Service Token:</span>
                  <span className="font-bold text-brand-600 font-mono">{confirmedBooking.rescheduleToken}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">Save your self-service token to view, reschedule, or cancel your appointment online.</p>

              <button
                onClick={() => { setStep(1); setConfirmedBooking(null); setSelectedService(null); setSelectedTime(''); }}
                className="bg-brand-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs"
              >
                Book Another Appointment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
