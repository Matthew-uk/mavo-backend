import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      //   required: true,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      //   required: true,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      default: '',
    },
    phoneNumber: {
      type: String,
      //   required: true,
    },
    address: {
      type: String,
      default: '',
      //   required: true,
    },
    role: {
      type: String,
      enum: ['car_owner', 'driver'],
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
