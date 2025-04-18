import mongoose, { Error } from 'mongoose';
import { getIntervalLengthInDays } from '../utils/helpers.js';
import User from './user-model.js';

const bookingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "A booking request must have a car owner"]
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  serviceType: {
    type: String,
    enum: ['personal', 'school-runs', 'office'],
  },
  startDate: {
    type: Date,
  },
  interval: {
    type: String,
    enum: ['monthly', 'bi-monthly', 'annually'],
  },
  pricing: {
    type: String,
    enum: ['basic', 'premium'],
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'concelled', 'completed'],
    default: "pending"
  },
  days: {
    type: [
      {
        clockIn: Date,
        clockOut: Date,
        date: Date,
      },
    ],
    validate: {
      validator: function (val) {
        // Only run if both dates exist
        if (!this.startDate || !this.interval) return true;
        const maxLength = getIntervalLengthInDays(this.startDate, this.interval);
        return val.length <= maxLength;
      },
      message: 'Days array exceeds maximum allowed length based on interval.',
    },
  },
});

bookingSchema.pre("save", async function (next) {
    if (this.isModified("driver")) {
        console.log("driver")
        const driver = await User.findOneAndUpdate({_id: this.driver, role: "driver", booking: { $exists: false } }, {booking: this._id}, {
            runValidators: true, new: true
        } )
        
        if(!driver) {
            throw new mongoose.Error("Driver does not exist")
        }
    }
    if (this.isModified("owner")) {
        console.log("owner")
        const owner = await User.findOneAndUpdate({_id: this.owner, role: "car_owner", booking: { $exists: false } }, {booking: this._id}, {
            runValidators: true, new: true
        } )

        if(!owner) {
            throw new mongoose.Error("Owner does not exist")
        }

        console.log(owner)
    }

    next()
})

bookingSchema.methods.clockIn = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  this.days.push({
    clockIn: new Date(),
    date: today,
  });
};

bookingSchema.methods.clockOut = function () {
  const target = new Date();
  target.setHours(0, 0, 0, 0);

  const dayEntry = this.days.find(
    (day) => day.date.getTime() === target.getTime(),
  );
  if (!dayEntry) throw new Error('Date not found in days array');

  dayEntry.clockOut = new Date();
};

// find code to automatically run a function at a specific date

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
