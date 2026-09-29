import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { Scissors, Plus, Edit, Power, CheckCircle, Clock } from 'lucide-react';

export const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair');
  const [price, setPrice] = useState(300);
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, [categoryFilter]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/services${categoryFilter !== 'All' ? `?category=${categoryFilter}` : ''}`);
      setServices(data.services || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingService) {
        await fetchApi(`/services/${editingService._id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, category, price: Number(price), duration: Number(duration), description })
        });
      } else {
        await fetchApi('/services', {
          method: 'POST',
          body: JSON.stringify({ name, category, price: Number(price), duration: Number(duration), description })
        });
      }
      setIsModalOpen(false);
      resetForm();
      loadServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await fetchApi(`/services/${id}/toggle`, { method: 'PATCH' });
      loadServices();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (s) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setPrice(s.price);
    setDuration(s.duration);
    setDescription(s.description || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setName('');
    setCategory('Hair');
    setPrice(300);
    setDuration(30);
    setDescription('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Service Management</h2>
          <p className="text-xs text-slate-500 font-medium">Configure salon offerings, pricing, durations, and active status</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-xs">
        {['All', 'Hair', 'Facial', 'Makeup', 'Spa', 'Nails', 'Other'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              categoryFilter === cat ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">No services found in this category.</div>
        ) : (
          services.map(s => (
            <div key={s._id} className={`p-4 rounded-2xl border transition-all ${s.active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/70 border-slate-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {s.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {s.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3 min-h-[32px]">{s.description || 'No description'}</p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <div>
                  <span className="text-lg font-extrabold text-slate-900">₹{s.price}</span>
                  <span className="text-[11px] text-slate-400 font-medium ml-2">• {s.duration} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(s._id)}
                    className={`p-1.5 rounded-lg ${s.active ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                    title={s.active ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add New Service'} maxWidth="max-w-md">
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Service Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Haircut & Blow dry"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
            >
              <option value="Hair">Hair</option>
              <option value="Facial">Facial</option>
              <option value="Makeup">Makeup</option>
              <option value="Spa">Spa</option>
              <option value="Nails">Nails</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duration (Minutes) *</label>
              <input
                type="number"
                required
                min="1"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief explanation of service"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
          >
            {formLoading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
