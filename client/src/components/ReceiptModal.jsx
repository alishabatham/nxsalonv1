import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Printer, Download, Share2, CheckCircle2, Scissors } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, bill, payments = [], salon }) => {
  const receiptRef = useRef();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Receipt ${bill.invoiceNumber}`,
        text: `Receipt from ${salon?.name || 'NX Salon'} for Invoice ${bill.invoiceNumber} - Total: ₹${bill.grandTotal}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`Receipt details copied! Share link for ${bill.invoiceNumber}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt & Invoice" maxWidth="max-w-md">
      <div className="space-y-6" ref={receiptRef}>
        {/* Salon Branding Header */}
        <div className="text-center border-b border-dashed border-slate-200 pb-4">
          <div className="w-12 h-12 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl shadow-xs">
            NX
          </div>
          <h2 className="font-bold text-slate-900 text-lg">{salon?.name || 'NX Studio & Salon'}</h2>
          <p className="text-xs text-slate-500">{salon?.address || '102 Luxury Blvd'}, {salon?.city || 'Mumbai'}</p>
          <p className="text-xs text-slate-500">Phone: {salon?.phone || '9876543210'} | Email: {salon?.email || 'info@nxsalon.com'}</p>
          {salon?.gstNumber && <p className="text-[11px] text-slate-400 mt-1">GSTIN: {salon.gstNumber}</p>}
        </div>

        {/* Invoice & Customer Info */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Invoice No:</span>
            <span className="font-bold text-slate-900">{bill.invoiceNumber}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Date & Time:</span>
            <span className="text-slate-700">{new Date(bill.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-800">{bill.customerId?.name || 'Walk-in Customer'}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Mobile:</span>
            <span className="text-slate-700">{bill.customerId?.mobile || 'N/A'}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services & Items</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
                    <td className="p-2.5 text-center text-slate-600">{item.quantity}</td>
                    <td className="p-2.5 text-right text-slate-600">₹{item.unitPrice}</td>
                    <td className="p-2.5 text-right font-semibold text-slate-800">₹{item.finalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Totals */}
        <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({bill.discountType === 'percentage' ? `${bill.discountValue}%` : 'Fixed'}):</span>
              <span>-₹{bill.discountAmount}</span>
            </div>
          )}
          {bill.taxEnabled && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({bill.taxPercent}%):</span>
              <span>+₹{bill.taxAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-2">
            <span>Grand Total:</span>
            <span>₹{bill.grandTotal}</span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg mt-1">
            <span>Amount Paid:</span>
            <span>₹{bill.paidAmount}</span>
          </div>
          {bill.pendingAmount > 0 ? (
            <div className="flex justify-between font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg">
              <span>Pending Balance:</span>
              <span>₹{bill.pendingAmount}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bill Fully Paid</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs py-2.5 rounded-xl transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
