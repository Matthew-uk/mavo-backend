import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './user-model';

const ownerSchema = new mongoose.Schema(
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
ownerSchema.pre('save', async function (next) {
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
ownerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Owner = User.discriminator('car_owner', ownerSchema);

export default Owner;
