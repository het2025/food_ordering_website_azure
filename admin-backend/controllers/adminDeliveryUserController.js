import { DeliveryBoy } from '../models/DeliveryBoy.js';

// @desc    Get all delivery boys
// @route   GET /api/admin/delivery-users
// @access  Private/Admin
export const getDeliveryUsers = async (req, res) => {
  try {
    const deliveryUsers = await DeliveryBoy.find()
      .select('-password -__v -currentLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveryUsers.length,
      data: deliveryUsers
    });
  } catch (error) {
    console.error('Error in getDeliveryUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
