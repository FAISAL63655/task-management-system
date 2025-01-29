const express = require('express');
const router = express.Router();
const { protect, admin, generateToken } = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/auth/create-admin
// @desc    Create first admin user
// @access  Public (only works if no admin exists)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'يوجد مدير بالفعل في النظام'
      });
    }

    // Check if email exists but not as admin
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      // Update user to admin
      existingUser.role = 'admin';
      existingUser.name = 'مدير النظام';
      existingUser.department = 'الإدارة';
      await existingUser.save();

      return res.status(200).json({
        success: true,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          department: existingUser.department
        },
        token: generateToken(existingUser._id)
      });
    }

    // Create new admin user if doesn't exist
    const admin = await User.create({
      name: 'مدير النظام',
      email: 'admin@example.com',
      password: 'admin123',
      department: 'الإدارة',
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department
      },
      token: generateToken(admin._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء حساب المدير',
      error: error.message
    });
  }
});


// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      department,
      role: role || 'employee' // Default to employee if no role specified
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل المستخدم',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل الدخول',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدمين',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { name, email, department, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;
    user.role = role || user.role;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات المستخدم',
      error: error.message
    });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن حذف المدير الوحيد في النظام'
        });
      }
    }

    await user.remove();

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المستخدم',
      error: error.message
    });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدم',
      error: error.message
    });
  }
});

module.exports = router;
