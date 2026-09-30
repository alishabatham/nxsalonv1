import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { ArrowLeft, User, Scissors, ChevronRight } from 'lucide-react';
import { CustomerStepper } from '../../components/CustomerStepper';

export const SelectStaffPage = () => {
  const navigate = useNavigate();
  const { selectedService, selectedStaff, setSelectedStaff } = useBooking();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedService) {
      navigate('/customer/services');
      return;
    }
    loadStaff();
  }, [selectedService]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/staff?activeOnly=true${selectedService ? `&serviceId=${selectedService._id}` : ''}`);
      setStaffList(res.staff || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (st) => {
    setSelectedStaff(st);
    navigate('/customer/date');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-2">
      <CustomerStepper />

      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Select Stylist / Staff (Screen 3)</h2>
            <p className="text-xs text-slate-500 font-medium">Selected Service: <strong className="text-slate-900">{selectedService?.name}</strong> (₹{selectedService?.price})</p>
          </div>
          <button onClick={() => navigate('/customer/services')} className="self-start sm:self-auto flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Change Service
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading available stylists...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Any Available Staff */}
            <div
              onClick={() => handleSelect('any')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all text-center ${
                selectedStaff === 'any' ? 'border-brand-600 bg-brand-50/50 shadow-xs' : 'border-slate-200 hover:border-brand-400 bg-white'
              }`}
            >
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                ★
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Any Available Staff</h3>
              <p className="text-slate-500 text-[11px] mt-1">Assigns eligible stylist automatically</p>
            </div>

            {/* Mapped Stylists */}
            {staffList.map(st => (
              <div
                key={st._id}
                onClick={() => handleSelect(st)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all text-center ${
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
        )}
      </div>
    </div>
  );
};

