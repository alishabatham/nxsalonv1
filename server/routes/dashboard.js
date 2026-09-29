const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Product = require('../models/Product');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

// GET Dashboard Metrics based on Role (Spec Section 66, 67, 68)
router.get('/', protect, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userRole = req.user.role;

    if (userRole === 'owner') {
      // Owner Dashboard Aggregations from DB
      const todayAppointments = await Appointment.find({ date: todayStr })
        .populate('customerId', 'name mobile')
        .populate('serviceId', 'name price duration')
        .populate('staffId', 'name');

      const completedToday = todayAppointments.filter(a => a.status === 'Completed').length;
      const cancelledToday = todayAppointments.filter(a => a.status === 'Cancelled').length;
      const noShowToday = todayAppointments.filter(a => a.status === 'No-show').length;

      // Today Payments Total
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      const todayPayments = await Payment.find({ paidAt: { $gte: todayStart } });
      const todaySales = todayPayments.reduce((acc, p) => acc + p.amount, 0);

      // Pending Payments Total
      const pendingBills = await Bill.find({ paymentStatus: { $in: ['Pending', 'Partially Paid'] }, isCancelled: false });
      const pendingAmount = pendingBills.reduce((acc, b) => acc + b.pendingAmount, 0);

      // Total Sales & Total Customers
      const allPayments = await Payment.find();
      const totalSales = allPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalCustomersCount = await Customer.countDocuments();

      // Low Stock Products
      const allProducts = await Product.find({ active: true });
      const lowStockProducts = allProducts.filter(p => p.currentStock <= p.minStock);

      // Staff Sales Summary
      const staffList = await Staff.find({ active: true });
      const staffSummary = await Promise.all(staffList.map(async st => {
        const appts = await Appointment.find({ staffId: st._id, status: 'Completed' });
        return {
          id: st._id,
          name: st.name,
          role: st.role,
          completedCount: appts.length
        };
      }));

      return res.json({
        success: true,
        role: 'owner',
        metrics: {
          todaySales,
          todayAppointmentsCount: todayAppointments.length,
          completedToday,
          cancelledToday,
          noShowToday,
          todayCustomersCount: new Set(todayAppointments.map(a => a.customerId?._id?.toString())).size,
          pendingAmount,
          totalSales,
          totalCustomersCount,
          lowStockCount: lowStockProducts.length
        },
        todayAppointments,
        lowStockProducts,
        staffSummary
      });

    } else if (userRole === 'receptionist') {
      // Receptionist Dashboard (Today's front-desk operations)
      const todayAppointments = await Appointment.find({ date: todayStr })
        .populate('customerId', 'name mobile')
        .populate('serviceId', 'name price duration')
        .populate('staffId', 'name')
        .sort({ startTime: 1 });

      const checkedInCustomers = todayAppointments.filter(a => a.status === 'Checked-in' || a.status === 'In Service');
      const pendingBills = await Bill.find({ paymentStatus: { $in: ['Pending', 'Partially Paid'] }, isCancelled: false })
        .populate('customerId', 'name mobile');

      return res.json({
        success: true,
        role: 'receptionist',
        metrics: {
          todayAppointmentsCount: todayAppointments.length,
          checkedInCount: checkedInCustomers.length,
          pendingBillsCount: pendingBills.length
        },
        todayAppointments,
        checkedInCustomers,
        pendingBills
      });

    } else if (userRole === 'staff') {
      // Staff Dashboard (My Schedule & My Appointments)
      const staffProfile = await Staff.findOne({ userId: req.user._id });
      const staffId = staffProfile ? staffProfile._id : null;

      const myTodayAppointments = await Appointment.find({ staffId, date: todayStr })
        .populate('customerId', 'name mobile notes')
        .populate('serviceId', 'name price duration description')
        .sort({ startTime: 1 });

      const completedCount = myTodayAppointments.filter(a => a.status === 'Completed').length;
      const currentAppt = myTodayAppointments.find(a => a.status === 'In Service' || a.status === 'Checked-in');
      const upcomingAppt = myTodayAppointments.find(a => a.status === 'Booked' || a.status === 'Confirmed');

      return res.json({
        success: true,
        role: 'staff',
        metrics: {
          todayTotal: myTodayAppointments.length,
          completedCount
        },
        currentAppt,
        upcomingAppt,
        todayAppointments: myTodayAppointments
      });
    } else {
      res.json({ success: true, role: 'customer', message: 'Customer dashboard active' });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
