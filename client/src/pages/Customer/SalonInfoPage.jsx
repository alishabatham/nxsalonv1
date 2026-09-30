import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { Building, Clock, MapPin, Phone, Mail, Sparkles, ChevronRight } from 'lucide-react';
import { CustomerStepper } from '../../components/CustomerStepper';

export const SalonInfoPage = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);

  useEffect(() => {
    loadSalon();
  }, []);

  const loadSalon = async () => {
    try {
      const data = await fetchApi('/salon/public');
      setSalon(data.salon);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-2">
      <CustomerStepper />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Screen 1: Salon Overview
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{salon?.name || 'NX Studio & Salon'}</h1>
        <p className="text-xs text-brand-100 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" /> {salon?.address || '102 Luxury Blvd'}, {salon?.city || 'Mumbai'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Welcome to {salon?.name || 'NX Studio & Salon'}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Premium hair styling, spa, facials, and beauty care</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" /> Salon Information
            </div>
            <div className="break-words">Address: <strong className="text-slate-900">{salon?.address}, {salon?.city}</strong></div>
            <div>Phone: <strong className="text-slate-900">{salon?.phone}</strong></div>
            <div className="break-all">Email: <strong className="text-slate-900">{salon?.email}</strong></div>
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
            onClick={() => navigate('/customer/services')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all active:scale-95"
          >
            Browse Services & Book Now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

