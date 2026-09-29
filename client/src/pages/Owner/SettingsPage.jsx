import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Settings, Building, Clock, Receipt, Save, CheckCircle } from 'lucide-react';

export const SettingsPage = () => {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/salon');
      setSalon(data.salon);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const data = await fetchApi('/salon/update', {
        method: 'POST',
        body: JSON.stringify(salon)
      });
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !salon) {
    return <div className="py-16 text-center text-slate-400 text-xs">Loading business settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Business Settings & Configuration</h2>
        <p className="text-xs text-slate-500 font-medium">Salon details, operating hours, tax rules, and invoice prefixes</p>
      </div>

      {success && <div className="p-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl text-xs">{success}</div>}
      {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl text-xs">{error}</div>}

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Salon Info Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-600" /> General Salon Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Salon Name *</label>
              <input
                type="text"
                required
                value={salon.name || ''}
                onChange={e => setSalon({ ...salon, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={salon.phone || ''}
                onChange={e => setSalon({ ...salon, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={salon.email || ''}
                onChange={e => setSalon({ ...salon, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                value={salon.city || ''}
                onChange={e => setSalon({ ...salon, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              value={salon.address || ''}
              onChange={e => setSalon({ ...salon, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GSTIN Number</label>
              <input
                type="text"
                value={salon.gstNumber || ''}
                onChange={e => setSalon({ ...salon, gstNumber: e.target.value })}
                placeholder="27AAAAA0000A1Z5"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={salon.currency || 'INR'}
                onChange={e => setSalon({ ...salon, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Timezone</label>
              <input
                type="text"
                value={salon.timezone || 'Asia/Kolkata'}
                onChange={e => setSalon({ ...salon, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Billing & Tax Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" /> Billing & Invoice Settings
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={salon.invoicePrefix || 'INV-2026-'}
                onChange={e => setSalon({ ...salon, invoicePrefix: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tax Enabled By Default</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={salon.taxEnabled || false}
                  onChange={e => setSalon({ ...salon, taxEnabled: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-slate-700">Enable Tax</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                value={salon.taxPercent || 18}
                onChange={e => setSalon({ ...salon, taxPercent: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Settings...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};
