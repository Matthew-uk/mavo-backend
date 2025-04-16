import User from '../models/user-model.js';
import { updateOne } from '../utils/crudHandler.js';
import catchAsyncHandler from '../utils/catchAsyncHandler.js';

// Update user profile
export const updateProfile = updateOne(User)

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// Get all drivers (for car owners)
export const getAllDrivers = async (req, res) => {
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
};

// Get all car owners (for drivers)
export const getAllCarOwners = async (req, res) => {
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
};
