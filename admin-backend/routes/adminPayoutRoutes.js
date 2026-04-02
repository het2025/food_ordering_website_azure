import express from 'express';
import { getPendingBankAccounts, updateBankAccountStatus } from '../controllers/adminBankAccountController.js';
import { getAllPayoutRequests, updatePayoutStatus } from '../controllers/adminPayoutController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/bank-accounts/pending', getPendingBankAccounts);
router.put('/bank-accounts/:id/status', validateObjectId('id'), updateBankAccountStatus);

router.get('/requests', getAllPayoutRequests);
router.put('/requests/:id/status', validateObjectId('id'), updatePayoutStatus);

export default router;
