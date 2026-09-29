import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Calendar, ArrowLeft, ChevronRight } from 'lucide-react';

export const SelectDatePage = () => {
  const navigate = useNavigate();
  const { selectedService, selectedStaff, selectedDate, setSelectedDate } = useBooking();

  useEffect(() => {
    if (!selectedService) {
      navigate('/customer/services');
    }
  }, [selectedService]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Date (Screen 4)</h2>
            <p className="text-xs text-slate-500 font-medium">Service: <strong>{selectedService?.name}</strong> • Stylist: <strong>{selectedStaff === 'any' ? 'Any Available' : selectedStaff?.name}</strong></p>
          </div>
          <button onClick={() => navigate('/customer/staff')} className="flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Change Stylist
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
            onClick={() => navigate('/customer/time')}
            className="w-full flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all"
          >
            Select Available Time Slot <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
