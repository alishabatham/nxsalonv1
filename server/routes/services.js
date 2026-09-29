const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// GET all services (Owner/Receptionist/Staff sees all, public/customers get active only if activeOnly query param)
router.get('/', async (req, res) => {
  try {
    const { activeOnly, category } = req.query;
    let filter = {};
    if (activeOnly === 'true') {
      filter.active = true;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const services = await Service.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Add Service (Owner only)
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    if (!name || price === undefined || duration === undefined) {
      return res.status(400).json({ success: false, message: 'Service name, price, and duration are required' });
    }
    if (price < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (duration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than zero' });
    }

    const service = await Service.create({
      name,
      category: category || 'Hair',
      price: Number(price),
      duration: Number(duration),
      description: description || '',
      active: true,
      salonId: req.user.salonId
    });

    await recordAudit({
      user: req.user,
      action: 'ADD_SERVICE',
      entity: 'Service',
      entityId: service._id,
      details: { name, price, duration },
      salonId: req.user.salonId
    });

    res.status(201).json({ success: true, service, message: 'Service added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Edit Service (Owner only)
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const { name, category, price, duration, description, active } = req.body;
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (duration !== undefined && duration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than zero' });
    }

    const prevValue = service.toObject();
    Object.assign(service, { name, category, price, duration, description, active });
    await service.save();

    await recordAudit({
      user: req.user,
      action: 'UPDATE_SERVICE',
      entity: 'Service',
      entityId: service._id,
      details: { previous: prevValue, updated: service.toObject() },
      salonId: req.user.salonId
    });

    res.json({ success: true, service, message: 'Service updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH Toggle Active status (Owner only)
router.patch('/:id/toggle', protect, authorize('owner'), async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.active = !service.active;
    await service.save();

    await recordAudit({
      user: req.user,
      action: service.active ? 'ACTIVATE_SERVICE' : 'DEACTIVATE_SERVICE',
      entity: 'Service',
      entityId: service._id,
      details: { name: service.name, active: service.active },
      salonId: req.user.salonId
    });

    res.json({ 
      success: true, 
      service, 
      message: `Service marked ${service.active ? 'Active' : 'Inactive'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
