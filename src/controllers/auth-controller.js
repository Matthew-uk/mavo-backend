import User from '../models/user-model.js';
import { generateToken, generateVerificationCode } from '../utils/helpers.js';
import { sendVerificationEmail } from '../services/email-service.js';
import AppError from '../utils/appError.js';
import catchAsyncHandler from '../utils/catchAsyncHandler.js';

// Register new user
export const register = catchAsyncHandler(async (req, res, next) => {
    const { email, role } = req.body;

    
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return next(new AppError('User already exists', 400))
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Create new user
    const newUser = await User.create({...req.body, verificationCode})
    console.log(newUser)
    

    
    // Send verification email
    await sendVerificationEmail(email, newUser.firstName, verificationCode.code);

    res.status(201).json({
      message:
        'User registered successfully. Verification code sent to your email.',
      userId: newUser._id,
    });
});

// Verify email with code
export const verifyEmail = catchAsyncHandler(async (req, res, next) => {
    const { userId, code } = req.body;

    // Find and update in one go if user exists, is not verified, and code matches and isn't expired
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        isVerified: false,
        "verificationCode.code": code,
        "verificationCode.expiresAt": { $gt: new Date() },
      },
      {
        $set: { isVerified: true },
        $unset: { verificationCode: 1, expiresAt: 1 },
      },
      { new: true }
    );

    if (!user) {
      return next(new AppError("Invalid or expired verification details", 400));
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
});

// Resend verification code
export const resendVerificationCode = catchAsyncHandler(async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10);

    user.verificationCode = {
      code: verificationCode,
      expiresAt: codeExpiresAt,
    };

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({
      message: 'Verification code resent successfully',
    });
});

// Login user
export const login = catchAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log(email)
    
    // Find user by email
    const user = await User.findOne({ email });
    console.log(user)

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Account not verified. Please verify your email',
        userId: user._id,
        verified: false,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
});


// Get current user profile
export const getCurrentUser = catchAsyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

  // Change password
  export const changePassword = catchAsyncHandler(async (req, res) => {
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
  });