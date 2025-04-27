import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// These two lines are needed because you're using "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env correctly no matter where you run from
dotenv.config({ path: path.resolve(__dirname, './../../.env') });

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

// Initialize payment
export async function initializePayment({
  email,
  amount,
  callback_url,
  details,
}) {
  const metadata = { description: 'Booking payment to company', ...details };
  const response = await fetch(
    'https://api.paystack.co/transaction/initialize',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        amount: amount * 100,
        metadata,
        callback_url,
      }), // amount in kobo
    },
  );

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message);
  }
  return result.data; // Contains authorization_url, reference, etc.
}

// Verify payment
export async function verifyPayment(reference) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers,
    },
  );

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message);
  }
  return result.data;
}

// Create transfer recipient
export async function createTransferRecipient({
  name,
  account_number,
  bank_code,
}) {
  const response = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'nuban',
      name,
      account_number,
      bank_code,
      currency: 'NGN',
    }),
  });

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message);
  }
  return result.data; // recipient_code
}

// Initiate transfer
export async function initiateTransfer({ amount, recipient_code, reason }) {
  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'balance',
      amount: amount * 100,
      recipient: recipient_code,
      reason,
    }),
  });

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message);
  }
  return result.data;
}

// Verify webhook signature
export function verifyWebhookSignature(req) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');

  const paystackSignature = req.headers['x-paystack-signature'];
  return hash === paystackSignature;
}
