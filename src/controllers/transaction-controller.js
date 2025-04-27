import Booking from '../models/booking-model.js';
import Transaction from '../models/transaction-model.js';
import User from '../models/user-model.js';
import catchAsyncHandler from '../utils/catchAsyncHandler.js';
import {
  initializePayment,
  verifyPayment,
  createTransferRecipient,
  initiateTransfer,
  verifyWebhookSignature,
} from '../utils/paystack.js';

export const createTransaction = catchAsyncHandler(async (req, res, next) => {
  const { userId, amount, serviceType, startDate, interval, pricing, message } =
    req.body;
  let email;

  if (userId) {
    const user = await User.findOne({ _id: user, role: 'car_owner' });
    email = user.email;
  } else {
    email = req.user.email;
  }

  if (!email) {
    return next(new AppError('User not found', 404));
  }

  const paymentData = await initializePayment({
    email,
    amount,
    callback_url: `${req.protocol}://${req.get(
      'host',
    )}/api/transactions/verify`,
    details: {
      owner: userId || req.user._id,
      serviceType,
      startDate,
      interval,
      pricing,
      message: message || '',
    },
  });

  res.status(200).json(paymentData);
});

export const dummyFrontend = catchAsyncHandler(async (req, res, next) => {
  res.redirect(`/api/transactions/verify/${req.query.reference}`);
});

export const verifyTransaction = catchAsyncHandler(async (req, res, next) => {
  const { reference } = req.params;

  const verifiedPayment = await verifyPayment(reference);

  const transaction = await Transaction.create({
    userId: verifiedPayment.metadata.owner,
    description: verifiedPayment.metadata.description,
    reference,
  });

  const booking = await Booking.create({
    transactionId: transaction._id,
    ...verifiedPayment.metadata,
  });

  res.status(201).json({
    status: 'success',
    message: 'Booking successful',
    document: booking,
  });
});

export const verifyWebhook = catchAsyncHandler(async (req, res, next) => {
  if (!verifyWebhookSignature(req)) {
    console.error('Invalid Webhook Signature');
    return res.status(400).send('Invalid Signature');
  }

  const event = JSON.parse(req.body);

  if (event.event === 'charge.success') {
    const { reference, amount, customer, metadata } = event.data;
    console.log('Payment successful:', reference, amount, customer.email);

    const newTransaction = await Transaction.create({
      userId: metadata.userId,
      description: metadata.purpose,
    });
  }

  res.sendStatus(200);
});

export const createRecipient = catchAsyncHandler(async (req, res, next) => {
  const { name, account_number, bank_code, amount, reason } = req.body;

  const recipient = await createTransferRecipient({
    name,
    account_number,
    bank_code,
  });

  // Step 2: Initiate transfer
  const transfer = await initiateTransfer({
    amount,
    recipient_code: recipient.recipient_code,
    reason,
  });

  res.json(transfer);
});
