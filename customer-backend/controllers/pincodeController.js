import Pincode from '../models/Pincode.js';

export const checkAvailability = async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Ensure 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Invalid pincode format' });
    }

    const found = await Pincode.findOne({ pincode });
    
    if (found) {
      return res.status(200).json({ success: true, available: true, area: found.areaName });
    } else {
      return res.status(200).json({ success: true, available: false });
    }
  } catch (error) {
    console.error('Error checking pincode:', error);
    res.status(500).json({ success: false, message: 'Server error checking pincode' });
  }
};
