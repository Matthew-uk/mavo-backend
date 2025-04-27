import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth-middleware.js';
import {
  bookDriver,
  deleteBooking,
  driverClockIn,
  driverClockOut,
  getAllBookings,
  getBooking,
  updateBooking,
} from '../controllers/booking-controller.js';

const router = express.Router();

router.use(authenticate);
router.route('/').get(authorizeRole('admin'), getAllBookings);
router
  .route('/:_id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(authorizeRole('admin'), deleteBooking);

router.put('/:_id/clockIn', authorizeRole('driver'), driverClockIn);
router.put('/:_id/clockOut', authorizeRole('driver'), driverClockOut);
router.post('/book-driver', authorizeRole('admin'), bookDriver);

export default router;
