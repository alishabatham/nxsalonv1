import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  CheckSquare, 
  Scissors, 
  User, 
  CalendarCheck,
  RefreshCw
} from 'lucide-react';

export const AppointmentsPage = ({ isNewApptModalOpen, setIsNewApptModalOpen }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for New Appointment
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('any');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerMobile, setNewCustomerMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSource, setBookingSource] = useState('Reception');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Reschedule Modal State
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleStaff, setRescheduleStaff] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleError, setRescheduleError] = useState('');

  useEffect(() => {
    loadAppointments();
    loadFormDependencies();
  }, [statusFilter, searchDate]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const endpoint = `/appointments?date=${searchDate}${statusFilter !== 'All' ? `&status=${statusFilter}` : ''}`;
      const data = await fetchApi(endpoint);
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFormDependencies = async () => {
    try {
      const [sRes, stRes, cRes] = await Promise.all([
        fetchApi('/services?activeOnly=true'),
        fetchApi('/staff?activeOnly=true'),
        fetchApi('/customers')
      ]);
      setServices(sRes.services || []);
      setStaffList(stRes.staff || []);
      setCustomers(cRes.customers || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const data = await fetchApi(`/appointments/available-slots?date=${selectedDate}&serviceId=${selectedService}&staffId=${selectedStaff}`);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomer || undefined,
          customerName: newCustomerName || undefined,
          customerMobile: newCustomerMobile || undefined,
          serviceId: selectedService,
          staffId: selectedStaff,
          date: selectedDate,
          startTime: selectedTime,
          notes,
          bookingSource
        })
      });
      setIsNewApptModalOpen(false);
      resetForm();
      loadAppointments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedService('');
    setSelectedStaff('any');
    setSelectedTime('');
    setSelectedCustomer('');
    setNewCustomerName('');
    setNewCustomerMobile('');
    setNotes('');
    setFormError('');
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    try {
      await fetchApi(`/appointments/${rescheduleAppt._id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate: rescheduleDate,
          newStartTime: rescheduleTime,
          newStaffId: rescheduleStaff || undefined
        })
      });
      setRescheduleAppt(null);
      loadAppointments();
    } catch (err) {
      setRescheduleError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointment Management</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time schedule, check-in workflow, and status tracking</p>
        </div>

        <button
          onClick={() => setIsNewApptModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </button>
      </div>

      {/* Date & Status Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Date:</span>
            <input
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-200 font-bold bg-slate-50 text-slate-900"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {['All', 'Booked', 'Confirmed', 'Checked-in', 'In Service', 'Completed', 'Cancelled', 'No-show'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === st ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading appointments schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No Appointments Found</p>
            <p className="text-xs text-slate-400 mt-1">No appointments match the selected date and status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Time & Appt #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Service & Duration</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{appt.startTime} - {appt.endTime}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{appt.appointmentNumber}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{appt.customerId?.name || 'Walk-in Customer'}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{appt.customerId?.mobile}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{appt.serviceId?.name}</div>
                      <div className="text-[11px] text-slate-500">₹{appt.serviceId?.price} • {appt.duration} mins</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {appt.staffId?.name || 'Unassigned'}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                        {appt.bookingSource}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        appt.status === 'No-show' ? 'bg-slate-100 text-slate-700' :
                        appt.status === 'Checked-in' ? 'bg-blue-100 text-blue-800' :
                        appt.status === 'In Service' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status === 'Booked' || appt.status === 'Confirmed' ? (
                          <button
                            onClick={() => handleStatusChange(appt._id, 'Checked-in')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            Check-in
                          </button>
                        ) : null}

                        {appt.status === 'Checked-in' ? (
                          <button
                            onClick={() => handleStatusChange(appt._id, 'In Service')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            Start Service
                          </button>
                        ) : null}

                        {appt.status === 'In Service' ? (
                          <button
                            onClick={() => handleStatusChange(appt._id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            Complete
                          </button>
                        ) : null}

                        {['Booked', 'Confirmed'].includes(appt.status) && (
                          <>
                            <button
                              onClick={() => setRescheduleAppt(appt)}
                              className="text-slate-600 hover:text-slate-900 bg-slate-100 p-1.5 rounded-lg"
                              title="Reschedule"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'Cancelled')}
                              className="text-rose-600 hover:text-rose-800 bg-rose-50 p-1.5 rounded-lg"
                              title="Cancel"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'No-show')}
                              className="text-amber-700 hover:text-amber-900 bg-amber-50 p-1.5 rounded-lg text-[10px] font-bold"
                            >
                              No-show
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      <Modal isOpen={isNewApptModalOpen} onClose={() => setIsNewApptModalOpen(false)} title="Create New Appointment" maxWidth="max-w-xl">
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          {formError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{formError}</div>}

          {/* Customer Selector / New Customer */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Customer or Enter New</label>
            <select
              value={selectedCustomer}
              onChange={e => {
                setSelectedCustomer(e.target.value);
                if (e.target.value) {
                  setNewCustomerName('');
                  setNewCustomerMobile('');
                }
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
            >
              <option value="">-- Select Existing Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
              ))}
            </select>
          </div>

          {!selectedCustomer && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={newCustomerMobile}
                  onChange={e => setNewCustomerMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>
            </div>
          )}

          {/* Service & Staff Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Service *</label>
              <select
                required
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              >
                <option value="">-- Select Service --</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} (₹{s.price} • {s.duration}m)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Staff</label>
              <select
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              >
                <option value="any">Any Available Staff</option>
                {staffList.map(st => (
                  <option key={st._id} value={st._id}>{st.name} ({st.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Slot Picker */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Appointment Date *</label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
            />
          </div>

          {/* Available Slots Grid */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Available Time Slots</label>
            {slotsLoading ? (
              <div className="p-4 text-center text-slate-400">Checking slot availability...</div>
            ) : availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                No slots available for the selected date/service. Please select another date or staff.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                {availableSlots.map(slot => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setSelectedTime(slot.startTime)}
                    className={`p-2 rounded-xl border font-bold text-center transition-all ${
                      selectedTime === slot.startTime 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-800 hover:border-brand-300'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Preferences</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Mild shampoo preference"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading || !selectedTime}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all mt-2"
          >
            {formLoading ? 'Booking Appointment...' : 'Confirm Appointment'}
          </button>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <Modal isOpen={!!rescheduleAppt} onClose={() => setRescheduleAppt(null)} title="Reschedule Appointment" maxWidth="max-w-md">
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
            {rescheduleError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{rescheduleError}</div>}
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{rescheduleAppt.appointmentNumber}</span>
              <span className="text-slate-600">{rescheduleAppt.customerId?.name} • {rescheduleAppt.serviceId?.name}</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Date *</label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">New Start Time (HH:MM) *</label>
              <input
                type="text"
                required
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                placeholder="14:00"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              Confirm Reschedule
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
