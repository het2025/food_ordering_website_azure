import { Payout } from '../models/Payout.js';
import { RestaurantOwner } from '../models/RestaurantOwner.js';

// POST /api/payouts/request
export const requestPayout = async (req, res) => {
    try {
        const { amount, orderCount, breakdown } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payout amount' });
        }

        const owner = await RestaurantOwner.findById(req.restaurantOwner.id);
        if (!owner || !owner.restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found for owner' });
        }

        const payout = await Payout.create({
            restaurantId: owner.restaurant,
            amount: amount,
            breakdown: breakdown || { dishPrice: 0, taxes: 0 },
            orderCount: orderCount || 0,
            status: 'Pending'
        });

        res.status(201).json({ success: true, data: payout, message: 'Payout requested successfully' });
    } catch (error) {
        console.error('Request payout error:', error);
        res.status(500).json({ success: false, message: 'Failed to request payout' });
    }
};

// GET /api/payouts
export const getPayouts = async (req, res) => {
    try {
        const owner = await RestaurantOwner.findById(req.restaurantOwner.id);
        if (!owner || !owner.restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        const payouts = await Payout.find({ restaurantId: owner.restaurant }).sort({ createdAt: -1 });
        res.json({ success: true, data: payouts });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payouts' });
    }
};
