import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import { loginController, signupController, logoutController, currentUserController, checkSessionController } from '../controllers/authController.js';

const router = Router();

// Signup
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['customer', 'restaurant']).withMessage('Role must be customer or restaurant'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    signupController(req, res, next);
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    loginController(req, res, next);
  }
);

// Logout
router.post('/logout', logoutController);

// Current user
router.get('/current-user', currentUserController);

// Check session
router.get('/check-session', checkSessionController);

export default router; 