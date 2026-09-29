const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// GET Notifications for user role
router.get('/', protect, async (req, res) => {
  try {
    const role = req.user.role;
    const notifications = await Notification.find({
      $or: [
        { recipientRole: role },
        { recipientRole: 'all' },
        { recipientId: req.user._id }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ success: true, unreadCount, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH Mark as Read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
