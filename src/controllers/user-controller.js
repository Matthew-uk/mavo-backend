import User from '../models/user-model.js';
import { deleteOne, getAll, getOne, updateOne } from '../utils/crudHandler.js';
import catchAsyncHandler from '../utils/catchAsyncHandler.js';

export const getAllUsers = getAll(User)
export const getUser = getOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)

// Get all drivers (for car owners)
export const getAllDrivers = catchAsyncHandler(async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      isVerified: true,
    }).select('-password -verificationCode');

    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error while fetching drivers' });
  }
});

// Get all car owners (for drivers)
export const getAllCarOwners = catchAsyncHandler(async (req, res) => {
  try {
    const carOwners = await User.find({
      role: 'car_owner',
      isVerified: true,
    }).select('-password -verificationCode');

    res.status(200).json({ carOwners });
  } catch (error) {
    console.error('Get car owners error:', error);
    res.status(500).json({ message: 'Server error while fetching car owners' });
  }
});
