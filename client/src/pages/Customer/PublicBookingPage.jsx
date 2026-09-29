import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  Sparkles, 
  MapPin, 
  Building, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Info,
  ShieldCheck
} from 'lucide-react';

export const PublicBookingPage = () => {
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Customer Flow Step Control (1 to 9)
  // 1: Salon, 2: Services, 3: Staff, 4: Date, 5: Time, 6: Booking Confirmation, 7: Appointment Details, 8: Cancel, 9: Reschedule
  const [activeStep, setActiveStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Customer Selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('any');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Customer Contact Info
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active Confirmed Appointment (Screen 7: Appointment Details)
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [bookingToken, setBookingToken] = useState('');

  // Lookup Token for existing customer self-service
  const [lookupInput, setLookupInput] = useState('');
  const [lookupError, setLookupError] = useState('');

  // Self Service Reschedule Modal State (Screen 9)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Self Service Cancel Modal State (Screen 8)
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer Request');
  const [cancelError, setCancelError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

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
      const staffIdVal = selectedStaff === 'any' ? 'any' : (selectedStaff._id || selectedStaff);
      const data = await fetchApi(`/appointments/available-slots?date=${selectedDate}&serviceId=${selectedService._id}&staffId=${staffIdVal}`);
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
    if (!name || !mobile) {
      setError('Customer name and mobile number are required');
      return;
    }

    setLoading(true);
    try {
      const staffIdVal = selectedStaff === 'any' ? 'any' : (selectedStaff._id || selectedStaff);
      const data = await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          customerName: name,
          customerMobile: mobile,
          serviceId: selectedService._id,
          staffId: staffIdVal,
          date: selectedDate,
          startTime: selectedTime,
          notes,
          bookingSource: 'Website'
        })
      });

      setCurrentAppointment(data.appointment);
      setBookingToken(data.rescheduleToken);
      // Move directly to Screen 7: Appointment Details
      setActiveStep(7);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupByToken = async () => {
    if (!lookupInput) return;
    setLookupError('');
    try {
      const res = await fetchApi(`/appointments/${lookupInput.trim()}`);
      setCurrentAppointment(res.appointment);
      setBookingToken(res.appointment.rescheduleToken || lookupInput.trim());
      setActiveStep(7);
    } catch (err) {
      setLookupError(err.message);
    }
  };

  const handleSelfServiceCancel = async (e) => {
    e.preventDefault();
    setCancelError('');
    setCancelLoading(true);
    try {
      const res = await fetchApi(`/appointments/${currentAppointment._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Cancelled',
          cancellationReason: cancelReason
        })
      });
      setCurrentAppointment(res.appointment);
      setIsCancelOpen(false);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSelfServiceReschedule = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    setRescheduleLoading(true);
    try {
      const res = await fetchApi(`/appointments/${currentAppointment._id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate: rescheduleDate,
          newStartTime: rescheduleTime
        })
      });
      setCurrentAppointment(res.appointment);
      setIsRescheduleOpen(false);
    } catch (err) {
      setRescheduleError(err.message);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const filteredServices = categoryFilter === 'All' 
    ? services 
    : services.filter(s => s.category === categoryFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Banner Navigation & Quick Token Portal */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Public Customer Booking Self-Service
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{salon?.name || 'NX Studio & Salon'}</h1>
          <p className="text-xs text-brand-100 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5" /> {salon?.address || '102 Luxury Blvd'}, {salon?.city || 'Mumbai'} • Phone: {salon?.phone || '9876543210'}
          </p>
        </div>

        {/* Self-Service Token Finder */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md text-xs space-y-2 w-full md:w-80">
          <span className="font-bold block text-white">Find Existing Appointment</span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={lookupInput}
              onChange={e => setLookupInput(e.target.value)}
              placeholder="Enter appointment token"
              className="w-full p-2 rounded-xl text-slate-900 font-mono text-[11px] font-bold"
            />
            <button
              onClick={handleLookupByToken}
              className="bg-white text-slate-900 font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Lookup
            </button>
          </div>
          {lookupError && <p className="text-rose-200 text-[10px] font-medium">{lookupError}</p>}
        </div>
      </div>

      {/* 9-Step Progress Indicator Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto custom-scrollbar text-xs gap-2">
        {[
          { num: 1, label: '1. Salon' },
          { num: 2, label: '2. Services' },
          { num: 3, label: '3. Staff' },
          { num: 4, label: '4. Date' },
          { num: 5, label: '5. Time' },
          { num: 6, label: '6. Confirmation' },
          { num: 7, label: '7. Details' },
        ].map(s => (
          <button
            key={s.num}
            onClick={() => {
              if (s.num <= 6 || currentAppointment) setActiveStep(s.num);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeStep === s.num
                ? 'bg-brand-600 text-white shadow-2xs'
                : activeStep > s.num
                ? 'bg-slate-100 text-slate-700'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Screen Switcher (1 to 9) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs min-h-[420px]">
        {/* Screen 1: Salon Overview */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Welcome to {salon?.name || 'NX Studio & Salon'}</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Premium hair styling, spa, facials, and beauty care</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-600" /> Salon Information
                </div>
                <div>Address: <strong className="text-slate-900">{salon?.address}, {salon?.city}</strong></div>
                <div>Phone: <strong className="text-slate-900">{salon?.phone}</strong></div>
                <div>Email: <strong className="text-slate-900">{salon?.email}</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Salon Operating Hours
                </div>
                <div className="space-y-1">
                  {salon?.workingHours?.map(wh => (
                    <div key={wh.day} className="flex justify-between">
                      <span className="text-slate-600 font-medium">{wh.day}:</span>
                      {wh.isOpen ? (
                        <span className="font-bold text-slate-900">{wh.openTime} - {wh.closeTime}</span>
                      ) : (
                        <span className="font-bold text-rose-500">CLOSED</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-all"
              >
                Browse Services & Book Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Services Selection */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Service (Screen 2)</h2>
                <p className="text-xs text-slate-500 font-medium">Choose a service from our menu to begin booking</p>
              </div>
              <button onClick={() => setActiveStep(1)} className="text-xs text-slate-500 hover:text-slate-900 font-semibold">
                Back to Salon Info
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
              {['All', 'Hair', 'Facial', 'Makeup', 'Spa', 'Nails', 'Other'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    categoryFilter === cat ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map(s => (
                <div
                  key={s._id}
                  onClick={() => { setSelectedService(s); setActiveStep(3); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedService?._id === s._id ? 'border-brand-600 bg-brand-50/50 shadow-xs' : 'border-slate-200 hover:border-brand-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                    <span className="font-extrabold text-slate-900 text-base">₹{s.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{s.description || 'Professional salon service'}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100/80 mt-2">
                    <span className="text-[11px] font-semibold text-brand-600">Duration: {s.duration} mins</span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      Select <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screen 3: Staff Selection */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Stylist / Staff (Screen 3)</h2>
                <p className="text-xs text-slate-500 font-medium">Service: <strong className="text-slate-900">{selectedService?.name}</strong> (₹{selectedService?.price})</p>
              </div>
              <button onClick={() => setActiveStep(2)} className="text-xs text-brand-600 font-semibold">
                Change Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Option 1: Any Available Staff */}
              <div
                onClick={() => { setSelectedStaff('any'); setActiveStep(4); }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all text-center ${
                  selectedStaff === 'any' ? 'border-brand-600 bg-brand-50/50 shadow-xs' : 'border-slate-200 hover:border-brand-400 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                  ★
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Any Available Staff</h3>
                <p className="text-slate-500 text-[11px] mt-1">Assigns the best available stylist automatically</p>
              </div>

              {/* Mapped Staff Options */}
              {staffList.map(st => (
                <div
                  key={st._id}
                  onClick={() => { setSelectedStaff(st); setActiveStep(4); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all text-center ${
                    selectedStaff?._id === st._id ? 'border-brand-600 bg-brand-50/50 shadow-xs' : 'border-slate-200 hover:border-brand-400 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                    {st.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-1">{st.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screen 4: Date Picker */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Date (Screen 4)</h2>
                <p className="text-xs text-slate-500 font-medium">Service: <strong>{selectedService?.name}</strong> • Stylist: <strong>{selectedStaff === 'any' ? 'Any Available' : selectedStaff?.name}</strong></p>
              </div>
              <button onClick={() => setActiveStep(3)} className="text-xs text-brand-600 font-semibold">
                Change Stylist
              </button>
            </div>

            <div className="max-w-md space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Choose Appointment Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 font-bold text-sm text-slate-900 bg-white"
                />
              </div>

              <button
                onClick={() => setActiveStep(5)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
              >
                Proceed to Select Time Slot (Screen 5)
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: Time Slot Picker */}
        {activeStep === 5 && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Available Time Slot (Screen 5)</h2>
                <p className="text-xs text-slate-500 font-medium">Date: <strong>{selectedDate}</strong> • Duration: <strong>{selectedService?.duration} mins</strong></p>
              </div>
              <button onClick={() => setActiveStep(4)} className="text-xs text-brand-600 font-semibold">
                Change Date
              </button>
            </div>

            {slotsLoading ? (
              <div className="py-12 text-center text-slate-400 font-medium">Calculating real-time slot availability...</div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl font-semibold border border-amber-200 text-center">
                ⚠ No available slots on this date. Salon is closed or all stylists are fully booked. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {availableSlots.map(slot => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => { setSelectedTime(slot.startTime); setActiveStep(6); }}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                      selectedTime === slot.startTime 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs scale-105' 
                        : 'bg-white border-slate-200 text-slate-800 hover:border-brand-400'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Screen 6: Booking Confirmation (Contact Details & Review) */}
        {activeStep === 6 && (
          <form onSubmit={handleConfirmBooking} className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Booking Confirmation (Screen 6)</h2>
                <p className="text-xs text-slate-500 font-medium">Review appointment details & enter contact information</p>
              </div>
              <button type="button" onClick={() => setActiveStep(5)} className="text-xs text-brand-600 font-semibold">
                Change Time Slot
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

            {/* Summary Review Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Special Instructions / Preferences</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Mild tea preference"
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all"
            >
              {loading ? 'Confirming Appointment...' : 'Confirm Appointment'}
            </button>
          </form>
        )}

        {/* Screen 7: Appointment Details (Self-Service View) */}
        {activeStep === 7 && currentAppointment && (
          <div className="space-y-6 text-xs">
            <div className="text-center py-4 border-b border-slate-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Appointment Details (Screen 7)</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Your appointment has been booked & confirmed</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span>Appointment Number:</span>
                <span className="text-brand-600">{currentAppointment.appointmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-900">{currentAppointment.customerId?.name || name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{currentAppointment.serviceId?.name || selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900">{currentAppointment.date} at {currentAppointment.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                  {currentAppointment.status}
                </span>
              </div>
              {bookingToken && (
                <div className="flex justify-between border-t border-slate-200 pt-2 font-mono">
                  <span className="text-slate-500">Self-Service Token:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{bookingToken}</span>
                </div>
              )}
            </div>

            {/* Self-Service Actions (Screen 8 & Screen 9 Triggers) */}
            {['Booked', 'Confirmed'].includes(currentAppointment.status) && (
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setRescheduleDate(currentAppointment.date); setIsRescheduleOpen(true); }}
                  className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reschedule (Screen 9)
                </button>
                <button
                  onClick={() => setIsCancelOpen(true)}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Cancel Appointment (Screen 8)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen 8: Self-Service Cancel Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-md space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Cancel Appointment (Screen 8)</h3>
              <button onClick={() => setIsCancelOpen(false)} className="text-slate-400 font-bold">X</button>
            </div>

            {cancelError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{cancelError}</div>}

            <p className="text-slate-600">Are you sure you want to cancel appointment <strong>{currentAppointment?.appointmentNumber}</strong>?</p>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              >
                <option value="Customer Request">Change of plans</option>
                <option value="Staff Unavailable">Schedule conflict</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleSelfServiceCancel}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 9: Self-Service Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-md space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Reschedule Appointment (Screen 9)</h3>
              <button onClick={() => setIsRescheduleOpen(false)} className="text-slate-400 font-bold">X</button>
            </div>

            {rescheduleError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{rescheduleError}</div>}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select New Date *</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">New Start Time (HH:MM 24hr format) *</label>
              <input
                type="text"
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                placeholder="15:00"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSelfServiceReschedule}
                disabled={rescheduleLoading || !rescheduleTime}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
              >
                {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
