import express from 'express';
import {
  getAllDrivers,
  getAllCarOwners,
  updateUser,
  getAllUsers,
  getUser,
  deleteUser,
} from '../controllers/user-controller.js';
import { authenticate, authorizeRole } from '../middleware/auth-middleware.js';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, (req, res, next) => {
  req.params._id = req.user._id
  next()
}, updateUser);


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

router.get("/", authenticate, getAllUsers)
router.route("/:_id").get(authenticate, getUser).patch(authenticate, updateUser).delete(deleteUser)

export default router;
