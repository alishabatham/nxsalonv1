import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { UserCog, Plus, Edit, Power, CheckSquare, Scissors, Clock } from 'lucide-react';

export const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Stylist');
  const [assignedServices, setAssignedServices] = useState([]);
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, sRes] = await Promise.all([
        fetchApi('/staff'),
        fetchApi('/services')
      ]);
      setStaffList(stRes.staff || []);
      setServices(sRes.services || []);
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
      const payload = {
        name,
        mobile,
        email,
        role,
        assignedServices,
        workingDays,
        workingHours: { openTime, closeTime }
      };

      if (editingStaff) {
        await fetchApi(`/staff/${editingStaff._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/staff', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await fetchApi(`/staff/${id}/toggle`, { method: 'PATCH' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (st) => {
    setEditingStaff(st);
    setName(st.name);
    setMobile(st.mobile);
    setEmail(st.email);
    setRole(st.role);
    setAssignedServices(st.assignedServices?.map(s => s._id || s) || []);
    setWorkingDays(st.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setOpenTime(st.workingHours?.openTime || '10:00');
    setCloseTime(st.workingHours?.closeTime || '19:00');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingStaff(null);
    setName('');
    setMobile('');
    setEmail('');
    setRole('Stylist');
    setAssignedServices([]);
    setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setOpenTime('10:00');
    setCloseTime('19:00');
    setError('');
  };

  const toggleServiceAssignment = (serviceId) => {
    if (assignedServices.includes(serviceId)) {
      setAssignedServices(assignedServices.filter(id => id !== serviceId));
    } else {
      setAssignedServices([...assignedServices, serviceId]);
    }
  };

  const toggleWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Management & Service Mapping</h2>
          <p className="text-xs text-slate-500 font-medium">Manage team members, roles, service assignments, and working hours</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">Loading staff records...</div>
        ) : staffList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">No staff members found.</div>
        ) : (
          staffList.map(st => (
            <div key={st._id} className={`p-4 rounded-2xl border transition-all ${st.active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                    {st.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {st.role}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {st.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl">
                <div>Mobile: <span className="font-semibold text-slate-800">{st.mobile}</span></div>
                <div>Hours: <span className="font-semibold text-slate-800">{st.workingHours?.openTime || '10:00'} - {st.workingHours?.closeTime || '19:00'}</span></div>
              </div>

              {/* Spec Section 13: Staff-Service Mapping Display */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Services ({st.assignedServices?.length || 0})</span>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
                  {st.assignedServices?.length > 0 ? (
                    st.assignedServices.map(s => (
                      <span key={s._id || s} className="bg-brand-50 text-brand-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        ✓ {s.name || 'Service'}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No assigned services</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Joined {new Date(st.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(st)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Edit Staff"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(st._id)}
                    className={`p-1.5 rounded-lg ${st.active ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                    title={st.active ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@nxsalon.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Role *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
            >
              <option value="Stylist">Stylist</option>
              <option value="Manager">Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Spec Section 13: Staff-Service Mapping Matrix */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Assign Mapped Services (Check all applicable)</label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded-xl border border-slate-200">
              {services.map(s => (
                <label key={s._id} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedServices.includes(s._id)}
                    onChange={() => toggleServiceAssignment(s._id)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{s.name} ({s.category})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Working Start Time</label>
              <input
                type="time"
                value={openTime}
                onChange={e => setOpenTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Working End Time</label>
              <input
                type="time"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
          >
            {formLoading ? 'Saving...' : editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
