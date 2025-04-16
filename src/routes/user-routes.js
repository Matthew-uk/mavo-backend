import express from 'express';
import {
  updateProfile,
  changePassword,
  getAllDrivers,
  getAllCarOwners,
} from '../controllers/user-controller.js';
import { authenticate, authorizeRole } from '../middleware/auth-middleware.js';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, updateProfile);

// Change password
router.put('/change-password', authenticate, changePassword);

// Get all drivers (for car owners)
router.get(
  '/drivers',
  authenticate,
  authorizeRole(['car_owner']),
  getAllDrivers,
);

// Get all car owners (for drivers)
router.get(
  '/car-owners',
  authenticate,
  authorizeRole(['driver']),
  getAllCarOwners,
);

export default router;
