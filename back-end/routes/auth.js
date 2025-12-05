const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models").User;
require("dotenv").config();

// @route   POST api/auth/register
// @desc    Register user & get token
// @access  Public
router.post("/register", async (req, res) => {
  const { username, email, password, name, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash security answers
    let hashedAnswer1 = "";
    let hashedAnswer2 = "";
    if (securityAnswer1) {
      const salt1 = await bcrypt.genSalt(10);
      hashedAnswer1 = await bcrypt.hash(securityAnswer1.toLowerCase().trim(), salt1);
    }
    if (securityAnswer2) {
      const salt2 = await bcrypt.genSalt(10);
      hashedAnswer2 = await bcrypt.hash(securityAnswer2.toLowerCase().trim(), salt2);
    }

    user = new User({
      username,
      email,
      password,
      name,
      securityQuestion1: securityQuestion1 || "",
      securityAnswer1: hashedAnswer1,
      securityQuestion2: securityQuestion2 || "",
      securityAnswer2: hashedAnswer2,
    });

    user.updateStreak();
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Update streak on login
    const streakUpdate = user.updateStreak();
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastLoginDate: user.lastLoginDate,
            totalLogins: user.totalLogins
          },
          streakUpdate: streakUpdate
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'username name')
      .populate('following', 'username name');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/email
// @desc    Update user email
// @access  Private
router.put("/email", auth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const existing = await User.findOne({
      email: email,
      _id: { $ne: req.user.id },
    });

    if (existing) {
      return res.status(400).json({ msg: "Email is already in use" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.email = email;
    await user.save();

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/auth/password
// @desc    Update user password
// @access  Private
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Current password and new password are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/streak
// @desc    Get user streak data
// @access  Private
router.get('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('currentStreak longestStreak lastLoginDate totalLogins');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastLoginDate: user.lastLoginDate,
      totalLogins: user.totalLogins
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/forgot-password
// @desc    Get security questions for email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select('securityQuestion1 securityQuestion2');
    
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email address" });
    }

    if (!user.securityQuestion1 || !user.securityQuestion2) {
      return res.status(400).json({ msg: "This account was created before security questions were available. Please contact support to reset your password." });
    }

    res.json({ 
      securityQuestion1: user.securityQuestion1,
      securityQuestion2: user.securityQuestion2
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/verify-security
// @desc    Verify security question answers
// @access  Public
router.post('/verify-security', async (req, res) => {
  const { email, answer1, answer2 } = req.body;

  try {
    const user = await User.findOne({ email }).select('securityAnswer1 securityAnswer2');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Compare answers (case-insensitive)
    const isMatch1 = await bcrypt.compare(answer1.toLowerCase().trim(), user.securityAnswer1);
    const isMatch2 = await bcrypt.compare(answer2.toLowerCase().trim(), user.securityAnswer2);

    if (!isMatch1 || !isMatch2) {
      return res.status(400).json({ msg: "Security answers do not match" });
    }

    // Generate a temporary reset token
    const payload = { user: { id: user.id } };
    const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({ resetToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password with reset token
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: "Reset token expired" });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/leaderboard
// @desc    Get top users by streak
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topUsers = await User.find()
      .select('username name currentStreak longestStreak')
      .sort({ currentStreak: -1, longestStreak: -1 })
      .limit(limit);

    res.json({ leaderboard: topUsers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Middleware to verify JWT token
function auth(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = router;