const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Task = require('../models/Task');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Validate task assignment (either to specific users or department)
    if (!req.body.assignedDepartment && (!req.body.assignedTo || !Array.isArray(req.body.assignedTo) || req.body.assignedTo.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد موظفين أو قسم للمهمة'
      });
    }

    // Create task with either department or specific users
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });

    // Populate the task with user details
    await task.populate('assignedTo', 'name email department');

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المهمة',
      error: error.message
    });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks (admin: all tasks, employee: assigned tasks)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    const query = {};

    // Filter options
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Admin sees all tasks, employees see tasks assigned to them or their department
    if (req.user.role !== 'admin') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedDepartment: req.user.department }
      ];
    }

    tasks = await Task.find(query)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المهام',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name')
      .populate('comments.author', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'المهمة غير موجودة'
      });
    }

    // Check if user has access to this task
    if (req.user.role !== 'admin' && 
        !task.assignedTo.some(user => user._id.toString() === req.user._id.toString()) &&
        task.assignedDepartment !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول لهذه المهمة'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المهمة',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'المهمة غير موجودة'
      });
    }

    // Only admin can update all fields, employees can only update status and progress
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['status', 'progress', 'comments'];
      const requestedUpdates = Object.keys(req.body);
      const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتحديث هذه البيانات'
        });
      }
    }

    // Validate assignedTo if it's being updated
    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo) || req.body.assignedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد موظف واحد على الأقل للمهمة'
        });
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email department')
     .populate('createdBy', 'name');

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المهمة',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'المهمة غير موجودة'
      });
    }

    await task.remove();

    res.json({
      success: true,
      message: 'تم حذف المهمة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المهمة',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/comment
// @desc    Add comment to task
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'المهمة غير موجودة'
      });
    }

    const comment = {
      text: req.body.text,
      author: req.user._id
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('comments.author', 'name');

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة التعليق',
      error: error.message
    });
  }
});

module.exports = router;
