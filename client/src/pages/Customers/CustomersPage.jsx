import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { Users, Search, UserPlus, Phone, Mail, Calendar, History, Receipt, AlertCircle, ChevronRight } from 'lucide-react';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Customer Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Unspecified');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Customer Detail Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/customers${search ? `?search=${search}` : ''}`);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileBlur = async () => {
    if (mobile.length >= 10) {
      try {
        const res = await fetchApi(`/customers/check-mobile/${mobile}`);
        if (res.exists) {
          setDuplicateCheck(res);
        } else {
          setDuplicateCheck(null);
        }
      } catch (err) {
        setDuplicateCheck(null);
      }
    }
  };

  const handleCreateCustomer = async (allowDuplicate = false) => {
    setError('');
    setFormLoading(true);
    try {
      await fetchApi('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name,
          mobile,
          email,
          gender,
          birthday,
          address,
          notes,
          allowDuplicate
        })
      });
      setIsAddModalOpen(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setGender('Unspecified');
    setBirthday('');
    setAddress('');
    setNotes('');
    setDuplicateCheck(null);
    setError('');
  };

  const loadCustomerDetail = async (id) => {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    try {
      const data = await fetchApi(`/customers/${id}`);
      setCustomerDetail(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Directory & History</h2>
          <p className="text-xs text-slate-500 font-medium">Customer profiles, duplicate detection logic, and service history</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name or mobile..."
            className="w-full p-2.5 pl-9 text-xs rounded-xl border border-slate-200 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Gender</th>
                  <th className="p-3.5">Address</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{c.mobile}</td>
                    <td className="p-3.5 text-slate-500">{c.email || 'N/A'}</td>
                    <td className="p-3.5 text-slate-600">{c.gender}</td>
                    <td className="p-3.5 text-slate-500">{c.address || 'N/A'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => loadCustomerDetail(c._id)}
                        className="flex items-center gap-1 ml-auto bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] px-3 py-1.5 rounded-lg"
                      >
                        View History <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal with Duplicate Detection */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer" maxWidth="max-w-md">
        <form onSubmit={e => { e.preventDefault(); handleCreateCustomer(false); }} className="space-y-3.5 text-xs">
          {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mobile Number * (Primary duplicate signal)</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              onBlur={handleMobileBlur}
              placeholder="9876543210"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          {/* Duplicate Detected Notice (Spec Section 16) */}
          {duplicateCheck && duplicateCheck.exists && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Existing Customer Found</span>
              </div>
              <p className="text-[11px]">
                Name: <span className="font-bold">{duplicateCheck.customer.name}</span> | Last Visit: {duplicateCheck.lastVisit}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    loadCustomerDetail(duplicateCheck.customer._id);
                    setIsAddModalOpen(false);
                  }}
                  className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateCustomer(true)}
                  className="bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  Create New Anyway
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              >
                <option value="Unspecified">Unspecified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Flat / House number, Street"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Customer Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Preferred beverages or allergies"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
          >
            {formLoading ? 'Saving...' : 'Save Customer Profile'}
          </button>
        </form>
      </Modal>

      {/* Customer Detail History Drawer / Modal */}
      {selectedCustomerId && (
        <Modal isOpen={!!selectedCustomerId} onClose={() => setSelectedCustomerId(null)} title="Customer Profile & Service History" maxWidth="max-w-2xl">
          {detailLoading || !customerDetail ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading complete customer history...</div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Basic Info Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{customerDetail.customer?.name}</h3>
                  <div className="flex items-center gap-4 text-slate-500 font-medium mt-1">
                    <span>Mobile: <strong className="text-slate-800">{customerDetail.customer?.mobile}</strong></span>
                    <span>Email: {customerDetail.customer?.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Visits</span>
                  <span className="text-xl font-extrabold text-brand-600">{customerDetail.history?.totalVisits || 0}</span>
                </div>
              </div>

              {/* Past Appointments Timeline */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider text-slate-400">Past & Upcoming Appointments</h4>
                {customerDetail.history?.pastAppointments?.length === 0 ? (
                  <p className="text-slate-400 italic">No past appointments recorded.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {customerDetail.history?.pastAppointments?.map(a => (
                      <div key={a._id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{a.serviceId?.name} ({a.date} at {a.startTime})</div>
                          <div className="text-slate-500">Stylist: {a.staffId?.name} • ₹{a.serviceId?.price}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bills & Payments */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider text-slate-400">Bills & Transactions</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {customerDetail.history?.bills?.map(b => (
                    <div key={b._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{b.invoiceNumber}</div>
                        <div className="text-slate-500">Total: ₹{b.grandTotal} | Paid: ₹{b.paidAmount} | Pending: ₹{b.pendingAmount}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
