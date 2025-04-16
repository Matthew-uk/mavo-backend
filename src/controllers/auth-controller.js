import User from '../models/user-model.js';
import { generateToken, generateVerificationCode } from '../utils/helpers.js';
import { sendVerificationEmail } from '../services/email-service.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address, role } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10); // Code expires in 10 minutes

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      role,
      verificationCode: {
        code: verificationCode,
        expiresAt: codeExpiresAt,
      },
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message:
        'User registered successfully. Verification code sent to your email.',
      userId: newUser._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify email with code
export const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (!user.verificationCode || !user.verificationCode.code) {
      return res.status(400).json({ message: 'No verification code found' });
    }

    if (new Date() > user.verificationCode.expiresAt) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    if (user.verificationCode.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark user as verified and remove verification code
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

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
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Resend verification code
export const resendVerificationCode = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Server error while resending code' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};
