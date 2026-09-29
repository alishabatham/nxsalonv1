const express = require('express');
const router = express.Router();
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET Salon Information
router.get('/', protect, async (req, res) => {
  try {
    let salon = req.user.salonId ? await Salon.findById(req.user.salonId) : await Salon.findOne();
    if (!salon) {
      salon = await Salon.create({
        name: 'NX Salon',
        phone: '9876543210',
        email: 'info@nxsalon.com',
        address: '123 Beauty Lane, Salon Heights',
        city: 'Mumbai',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      });
    }
    res.json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Salon Info for Public Customer view (Unauthenticated)
router.get('/public', async (req, res) => {
  try {
    const salon = await Salon.findOne().select('name logo phone email address city currency timezone workingHours');
    res.json({ success: true, salon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Update Salon Information (Owner Only)
router.post('/update', protect, authorize('owner'), async (req, res) => {
  try {
    let salon = await Salon.findOne();
    if (!salon) {
      salon = new Salon(req.body);
    } else {
      Object.assign(salon, req.body);
    }
    await salon.save();

    await recordAudit({
      user: req.user,
      action: 'UPDATE_SALON_INFO',
      entity: 'Salon',
      entityId: salon._id,
      details: req.body,
      salonId: salon._id
    });

    res.json({ success: true, salon, message: 'Salon details updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Complete Initial Business Setup Wizard
router.post('/setup-wizard', protect, authorize('owner'), async (req, res) => {
  try {
    const { salonInfo, workingHours, initialServices, initialStaff } = req.body;

    let salon = await Salon.findOne();
    if (!salon) {
      salon = new Salon();
    }

    if (salonInfo) {
      salon.name = salonInfo.name || salon.name;
      salon.phone = salonInfo.phone || salon.phone;
      salon.email = salonInfo.email || salon.email;
      salon.address = salonInfo.address || salon.address;
      salon.city = salonInfo.city || salon.city;
      salon.gstNumber = salonInfo.gstNumber || salon.gstNumber;
      salon.currency = salonInfo.currency || 'INR';
      salon.timezone = salonInfo.timezone || 'Asia/Kolkata';
    }

    if (workingHours && Array.isArray(workingHours)) {
      salon.workingHours = workingHours;
    }

    salon.isSetupCompleted = true;
    await salon.save();

    // Create Initial Services if provided
    if (initialServices && Array.isArray(initialServices) && initialServices.length > 0) {
      for (const s of initialServices) {
        await Service.create({
          name: s.name,
          category: s.category || 'Hair',
          price: s.price || 300,
          duration: s.duration || 30,
          description: s.description || '',
          salonId: salon._id
        });
      }
    }

    // Create Initial Staff if provided
    if (initialStaff && Array.isArray(initialStaff) && initialStaff.length > 0) {
      for (const st of initialStaff) {
        await Staff.create({
          name: st.name,
          mobile: st.mobile || '9999999999',
          email: st.email || `${st.name.toLowerCase().replace(/\s+/g, '')}@nxsalon.com`,
          role: st.role || 'Stylist',
          workingDays: st.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          salonId: salon._id
        });
      }
    }

    await recordAudit({
      user: req.user,
      action: 'COMPLETE_SETUP_WIZARD',
      entity: 'Salon',
      entityId: salon._id,
      details: { salonInfo },
      salonId: salon._id
    });

    res.json({ success: true, salon, message: 'Setup wizard completed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
