import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

export const signupController = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, ownerName, location, cuisine } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create base user
    const newUser = new User({ name, email, password, phone, role });
    await newUser.save();

    // If restaurant, create restaurant profile
    if (role === 'restaurant') {
      const newRestaurant = new Restaurant({
        user: newUser._id,
        name,
        ownerName,
        email,
        phone,
        location,
        cuisine,
      });
      await newRestaurant.save();
    }

    // Set session
    req.session.userId = newUser._id;
    req.session.role = role;

    res.status(201).json({ message: 'Signup successful', user: { id: newUser._id, role, name, email } });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Role mismatch' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({ message: 'Login successful', user: { id: user._id, role: user.role, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const logoutController = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};

export const currentUserController = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Validate ObjectId format to avoid CastError
    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Session invalid' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Session invalid' });
    }

    return res.json({ user: { id: user._id, role: user.role, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const checkSessionController = (req, res) => {
  if (req.session.userId) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
}; 