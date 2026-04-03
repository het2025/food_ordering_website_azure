import express from 'express';
import { DeliveryPayout } from '../models/DeliveryPayout.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', authAdmin, async (req, res) => {
    try {
        const payouts = await DeliveryPayout.find().populate('deliveryUser', 'name email phone bankDetails').sort({ paidAt: -1 });
        res.json({ success: true, data: payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
