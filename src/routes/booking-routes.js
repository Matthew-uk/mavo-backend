import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth-middleware.js';
import { bookDriver, createBooking, deleteBooking, driverClockIn, driverClockOut, getAllBookings, getBooking, updateBooking } from '../controllers/booking-controller.js';

const router = express.Router();

const authMW = (req, res, next) => {
    if (req.user.role === 'car_owner') {
        req.body.owner = req.user._id
    }

    next()
}

router.use(authenticate)
router.route("/").get(authorizeRole("admin"), getAllBookings).post(authorizeRole(["admin", "car_owner"]), authMW, createBooking)
router.route("/:_id").get(getBooking).patch(updateBooking).delete(authorizeRole("admin"), deleteBooking)

router.put("/:_id/clockIn", authorizeRole("driver"), driverClockIn)
router.put("/:_id/clockOut", authorizeRole("driver"), driverClockOut)
router.post("/book-driver", authorizeRole("admin"), bookDriver)

export default router;
