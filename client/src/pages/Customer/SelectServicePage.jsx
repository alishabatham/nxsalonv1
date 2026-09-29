import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { Scissors, ChevronRight, ArrowLeft } from 'lucide-react';

export const SelectServicePage = () => {
  const navigate = useNavigate();
  const { setSelectedService } = useBooking();
  const [services, setServices] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/services?activeOnly=true');
      setServices(res.services || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (s) => {
    setSelectedService(s);
    navigate('/customer/staff');
  };

  const filteredServices = categoryFilter === 'All'
    ? services
    : services.filter(s => s.category === categoryFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Service (Screen 2)</h2>
            <p className="text-xs text-slate-500 font-medium">Choose a service from our menu to proceed with your booking</p>
          </div>
          <button onClick={() => navigate('/customer/salon')} className="flex items-center gap-1 text-xs text-slate-500 font-semibold hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Salon
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

        {/* Services Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading salon services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(s => (
              <div
                key={s._id}
                onClick={() => handleSelectService(s)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-brand-50/30 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                  <span className="font-extrabold text-slate-900 text-base">₹{s.price}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{s.description || 'Professional styling service'}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100/80 mt-2">
                  <span className="text-[11px] font-semibold text-brand-600">Duration: {s.duration} mins</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Select Stylist <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
