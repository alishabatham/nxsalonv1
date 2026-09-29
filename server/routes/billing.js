const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Salon = require('../models/Salon');
const Customer = require('../models/Customer');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET all bills
router.get('/', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { paymentStatus, search } = req.query;
    let filter = {};
    if (paymentStatus && paymentStatus !== 'All') {
      filter.paymentStatus = paymentStatus;
    }

    const bills = await Bill.find(filter)
      .populate('customerId', 'name mobile email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bills.length, bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single bill details & payments for receipt
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customerId')
      .populate('appointmentId');
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const payments = await Payment.find({ billId: bill._id }).sort({ paidAt: 1 });
    const salon = await Salon.findOne();

    res.json({
      success: true,
      bill,
      payments,
      salon
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Create Bill (Appointment or Walk-in)
router.post('/', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { appointmentId, customerId, items, discountType, discountValue, taxEnabled, taxPercent } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and bill items are required' });
    }

    let subtotal = 0;
    const processedItems = items.map(item => {
      const lineTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
      subtotal += lineTotal;
      return {
        itemType: item.itemType || 'service',
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        finalAmount: lineTotal
      };
    });

    // Discount Calculation (Spec Section 35)
    let discountAmount = 0;
    const dVal = Number(discountValue) || 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * dVal) / 100;
    } else {
      discountAmount = dVal;
    }

    // Spec Section 35: Discount cannot make payable total negative
    if (discountAmount > subtotal) {
      return res.status(400).json({ success: false, message: 'Discount cannot exceed subtotal amount' });
    }

    const afterDiscount = subtotal - discountAmount;

    // Tax Calculation (Spec Section 36)
    let taxAmount = 0;
    const tPercent = Number(taxPercent) || 0;
    if (taxEnabled) {
      taxAmount = (afterDiscount * tPercent) / 100;
    }

    const grandTotal = Math.round(afterDiscount + taxAmount);

    // Auto Increment Non-Duplicating Invoice Number (Spec Section 42)
    const salon = await Salon.findOne();
    const prefix = salon?.invoicePrefix || 'INV-2026-';
    const totalBills = await Bill.countDocuments();
    const invoiceNumber = `${prefix}${(totalBills + 1).toString().padStart(5, '0')}`;

    const bill = await Bill.create({
      invoiceNumber,
      appointmentId: appointmentId || null,
      customerId,
      items: processedItems,
      subtotal,
      discountType: discountType || 'fixed',
      discountValue: dVal,
      discountAmount,
      taxEnabled: !!taxEnabled,
      taxPercent: tPercent,
      taxAmount,
      grandTotal,
      paidAmount: 0,
      pendingAmount: grandTotal,
      paymentStatus: 'Pending',
      salonId: req.user.salonId
    });

    // Handle Product Stock Deduction for Product line items (Spec Section 49)
    for (const item of processedItems) {
      if (item.itemType === 'product') {
        const product = await Product.findById(item.itemId);
        if (product) {
          if (product.currentStock < item.quantity) {
            return res.status(400).json({ 
              success: false, 
              message: `Insufficient stock for ${product.name}. Available quantity: ${product.currentStock}` 
            });
          }
          const prevStock = product.currentStock;
          product.currentStock -= item.quantity;
          await product.save();

          await InventoryTransaction.create({
            productId: product._id,
            quantity: -item.quantity,
            type: 'Sale',
            previousStock: prevStock,
            newStock: product.currentStock,
            reason: `Sold in Invoice ${invoiceNumber}`,
            billId: bill._id,
            createdBy: req.user.name,
            salonId: req.user.salonId
          });
        }
      }
    }

    // Update appointment status to Completed if linked
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed', actualEndTime: new Date() });
    }

    await recordAudit({
      user: req.user,
      action: 'CREATE_BILL',
      entity: 'Bill',
      entityId: bill._id,
      details: { invoiceNumber, grandTotal },
      salonId: req.user.salonId
    });

    res.status(201).json({ success: true, bill, message: 'Bill generated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Record Payment (Spec Section 37, 38, 39 & Acceptance Test 3)
router.post('/:id/pay', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { amount, method, referenceNumber } = req.body;
    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    let bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.isCancelled) {
      return res.status(400).json({ success: false, message: 'Cannot record payment for a cancelled bill' });
    }

    // Reject overpayment per Spec Section 39!
    if (payAmount > bill.pendingAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount (₹${payAmount}) cannot exceed pending amount (₹${bill.pendingAmount})` 
      });
    }

    const payment = await Payment.create({
      billId: bill._id,
      customerId: bill.customerId,
      amount: payAmount,
      method: method || 'Cash',
      referenceNumber: referenceNumber || '',
      paidAt: new Date(),
      createdBy: req.user.name,
      salonId: req.user.salonId
    });

    // Update Bill Paid / Pending / Status
    bill.paidAmount += payAmount;
    bill.pendingAmount = Math.max(0, bill.grandTotal - bill.paidAmount);

    if (bill.pendingAmount === 0) {
      bill.paymentStatus = 'Paid';
    } else {
      bill.paymentStatus = 'Partially Paid';
    }

    await bill.save();

    await recordAudit({
      user: req.user,
      action: 'RECORD_PAYMENT',
      entity: 'Payment',
      entityId: payment._id,
      details: { invoiceNumber: bill.invoiceNumber, amount: payAmount, method },
      salonId: req.user.salonId
    });

    res.json({
      success: true,
      payment,
      bill,
      message: 'Payment recorded successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Cancel Bill (Owner Only, Spec Section 43)
router.post('/:id/cancel', protect, authorize('owner'), async (req, res) => {
  try {
    const { reason } = req.body;
    let bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.isCancelled) {
      return res.status(400).json({ success: false, message: 'Bill is already cancelled' });
    }

    bill.isCancelled = true;
    bill.paymentStatus = 'Cancelled';
    bill.cancelledReason = reason || 'Owner Cancellation';
    bill.cancelledBy = req.user.name;
    bill.cancelledAt = new Date();
    await bill.save();

    await recordAudit({
      user: req.user,
      action: 'CANCEL_BILL',
      entity: 'Bill',
      entityId: bill._id,
      details: { invoiceNumber: bill.invoiceNumber, reason },
      salonId: req.user.salonId
    });

    res.json({ success: true, bill, message: 'Bill cancelled successfully. Historical invoice retained.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
