import express from 'express';
import { checkAvailability } from '../controllers/pincodeController.js';

const router = express.Router();

router.get('/check/:pincode', checkAvailability);

export default router;
