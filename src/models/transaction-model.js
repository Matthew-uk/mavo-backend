import mongoose, { model, Schema } from 'mongoose';

const transactionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
  },
});

const Transaction = model('Transaction', transactionSchema);

export default Transaction;
