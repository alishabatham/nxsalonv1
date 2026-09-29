const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Service = require('../models/Service');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect, authorize } = require('../middleware/auth');

// GET Aggregated Reports (Spec Section 60 - 65)
router.get('/', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // 1. Sales Report
    const bills = await Bill.find({ ...dateFilter, isCancelled: false });
    const grossSales = bills.reduce((acc, b) => acc + b.subtotal, 0);
    const totalDiscounts = bills.reduce((acc, b) => acc + b.discountAmount, 0);
    const totalTax = bills.reduce((acc, b) => acc + b.taxAmount, 0);
    const grandTotalSales = bills.reduce((acc, b) => acc + b.grandTotal, 0);
    const totalPaid = bills.reduce((acc, b) => acc + b.paidAmount, 0);
    const totalPending = bills.reduce((acc, b) => acc + b.pendingAmount, 0);

    const payments = await Payment.find();
    const paymentMethodBreakdown = { Cash: 0, UPI: 0, Card: 0, Other: 0 };
    payments.forEach(p => {
      if (paymentMethodBreakdown[p.method] !== undefined) {
        paymentMethodBreakdown[p.method] += p.amount;
      }
    });

    // 2. Appointment Report
    const appointments = await Appointment.find();
    const appointmentSummary = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length,
      noShow: appointments.filter(a => a.status === 'No-show').length,
      confirmed: appointments.filter(a => a.status === 'Confirmed').length,
      booked: appointments.filter(a => a.status === 'Booked').length
    };

    // 3. Customer Report
    const totalCustomers = await Customer.countDocuments();

    // 4. Staff Report
    const staffMembers = await Staff.find();
    const staffReport = await Promise.all(staffMembers.map(async st => {
      const staffAppts = await Appointment.find({ staffId: st._id, status: 'Completed' }).populate('serviceId');
      const salesGenerated = staffAppts.reduce((acc, a) => acc + (a.serviceId ? a.serviceId.price : 0), 0);
      return {
        id: st._id,
        name: st.name,
        role: st.role,
        appointmentsHandled: staffAppts.length,
        salesGenerated
      };
    }));

    // 5. Service Report
    const services = await Service.find();
    const serviceReport = await Promise.all(services.map(async s => {
      const sAppts = await Appointment.find({ serviceId: s._id, status: 'Completed' });
      return {
        id: s._id,
        name: s.name,
        category: s.category,
        count: sAppts.length,
        revenue: sAppts.length * s.price
      };
    }));

    // 6. Inventory Report
    const products = await Product.find();
    const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
    const inventoryTransactionsCount = await InventoryTransaction.countDocuments();

    res.json({
      success: true,
      salesReport: {
        grossSales,
        totalDiscounts,
        totalTax,
        grandTotalSales,
        totalPaid,
        totalPending,
        paymentMethodBreakdown
      },
      appointmentReport: appointmentSummary,
      customerReport: {
        totalCustomers
      },
      staffReport,
      serviceReport,
      inventoryReport: {
        totalProducts: products.length,
        lowStockCount,
        inventoryTransactionsCount
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
