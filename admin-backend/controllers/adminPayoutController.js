import mongoose from 'mongoose';
import { Payout } from '../models/Payout.js';
import { Restaurant } from '../models/Restaurant.js';
import { RestaurantOwner } from '../models/RestaurantOwner.js';

// GET /api/admin/payouts
export const getAllPayoutRequests = async (req, res) => {
    try {
        const payouts = await Payout.find()
            .populate({
                path: 'restaurantId',
                select: 'name owner contact',
                populate: { path: 'owner', select: 'name email phone' }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: payouts });
    } catch (error) {
        console.error('getAllPayoutRequests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payout requests' });
    }
};

// PUT /api/admin/payouts/:id/status
export const updatePayoutStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid id format' });
        }

        const { status } = req.body;
        if (!['Pending', 'Completed', 'Failed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const payout = await Payout.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        res.json({ success: true, data: payout, message: `Payout status updated to ${status}` });
    } catch (error) {
        console.error('updatePayoutStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update payout status' });
    }
};
