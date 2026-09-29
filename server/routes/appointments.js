const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { protect, authorize, recordAudit } = require('../middleware/auth');

// Helper to convert "HH:MM" time string to minutes from midnight
const timeToMinutes = (tStr) => {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper to convert minutes from midnight to "HH:MM"
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to check if two time ranges overlap: [start1, end1] and [start2, end2]
const isOverlapping = (start1, end1, start2, end2) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

// GET Available Time Slots Algorithm (Spec Section 19, 20, 21, 22)
router.get('/available-slots', async (req, res) => {
  try {
    const { date, serviceId, staffId } = req.query; // date: YYYY-MM-DD
    if (!date || !serviceId) {
      return res.status(400).json({ success: false, message: 'Date and Service ID are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.active) {
      return res.status(400).json({ success: false, message: 'Service is inactive or does not exist' });
    }

    const salon = await Salon.findOne();
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon configuration not found' });
    }

    // Determine Day of Week
    const dateObj = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];

    // 1 & 2. Salon Working Hours & Closed Day Check
    const salonDayConfig = salon.workingHours.find(w => w.day === dayOfWeek);
    if (!salonDayConfig || !salonDayConfig.isOpen) {
      return res.json({ 
        success: true, 
        available: false, 
        message: `Salon is closed on ${dayOfWeek}s. No slots available.`,
        slots: [] 
      });
    }

    const salonOpenMins = timeToMinutes(salonDayConfig.openTime || '10:00');
    const salonCloseMins = timeToMinutes(salonDayConfig.closeTime || '20:00');

    // Find Eligible Staff
    let eligibleStaff = [];
    if (staffId && staffId !== 'any') {
      const selectedStaff = await Staff.findById(staffId).populate('assignedServices');
      if (selectedStaff && selectedStaff.active) {
        eligibleStaff = [selectedStaff];
      }
    } else {
      // Any Available Staff: filter active staff assigned to this service
      eligibleStaff = await Staff.find({
        active: true,
        assignedServices: serviceId
      });
    }

    if (eligibleStaff.length === 0) {
      return res.json({ 
        success: true, 
        available: false, 
        message: 'No active staff members assigned to this service.',
        slots: [] 
      });
    }

    // Filter staff who work on this day and are not on Off Day
    eligibleStaff = eligibleStaff.filter(st => {
      const worksOnDay = !st.workingDays || st.workingDays.includes(dayOfWeek);
      const isOff = st.offDays && st.offDays.includes(date);
      return worksOnDay && !isOff;
    });

    if (eligibleStaff.length === 0) {
      return res.json({ 
        success: true, 
        available: false, 
        message: 'All staff assigned to this service are off on this day.',
        slots: [] 
      });
    }

    // Generate potential 30-minute intervals throughout salon operating hours
    const intervalMins = 30;
    const serviceDuration = service.duration;
    const slots = [];

    for (let slotStart = salonOpenMins; slotStart + serviceDuration <= salonCloseMins; slotStart += intervalMins) {
      const slotEnd = slotStart + serviceDuration;
      const startTimeStr = minutesToTime(slotStart);
      const endTimeStr = minutesToTime(slotEnd);

      // Check which staff members are available for this specific slot
      const availableStaffForSlot = [];

      for (const st of eligibleStaff) {
        const staffOpen = timeToMinutes(st.workingHours?.openTime || salonDayConfig.openTime || '10:00');
        const staffClose = timeToMinutes(st.workingHours?.closeTime || salonDayConfig.closeTime || '20:00');

        // Check if slot falls within staff working hours
        if (slotStart < staffOpen || slotEnd > staffClose) {
          continue;
        }

        // Check existing non-cancelled appointments for this staff on this date
        const existingAppts = await Appointment.find({
          staffId: st._id,
          date: date,
          status: { $nin: ['Cancelled'] }
        });

        const hasConflict = existingAppts.some(app => {
          const appStart = timeToMinutes(app.startTime);
          const appEnd = timeToMinutes(app.endTime);
          return isOverlapping(slotStart, slotEnd, appStart, appEnd);
        });

        if (!hasConflict) {
          availableStaffForSlot.push({
            id: st._id,
            name: st.name,
            role: st.role
          });
        }
      }

      if (availableStaffForSlot.length > 0) {
        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          availableStaff: availableStaffForSlot
        });
      }
    }

    res.json({
      success: true,
      date,
      dayOfWeek,
      service: { id: service._id, name: service.name, duration: service.duration },
      count: slots.length,
      slots
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET List Appointments
router.get('/', async (req, res) => {
  try {
    const { date, status, staffId, customerId } = req.query;
    let filter = {};
    if (date) filter.date = date;
    if (status && status !== 'All') filter.status = status;
    if (staffId) filter.staffId = staffId;
    if (customerId) filter.customerId = customerId;

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'name mobile email')
      .populate('serviceId', 'name price duration category')
      .populate('staffId', 'name role')
      .sort({ date: -1, startTime: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Appointment Details by Token or ID
router.get('/:id', async (req, res) => {
  try {
    let appointment;
    if (req.params.id.length === 24) {
      appointment = await Appointment.findById(req.params.id)
        .populate('customerId')
        .populate('serviceId')
        .populate('staffId');
    } else {
      appointment = await Appointment.findOne({ rescheduleToken: req.params.id })
        .populate('customerId')
        .populate('serviceId')
        .populate('staffId');
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Create Appointment (Double Booking Protection!)
router.post('/', async (req, res) => {
  try {
    const { customerId, customerName, customerMobile, serviceId, staffId, date, startTime, notes, bookingSource } = req.body;

    if (!serviceId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Service, date, and start time are required' });
    }

    // Identify or Create Customer
    let targetCustomer;
    if (customerId) {
      targetCustomer = await Customer.findById(customerId);
    } else if (customerMobile) {
      targetCustomer = await Customer.findOne({ mobile: customerMobile.trim() });
      if (!targetCustomer && customerName) {
        targetCustomer = await Customer.create({
          name: customerName,
          mobile: customerMobile.trim()
        });
      }
    }

    if (!targetCustomer) {
      return res.status(400).json({ success: false, message: 'Customer information is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.active) {
      return res.status(400).json({ success: false, message: 'Service is inactive or unavailable for new bookings' });
    }

    // Resolve Staff: If 'any', select available staff
    let selectedStaffId = staffId;
    if (!staffId || staffId === 'any') {
      const eligibleStaffList = await Staff.find({ active: true, assignedServices: serviceId });
      const slotStartMins = timeToMinutes(startTime);
      const slotEndMins = slotStartMins + service.duration;

      for (const st of eligibleStaffList) {
        const existing = await Appointment.find({
          staffId: st._id,
          date,
          status: { $nin: ['Cancelled'] }
        });
        const conflict = existing.some(app => {
          return isOverlapping(slotStartMins, slotEndMins, timeToMinutes(app.startTime), timeToMinutes(app.endTime));
        });
        if (!conflict) {
          selectedStaffId = st._id;
          break;
        }
      }
    }

    if (!selectedStaffId || selectedStaffId === 'any') {
      return res.status(400).json({ success: false, message: 'No staff member is available at the selected time slot' });
    }

    const staffMember = await Staff.findById(selectedStaffId);
    if (!staffMember || !staffMember.active) {
      return res.status(400).json({ success: false, message: 'Selected staff member is inactive or not found' });
    }

    // Compute End Time
    const startMins = timeToMinutes(startTime);
    const endMins = startMins + service.duration;
    const endTime = minutesToTime(endMins);

    // CRITICAL: Double Booking Check (Spec Section 20 & Acceptance Test 2)
    const existingConflicts = await Appointment.find({
      staffId: selectedStaffId,
      date,
      status: { $nin: ['Cancelled'] }
    });

    const hasDoubleBooking = existingConflicts.some(app => {
      return isOverlapping(startMins, endMins, timeToMinutes(app.startTime), timeToMinutes(app.endTime));
    });

    if (hasDoubleBooking) {
      return res.status(400).json({ 
        success: false, 
        message: `Staff ${staffMember.name} is already booked during this time (${startTime} - ${endTime}). No double booking.` 
      });
    }

    // Generate Unique Appointment Number
    const count = await Appointment.countDocuments();
    const appointmentNumber = `APT-${1000 + count + 1}`;
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const appointment = await Appointment.create({
      appointmentNumber,
      customerId: targetCustomer._id,
      serviceId: service._id,
      staffId: staffMember._id,
      date,
      startTime,
      endTime,
      duration: service.duration,
      status: 'Booked',
      notes: notes || '',
      bookingSource: bookingSource || 'Reception',
      rescheduleToken: token,
      salonId: service.salonId
    });

    // Create Notification
    await Notification.create({
      recipientId: targetCustomer._id,
      recipientRole: 'customer',
      type: 'Booking Confirmation',
      title: 'Appointment Booked',
      message: `Your appointment for ${service.name} with ${staffMember.name} on ${date} at ${startTime} is confirmed.`,
      channel: 'In-app',
      deliveryStatus: 'Sent',
      salonId: service.salonId
    });

    res.status(201).json({
      success: true,
      appointment,
      rescheduleToken: token,
      message: 'Appointment created successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH Update Status (Check-in, Start Service, Complete Service, Cancel, No-show)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, cancellationReason, noShowNote } = req.body;
    let appointment = await Appointment.findById(req.params.id)
      .populate('customerId')
      .populate('serviceId')
      .populate('staffId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const prevStatus = appointment.status;
    const allowedStatuses = ['Booked', 'Confirmed', 'Checked-in', 'In Service', 'Completed', 'Cancelled', 'No-show'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    // Status jump validations (Spec Section 24)
    if (prevStatus === 'Completed' && status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot change status of an already completed appointment' });
    }
    if (prevStatus === 'Cancelled' && status !== 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot reactivate a cancelled appointment' });
    }

    appointment.status = status;
    if (status === 'Checked-in') {
      appointment.checkInTime = new Date();
    } else if (status === 'In Service') {
      appointment.actualStartTime = new Date();
    } else if (status === 'Completed') {
      appointment.actualEndTime = new Date();
    } else if (status === 'Cancelled') {
      appointment.cancellationReason = cancellationReason || 'Customer Request';
    } else if (status === 'No-show') {
      appointment.noShowMarkedBy = req.body.markedBy || 'Staff';
    }

    await appointment.save();

    // Trigger Notification for cancellation or completion
    if (status === 'Cancelled') {
      await Notification.create({
        recipientId: appointment.customerId._id,
        recipientRole: 'customer',
        type: 'Cancellation',
        title: 'Appointment Cancelled',
        message: `Your appointment ${appointment.appointmentNumber} on ${appointment.date} has been cancelled.`,
        deliveryStatus: 'Sent'
      });
    }

    res.json({
      success: true,
      appointment,
      message: `Appointment status updated to ${status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Reschedule Appointment (Spec Section 26 & Acceptance Test 5)
router.post('/:id/reschedule', async (req, res) => {
  try {
    const { newDate, newStartTime, newStaffId } = req.body;
    let appointment = await Appointment.findById(req.params.id).populate('serviceId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot reschedule a ${appointment.status.toLowerCase()} appointment` });
    }

    const targetStaffId = newStaffId || appointment.staffId;
    const staffMember = await Staff.findById(targetStaffId);
    if (!staffMember || !staffMember.active) {
      return res.status(400).json({ success: false, message: 'Selected staff member is unavailable' });
    }

    const serviceDuration = appointment.duration || appointment.serviceId.duration;
    const startMins = timeToMinutes(newStartTime);
    const endMins = startMins + serviceDuration;
    const newEndTime = minutesToTime(endMins);

    // Check availability (exclude current appointment ID from conflict check!)
    const existingConflicts = await Appointment.find({
      _id: { $ne: appointment._id },
      staffId: targetStaffId,
      date: newDate,
      status: { $nin: ['Cancelled'] }
    });

    const hasConflict = existingConflicts.some(app => {
      return isOverlapping(startMins, endMins, timeToMinutes(app.startTime), timeToMinutes(app.endTime));
    });

    if (hasConflict) {
      return res.status(400).json({ 
        success: false, 
        message: 'Selected slot is unavailable. Please select another slot.' 
      });
    }

    // Success! Move appointment to new slot (frees old slot automatically)
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.staffId = targetStaffId;
    appointment.status = 'Confirmed';
    await appointment.save();

    await Notification.create({
      recipientId: appointment.customerId,
      recipientRole: 'customer',
      type: 'Reschedule',
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${newDate} at ${newStartTime}.`,
      deliveryStatus: 'Sent'
    });

    res.json({
      success: true,
      appointment,
      message: 'Appointment rescheduled successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
