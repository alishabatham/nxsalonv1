const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const User = require('../models/User');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET all staff members
router.get('/', async (req, res) => {
  try {
    const { activeOnly, serviceId } = req.query;
    let filter = {};
    if (activeOnly === 'true') {
      filter.active = true;
    }
    if (serviceId) {
      filter.assignedServices = serviceId;
    }

    const staffList = await Staff.find(filter)
      .populate('assignedServices', 'name price duration category active')
      .sort({ name: 1 });

    res.json({ success: true, count: staffList.length, staff: staffList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single staff details
router.get('/:id', async (req, res) => {
  try {
    const staffMember = await Staff.findById(req.params.id).populate('assignedServices');
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, staff: staffMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Add Staff (Owner only)
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const { name, mobile, email, role, assignedServices, workingDays, workingHours, offDays } = req.body;
    if (!name || !mobile || !email) {
      return res.status(400).json({ success: false, message: 'Name, mobile, and email are required' });
    }

    // Check if user account needs to be created or linked
    let userAccount = await User.findOne({ email: email.toLowerCase() });
    if (!userAccount) {
      userAccount = await User.create({
        name,
        email: email.toLowerCase(),
        mobile,
        password: 'Password@123', // Default temporary password
        role: 'staff',
        salonId: req.user.salonId
      });
    }

    const staffMember = await Staff.create({
      userId: userAccount._id,
      name,
      mobile,
      email: email.toLowerCase(),
      role: role || 'Stylist',
      assignedServices: assignedServices || [],
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: workingHours || { openTime: '10:00', closeTime: '19:00' },
      offDays: offDays || [],
      active: true,
      salonId: req.user.salonId
    });

    await recordAudit({
      user: req.user,
      action: 'ADD_STAFF',
      entity: 'Staff',
      entityId: staffMember._id,
      details: { name, role, email },
      salonId: req.user.salonId
    });

    res.status(201).json({ success: true, staff: staffMember, message: 'Staff member added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Update Staff (Owner only)
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let staffMember = await Staff.findById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const prevValue = staffMember.toObject();
    Object.assign(staffMember, req.body);
    await staffMember.save();

    await recordAudit({
      user: req.user,
      action: 'UPDATE_STAFF',
      entity: 'Staff',
      entityId: staffMember._id,
      details: { previous: prevValue, updated: staffMember.toObject() },
      salonId: req.user.salonId
    });

    res.json({ success: true, staff: staffMember, message: 'Staff member updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH Toggle Active status (Owner only)
router.patch('/:id/toggle', protect, authorize('owner'), async (req, res) => {
  try {
    let staffMember = await Staff.findById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    staffMember.active = !staffMember.active;
    await staffMember.save();

    // Also update associated user account active state
    if (staffMember.userId) {
      await User.findByIdAndUpdate(staffMember.userId, { active: staffMember.active });
    }

    await recordAudit({
      user: req.user,
      action: staffMember.active ? 'ACTIVATE_STAFF' : 'DEACTIVATE_STAFF',
      entity: 'Staff',
      entityId: staffMember._id,
      details: { name: staffMember.name, active: staffMember.active },
      salonId: req.user.salonId
    });

    res.json({ 
      success: true, 
      staff: staffMember, 
      message: `Staff marked ${staffMember.active ? 'Active' : 'Inactive'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
