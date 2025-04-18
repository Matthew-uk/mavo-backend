import express from 'express';
import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getCurrentUser,
  changePassword,
} from '../controllers/auth-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Verify email with code
router.post('/verify', verifyEmail);

// Resend verification code
router.post('/resend-code', resendVerificationCode);

// Login user
router.post('/login', login);

// Get current user profile
router.get('/me', authenticate, getCurrentUser);

// Change password
router.put('/change-password', authenticate, changePassword);


export default router;
