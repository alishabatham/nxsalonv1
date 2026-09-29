import React, { useState } from 'react';
import { Modal } from './Modal';
import { fetchApi } from '../api';
import { Building, Clock, Scissors, UserPlus, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export const SetupWizardModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [salonInfo, setSalonInfo] = useState({
    name: 'NX Salon Studio',
    phone: '9876543210',
    email: 'info@nxsalon.com',
    address: '102 Luxury Boulevard, Bandra West',
    city: 'Mumbai',
    gstNumber: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  const [workingHours, setWorkingHours] = useState([
    { day: 'Monday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Tuesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Wednesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Thursday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Friday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '20:00' }
  ]);

  const [initialService, setInitialService] = useState({
    name: 'Premium Haircut',
    category: 'Hair',
    price: 300,
    duration: 30,
    description: 'Style haircut with wash'
  });

  const [initialStaff, setInitialStaff] = useState({
    name: 'Rahul Stylist',
    mobile: '9876543212',
    email: 'rahul@nxsalon.com',
    role: 'Stylist'
  });

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchApi('/salon/setup-wizard', {
        method: 'POST',
        body: JSON.stringify({
          salonInfo,
          workingHours,
          initialServices: [initialService],
          initialStaff: [initialStaff]
        })
      });
      onComplete();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Salon Setup Wizard (First Time Owner Setup)" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Step Stepper */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          {[
            { num: 1, label: 'Salon Info', icon: Building },
            { num: 2, label: 'Hours', icon: Clock },
            { num: 3, label: 'Services', icon: Scissors },
            { num: 4, label: 'Staff', icon: UserPlus },
          ].map(s => {
            const Icon = s.icon;
            const active = step === s.num;
            const done = step > s.num;
            return (
              <div key={s.num} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${active ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium">{error}</div>}

        {/* Step 1: Salon Information */}
        {step === 1 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Step 1: Salon Business Information</h4>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Salon Name *</label>
              <input
                type="text"
                value={salonInfo.name}
                onChange={e => setSalonInfo({ ...salonInfo, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone *</label>
                <input
                  type="text"
                  value={salonInfo.phone}
                  onChange={e => setSalonInfo({ ...salonInfo, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  value={salonInfo.email}
                  onChange={e => setSalonInfo({ ...salonInfo, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Address *</label>
              <input
                type="text"
                value={salonInfo.address}
                onChange={e => setSalonInfo({ ...salonInfo, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  value={salonInfo.city}
                  onChange={e => setSalonInfo({ ...salonInfo, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={salonInfo.gstNumber}
                  onChange={e => setSalonInfo({ ...salonInfo, gstNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Working Hours */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Step 2: Salon Operating Working Hours</h4>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {workingHours.map((wh, idx) => (
                <div key={wh.day} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-28">
                    <input
                      type="checkbox"
                      checked={wh.isOpen}
                      onChange={e => {
                        const updated = [...workingHours];
                        updated[idx].isOpen = e.target.checked;
                        setWorkingHours(updated);
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold text-slate-800">{wh.day}</span>
                  </div>
                  {wh.isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={wh.openTime}
                        onChange={e => {
                          const updated = [...workingHours];
                          updated[idx].openTime = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={wh.closeTime}
                        onChange={e => {
                          const updated = [...workingHours];
                          updated[idx].closeTime = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  ) : (
                    <span className="text-rose-500 font-bold text-xs">CLOSED</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Initial Service */}
        {step === 3 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Step 3: Add Your First Salon Service</h4>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Service Name *</label>
              <input
                type="text"
                value={initialService.name}
                onChange={e => setInitialService({ ...initialService, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={initialService.price}
                  onChange={e => setInitialService({ ...initialService, price: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Duration (Minutes) *</label>
                <input
                  type="number"
                  value={initialService.duration}
                  onChange={e => setInitialService({ ...initialService, duration: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Initial Staff */}
        {step === 4 && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Step 4: Add Your First Staff Member</h4>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Staff Member Name *</label>
              <input
                type="text"
                value={initialStaff.name}
                onChange={e => setInitialStaff({ ...initialStaff, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mobile *</label>
                <input
                  type="text"
                  value={initialStaff.mobile}
                  onChange={e => setInitialStaff({ ...initialStaff, mobile: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Role *</label>
                <select
                  value={initialStaff.role}
                  onChange={e => setInitialStaff({ ...initialStaff, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
                >
                  <option value="Stylist">Stylist</option>
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-slate-600 font-semibold text-xs py-2 px-3 rounded-xl hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Completing Setup...' : 'Finish Setup & Launch Dashboard'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
