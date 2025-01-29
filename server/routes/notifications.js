const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      createdBy: req.user._id
    });

    await notification.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الإشعار',
      error: error.message
    });
  }
});

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = {
      $or: [
        { isGlobal: true },
        { targetDepartment: req.user.department }
      ]
    };

    const notifications = await Notification.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add read status for each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const readStatus = notification.readBy.find(
        read => read.user.toString() === req.user._id.toString()
      );
      return {
        ...notification.toObject(),
        isRead: !!readStatus,
        readAt: readStatus?.readAt
      };
    });

    res.json({
      success: true,
      notifications: notificationsWithReadStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإشعارات',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }

    // Check if user has already read this notification
    const alreadyRead = notification.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة قراءة الإشعار'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة قراءة الإشعار',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }

    await notification.remove();

    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الإشعار',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const query = {
      $or: [
        { isGlobal: true },
        { targetDepartment: req.user.department }
      ],
      'readBy.user': { $ne: req.user._id }
    };

    const count = await Notification.countDocuments(query);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب عدد الإشعارات غير المقروءة',
      error: error.message
    });
  }
});

module.exports = router;
