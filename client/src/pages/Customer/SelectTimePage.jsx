import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { CustomerStepper } from '../../components/CustomerStepper';

export const SelectTimePage = () => {
  const navigate = useNavigate();
  const { selectedService, selectedStaff, selectedDate, selectedTime, setSelectedTime } = useBooking();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      navigate('/customer/services');
      return;
    }
    loadSlots();
  }, [selectedService, selectedDate, selectedStaff]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const staffIdVal = selectedStaff === 'any' ? 'any' : (selectedStaff._id || selectedStaff);
      const data = await fetchApi(`/appointments/available-slots?date=${selectedDate}&serviceId=${selectedService._id}&staffId=${staffIdVal}`);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slotTime) => {
    setSelectedTime(slotTime);
    navigate('/customer/booking-confirmation');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-2">
      <CustomerStepper />

      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Select Available Time Slot (Screen 5)</h2>
            <p className="text-xs text-slate-500 font-medium">Date: <strong>{selectedDate}</strong> • Service: <strong>{selectedService?.name} ({selectedService?.duration} mins)</strong></p>
          </div>
          <button onClick={() => navigate('/customer/date')} className="self-start sm:self-auto flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Change Date
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Calculating real-time slot availability...</div>
        ) : availableSlots.length === 0 ? (
          <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl font-semibold border border-amber-200 text-center">
            ⚠ No available slots on this date. Salon is closed or all stylists are fully booked. Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {availableSlots.map(slot => (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => handleSelectSlot(slot.startTime)}
                className={`p-3 sm:p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                  selectedTime === slot.startTime 
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs scale-105' 
                    : 'bg-white border-slate-200 text-slate-800 hover:border-brand-500 hover:bg-brand-50/40'
                }`}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

