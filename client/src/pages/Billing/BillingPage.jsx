import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Modal } from '../../components/Modal';
import { ReceiptModal } from '../../components/ReceiptModal';
import { Receipt, Plus, Search, DollarSign, CheckCircle2, Clock, XCircle, CreditCard, Printer, Trash2 } from 'lucide-react';

export const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Receipt Modal State
  const [activeReceiptBill, setActiveReceiptBill] = useState(null);
  const [activeReceiptPayments, setActiveReceiptPayments] = useState([]);
  const [salonData, setSalonData] = useState(null);

  // New Bill Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercent, setTaxPercent] = useState(18);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Payment Modal State
  const [payModalBill, setPayModalBill] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payRef, setPayRef] = useState('');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    loadBills();
    loadDependencies();
  }, [paymentStatusFilter]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/billing${paymentStatusFilter !== 'All' ? `?paymentStatus=${paymentStatusFilter}` : ''}`);
      setBills(data.bills || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [cRes, sRes, pRes, salonRes] = await Promise.all([
        fetchApi('/customers'),
        fetchApi('/services?activeOnly=true'),
        fetchApi('/inventory'),
        fetchApi('/salon')
      ]);
      setCustomers(cRes.customers || []);
      setServices(sRes.services || []);
      setProducts(pRes.products || []);
      setSalonData(salonRes.salon);
      if (salonRes.salon?.taxEnabled) {
        setTaxEnabled(true);
        setTaxPercent(salonRes.salon.taxPercent || 18);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const addLineItem = (itemType, itemId) => {
    if (!itemId) return;
    let target;
    if (itemType === 'service') {
      target = services.find(s => s._id === itemId);
    } else {
      target = products.find(p => p._id === itemId);
    }
    if (!target) return;

    setLineItems([...lineItems, {
      itemType,
      itemId: target._id,
      name: target.name,
      quantity: 1,
      unitPrice: target.price || target.sellingPrice,
      discount: 0,
      finalAmount: target.price || target.sellingPrice
    }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const updateItemQty = (index, qty) => {
    const updated = [...lineItems];
    const q = Math.max(1, Number(qty));
    updated[index].quantity = q;
    updated[index].finalAmount = (updated[index].unitPrice * q) - updated[index].discount;
    setLineItems(updated);
  };

  // Subtotal & Calculations
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.finalAmount, 0);
    let discountAmount = 0;
    const dVal = Number(discountValue) || 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * dVal) / 100;
    } else {
      discountAmount = dVal;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    let taxAmount = 0;
    if (taxEnabled) {
      taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
    }
    const grandTotal = Math.round(afterDiscount + taxAmount);

    return { subtotal, discountAmount, taxAmount, grandTotal };
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (lineItems.length === 0) {
      setError('Please add at least one service or product item');
      return;
    }

    setFormLoading(true);
    try {
      const data = await fetchApi('/billing', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: lineItems,
          discountType,
          discountValue: Number(discountValue),
          taxEnabled,
          taxPercent: Number(taxPercent)
        })
      });
      setIsCreateModalOpen(false);
      resetBillForm();
      loadBills();
      // Open receipt modal automatically!
      openReceipt(data.bill._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetBillForm = () => {
    setSelectedCustomerId('');
    setLineItems([]);
    setDiscountType('fixed');
    setDiscountValue(0);
    setError('');
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPayError('');
    try {
      await fetchApi(`/billing/${payModalBill._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(payAmount),
          method: payMethod,
          referenceNumber: payRef
        })
      });
      setPayModalBill(null);
      loadBills();
    } catch (err) {
      setPayError(err.message);
    }
  };

  const openReceipt = async (billId) => {
    try {
      const res = await fetchApi(`/billing/${billId}`);
      setActiveReceiptBill(res.bill);
      setActiveReceiptPayments(res.payments || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const { subtotal, discountAmount, taxAmount, grandTotal } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing & Payment Management</h2>
          <p className="text-xs text-slate-500 font-medium">Invoicing, discounts, partial payments, and receipt generation</p>
        </div>

        <button
          onClick={() => { resetBillForm(); setIsCreateModalOpen(true); }}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" /> Create Bill / Invoice
        </button>
      </div>

      {/* Payment Status Filter Pills */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 text-xs">
        {['All', 'Pending', 'Partially Paid', 'Paid', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setPaymentStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              paymentStatusFilter === st ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading billing records...</div>
        ) : bills.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No bills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5">Paid</th>
                  <th className="p-3.5">Pending</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{b.invoiceNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{b.customerId?.name || 'Walk-in'}</td>
                    <td className="p-3.5 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">₹{b.grandTotal}</td>
                    <td className="p-3.5 font-semibold text-emerald-700">₹{b.paidAmount}</td>
                    <td className="p-3.5 font-semibold text-amber-700">₹{b.pendingAmount}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        b.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                        b.paymentStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.pendingAmount > 0 && !b.isCancelled && (
                          <button
                            onClick={() => {
                              setPayModalBill(b);
                              setPayAmount(b.pendingAmount);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg"
                          >
                            Collect Payment
                          </button>
                        )}
                        <button
                          onClick={() => openReceipt(b._id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate New Bill / Invoice" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{error}</div>}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Customer *</label>
            <select
              required
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
              ))}
            </select>
          </div>

          {/* Add Line Items Selector */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Add Service Item</label>
              <select
                onChange={e => { addLineItem('service', e.target.value); e.target.value = ''; }}
                className="w-full p-2 rounded-lg border border-slate-200 font-medium bg-white text-xs"
              >
                <option value="">-- Add Service --</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Add Product Item</label>
              <select
                onChange={e => { addLineItem('product', e.target.value); e.target.value = ''; }}
                className="w-full p-2 rounded-lg border border-slate-200 font-medium bg-white text-xs"
              >
                <option value="">-- Add Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.sellingPrice})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Added Line Items Table */}
          {lineItems.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItemQty(idx, e.target.value)}
                          className="w-12 text-center p-1 rounded border border-slate-200 font-bold"
                        />
                      </td>
                      <td className="p-2 text-right text-slate-600">₹{item.unitPrice}</td>
                      <td className="p-2 text-right font-bold text-slate-900">₹{item.finalAmount}</td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeLineItem(idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Discount & Tax Options */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Discount Type & Value</label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value)}
                  className="p-2 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Tax Configuration</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={e => setTaxEnabled(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span className="font-semibold text-slate-700">Enable Tax ({taxPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1.5">
            <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount:</span><span>-₹{discountAmount}</span></div>}
            {taxEnabled && <div className="flex justify-between text-slate-300"><span>Tax ({taxPercent}%):</span><span>+₹{taxAmount}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-slate-800 pt-2 text-white">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
          >
            {formLoading ? 'Generating Invoice...' : 'Generate Bill & Receipt'}
          </button>
        </form>
      </Modal>

      {/* Collect Payment Modal (Partial or Full) */}
      {payModalBill && (
        <Modal isOpen={!!payModalBill} onClose={() => setPayModalBill(null)} title="Collect Payment" maxWidth="max-w-md">
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            {payError && <div className="p-3 bg-rose-50 text-rose-700 font-semibold rounded-xl">{payError}</div>}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Invoice: {payModalBill.invoiceNumber}</span>
              <span className="text-slate-600">Total: ₹{payModalBill.grandTotal} | Already Paid: ₹{payModalBill.paidAmount}</span>
              <span className="text-amber-700 font-extrabold block text-sm mt-1">Pending Balance: ₹{payModalBill.pendingAmount}</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                max={payModalBill.pendingAmount}
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-lg text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method *</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference / Transaction ID (Optional)</label>
              <input
                type="text"
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="UPI ref / Card last 4 digits"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              Record Payment
            </button>
          </form>
        </Modal>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceiptBill}
        onClose={() => setActiveReceiptBill(null)}
        bill={activeReceiptBill}
        payments={activeReceiptPayments}
        salon={salonData}
      />
    </div>
  );
};
