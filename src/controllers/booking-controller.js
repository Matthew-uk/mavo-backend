import Booking from '../models/booking-model.js';
import AppError from '../utils/appError.js';
import catchAsyncHandler from '../utils/catchAsyncHandler.js';
import {
  createNew,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '../utils/crudHandler.js';

export const getAllBookings = getAll(Booking);
export const getBooking = getOne(Booking);
export const createBooking = createNew(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);

export const driverClockIn = catchAsyncHandler(async (req, res, next) => {
  const booking = await Booking.findOne({
    _id: req.params._id,
    driver: req.user._id,
  });

  if (!booking) {
    return next(new AppError("You don't have such a booking"));
  }

  booking.clockIn();

  await booking.save();

  res.status(200).json({
    message: 'Successfully clocked in today',
  });
});

export const driverClockOut = catchAsyncHandler(async (req, res, next) => {
    const booking = await Booking.findOne({
        _id: req.params._id,
        driver: req.user._id,
      });
    
      if (!booking) {
        return next(new AppError("You don't have such a booking"));
      }
    
      booking.clockOut();
    
      await booking.save();
    
      res.status(200).json({
        message: 'Successfully clocked in today',
      });
});

export const bookDriver = catchAsyncHandler(async (req, res, next) => {
    const {driver} = req.body

    const booking = await Booking.findByIdAndUpdate(req.body.bookingId, {
        driver, status: "confirmed"
    }, {
        runValidators: true,
        new: true
    })

    if (!booking) {
        return next(new AppError("Booking does not exist"))
    }

    res.status(200).json({
        message: "Driver successfully booked"
    })
})