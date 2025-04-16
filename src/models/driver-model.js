import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './user-model';

const driverSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      //   required: true,
      trim: true,
    },
    lastName: {
      type: String,
      //   required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
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
    profileImage: {
      type: String,
    }
  },
  { timestamps: true },
);

// Hash password before saving
driverSchema.pre('save', async function (next) {
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
driverSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Driver = User.discriminator('driver', driverSchema);

export default Driver;
