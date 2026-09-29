const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET Customers list / search
router.get('/', protect, authorize('owner', 'receptionist', 'staff'), async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Duplicate check by mobile (Spec Section 16)
router.get('/check-mobile/:mobile', protect, authorize('owner', 'receptionist', 'staff'), async (req, res) => {
  try {
    const { mobile } = req.params;
    const existing = await Customer.findOne({ mobile: mobile.trim() });
    if (existing) {
      const lastAppointment = await Appointment.findOne({ customerId: existing._id, status: 'Completed' })
        .sort({ date: -1 });

      return res.json({
        success: true,
        exists: true,
        customer: existing,
        lastVisit: lastAppointment ? lastAppointment.date : 'No previous visits'
      });
    }

    res.json({ success: true, exists: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Customer Detail & Profile History (Spec Section 15 & 59)
router.get('/:id', protect, authorize('owner', 'receptionist', 'staff'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Fetch appointments history
    const appointments = await Appointment.find({ customerId: customer._id })
      .populate('serviceId', 'name price duration category')
      .populate('staffId', 'name role')
      .sort({ date: -1, startTime: -1 });

    // Fetch bills & payments
    const bills = await Bill.find({ customerId: customer._id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ customerId: customer._id }).sort({ paidAt: -1 });

    // Calculate last visit
    const completedAppts = appointments.filter(a => a.status === 'Completed');
    const lastVisit = completedAppts.length > 0 ? completedAppts[0].date : null;

    res.json({
      success: true,
      customer,
      history: {
        totalVisits: completedAppts.length,
        lastVisit,
        upcomingAppointments: appointments.filter(a => ['Booked', 'Confirmed', 'Checked-in', 'In Service'].includes(a.status)),
        pastAppointments: appointments,
        bills,
        payments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Create Customer
router.post('/', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    const { name, mobile, email, gender, birthday, address, notes, allowDuplicate } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Customer name and mobile number are required' });
    }

    // Check duplicate logic unless explicit override
    if (!allowDuplicate) {
      const existing = await Customer.findOne({ mobile: mobile.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          isDuplicate: true,
          existingCustomer: existing,
          message: 'An existing customer with this mobile number already exists.'
        });
      }
    }

    const customer = await Customer.create({
      name,
      mobile: mobile.trim(),
      email: email ? email.toLowerCase().trim() : '',
      gender: gender || 'Unspecified',
      birthday: birthday || '',
      address: address || '',
      notes: notes || '',
      salonId: req.user.salonId
    });

    await recordAudit({
      user: req.user,
      action: 'CREATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer._id,
      details: { name, mobile },
      salonId: req.user.salonId
    });

    res.status(201).json({ success: true, customer, message: 'Customer created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Update Customer
router.put('/:id', protect, authorize('owner', 'receptionist'), async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const prevValue = customer.toObject();
    Object.assign(customer, req.body);
    await customer.save();

    await recordAudit({
      user: req.user,
      action: 'UPDATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer._id,
      details: { previous: prevValue, updated: customer.toObject() },
      salonId: req.user.salonId
    });

    res.json({ success: true, customer, message: 'Customer details updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
