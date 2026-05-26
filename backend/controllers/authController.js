const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VALID_ROLES = ['user', 'admin'];

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    const userRole = role || 'user';
    if (!VALID_ROLES.includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole
      }
    });

    const token = generateToken(user.id, user.role);
    user.password = undefined;

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // If a role was specified (from the specific sign-in page), validate it matches
    if (role && user.role !== role) {
      const expected = role === 'admin' ? 'admin' : 'customer';
      return res.status(403).json({ 
        success: false, 
        message: `This account is not registered as an ${expected}. Please use the correct sign-in page.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id, user.role);
    user.password = undefined;

    res.status(200).json({ success: true, token, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    user.password = undefined;
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, profilePicture, dietaryPreference } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
        city: city !== undefined ? city : undefined,
        profilePicture: profilePicture !== undefined ? profilePicture : undefined,
        dietaryPreference: dietaryPreference !== undefined ? dietaryPreference : undefined
      }
    });

    updatedUser.password = undefined;
    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
