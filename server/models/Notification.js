const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'الرجاء إدخال عنوان الإشعار']
  },
  message: {
    type: String,
    required: [true, 'الرجاء إدخال نص الإشعار']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isGlobal: {
    type: Boolean,
    default: true
  },
  targetDepartment: {
    type: String,
    required: function() {
      return !this.isGlobal;
    }
  }
}, {
  timestamps: true
});

// Add index for better query performance
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'readBy.user': 1 });

module.exports = mongoose.model('Notification', notificationSchema);
