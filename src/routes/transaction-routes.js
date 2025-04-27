import express from 'express';
import {
  createTransaction,
  dummyFrontend,
  verifyTransaction,
  verifyWebhook,
} from '../controllers/transaction-controller.js';
import { authenticate, authorizeRole } from '../middleware/auth-middleware.js';
const router = express.Router();

const authMW = (req, res, next) => {
  if (req.user.role === 'car_owner') {
    req.body.owner = req.user._id;
  }

  next();
};

router.use(authenticate);

router.post(
  '/',
  authorizeRole(['admin', 'car_owner']),
  authMW,
  createTransaction,
);
router.get('/verify', dummyFrontend);
router.get('/verify/:reference', verifyTransaction);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  verifyWebhook,
);
// router.post('/transfer/recipient', createRecipient);
// router.post('/transfer/initiate', initiateTransfer);
// router.post('/webhook/verify', verifyWebhookSignature);

// router.get('/', getAllTransactions);
// router.get('/:_id', getTransaction);
// router.patch('/:_id', updateTransaction);
// router.delete('/:_id', deleteTransaction);

export default router;
