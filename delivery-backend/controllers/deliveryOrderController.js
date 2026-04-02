import { DeliveryOrder } from '../models/DeliveryOrder.js';
import { DeliveryBoy } from '../models/DeliveryBoy.js';
import mongoose from 'mongoose';
import axios from 'axios';

const ALLOWED_TRANSITIONS = {
  'ready_for_pickup': ['accepted'],
  'accepted'   : ['picked_up'],
  'picked_up'  : ['in_transit'],
  'in_transit' : ['delivered'],
  'delivered'  : []   // terminal state — no further transitions allowed
};

const isValidTransition = (currentStatus, newStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

// @desc    Create delivery order (called by customer-backend when order is Ready)
// @route   POST /api/delivery/orders/create
// @access  Internal (from other backends)
export const createDeliveryOrder = async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,
      restaurant,
      restaurantName,
      restaurantLocation,
      customer,
      customerName,
      customerPhone,
      deliveryAddress,
      orderAmount,
      deliveryFee,
      distance,
      estimatedDeliveryTime,
      deliveryOTP
    } = req.body;

    console.log('🔔 Creating delivery order:', orderNumber);
    console.log('🔐 Received delivery OTP:', deliveryOTP);

    // Validation
    if (!orderId || !restaurant || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }

    // Check if delivery order already exists for this order
    const existingOrder = await DeliveryOrder.findOne({ orderId });
    if (existingOrder) {
      console.log('⚠️ Delivery order already exists for orderId:', orderId);
      return res.status(200).json({
        success: true,
        message: 'Delivery order already exists',
        data: existingOrder
      });
    }

    // Create new delivery order
    const deliveryOrder = new DeliveryOrder({
      orderId,
      orderNumber,
      restaurant,
      restaurantName,
      restaurantLocation,
      customer,
      customerName,
      customerPhone,
      deliveryAddress,
      orderAmount,
      deliveryFee,
      distance,
      estimatedDeliveryTime,
      status: 'ready_for_pickup',
      deliveryBoy: null,
      deliveryOTP: deliveryOTP || null // Store the OTP for verification
    });

    await deliveryOrder.save();
    console.log('✅ Delivery order created:', deliveryOrder._id);

    // Get Socket.IO instance and emit to all delivery boys
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        orderId: deliveryOrder._id,
        orderNumber: deliveryOrder.orderNumber,
        restaurantName: deliveryOrder.restaurantName,
        deliveryAddress: deliveryOrder.deliveryAddress,
        orderAmount: deliveryOrder.orderAmount,
        deliveryFee: deliveryOrder.deliveryFee,
        distance: deliveryOrder.distance
      };

      io.emit('new:order', notificationData);
      console.log('📡 Emitted new:order event to all delivery boys:', notificationData);
    } else {
      console.warn('⚠️ Socket.IO instance not available');
    }

    res.status(201).json({
      success: true,
      message: 'Delivery order created and notification sent',
      data: deliveryOrder
    });
  } catch (error) {
    console.error('❌ Create delivery order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery order',
      error: error.message
    });
  }
};

// @desc    Get available orders (ready for pickup)
// @route   GET /api/delivery/orders/available
// @access  Private
export const getAvailableOrders = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (!deliveryBoy.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'You are not available for orders'
      });
    }

    // Get orders that are ready for pickup and not assigned
    const availableOrders = await DeliveryOrder.find({
      status: 'ready_for_pickup',
      deliveryBoy: null
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: availableOrders,
      count: availableOrders.length
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available orders'
    });
  }
};

// @desc    Accept order
// @route   POST /api/delivery/orders/:orderId/accept
// @access  Private
export const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deliveryBoyId = req.deliveryBoy._id;

    // Check if delivery boy already has an active order
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (deliveryBoy.currentOrder) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active order'
      });
    }

    // Find and update the order
    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!isValidTransition(order.status, 'accepted')) {
      return res.status(400).json({
        success: false,
        message: 'Order is not available for pickup'
      });
    }

    if (order.deliveryBoy) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another delivery boy'
      });
    }

    // Update order
    order.deliveryBoy = deliveryBoyId;
    order.status = 'accepted';
    order.assignedAt = new Date();
    order.acceptedAt = new Date();
    await order.save();

    // Update delivery boy
    deliveryBoy.currentOrder = orderId;
    deliveryBoy.isAvailable = false;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting order'
    });
  }
};

// @desc    Reject order
// @route   POST /api/delivery/orders/:orderId/reject
// @access  Private
export const rejectOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { reason } = req.body;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Reset order status
    order.status = 'ready_for_pickup';
    order.rejectedAt = new Date();
    order.rejectionReason = reason || 'No reason provided';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order rejected'
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting order'
    });
  }
};

// @desc    Mark order as picked up from restaurant
// @route   POST /api/delivery/orders/:orderId/pickup
// @access  Private
export const pickupOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deliveryBoyId = req.deliveryBoy._id;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryBoy.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to you'
      });
    }

    if (!isValidTransition(order.status, 'picked_up')) {
      return res.status(400).json({
        success: false,
        message: `Cannot pick up order from current status: '${order.status}'. Order must be in 'accepted' status first.`
      });
    }

    if (order.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be picked up at this stage'
      });
    }

    order.status = 'picked_up';
    order.pickedUpAt = new Date();
    await order.save();

    // ✅ NEW: Sync to customer-backend - update status to 'OutForDelivery'
    try {
      const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'https://customer-backend-ibwg.onrender.com';
      await axios.put(
        `${CUSTOMER_BACKEND_URL}/api/orders/${order.orderId}/update-status`,
        { status: 'Out for Delivery' },
        { timeout: 30000 }
      );
      console.log(`✅ Synced 'Out for Delivery' status to customer-backend`);
    } catch (syncError) {
      console.error('⚠️ Failed to sync pickup status to customer-backend:', syncError.message);
      // Don't fail the request if sync fails
    }

    res.status(200).json({
      success: true,
      message: 'Order picked up successfully',
      data: order
    });
  } catch (error) {
    console.error('Pickup order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error picking up order'
    });
  }
};

// @desc    Mark order as in transit (out for delivery)
// @route   POST /api/delivery/orders/:orderId/transit
// @access  Private
export const startTransit = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deliveryBoyId = req.deliveryBoy._id;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryBoy.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to you'
      });
    }

    if (!isValidTransition(order.status, 'in_transit')) {
      return res.status(400).json({
        success: false,
        message: `Cannot move to in_transit from current status: '${order.status}'. Order must be in 'picked_up' status first.`
      });
    }

    order.status = 'in_transit';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order is now in transit',
      data: order
    });
  } catch (error) {
    console.error('Start transit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting transit'
    });
  }
};

// @desc    Complete delivery (delivered to customer)
// @route   POST /api/delivery/orders/:orderId/complete
// @access  Private
export const completeDelivery = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deliveryBoyId = req.deliveryBoy._id;
    const { otp } = req.body;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryBoy.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to you'
      });
    }

    if (!isValidTransition(order.status, 'delivered')) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete delivery from current status: '${order.status}'. Order must be in 'in_transit' status first.`
      });
    }

    // OTP verification is mandatory
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the delivery OTP'
      });
    }

    if (order.deliveryOTP && order.deliveryOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check with the customer.'
      });
    }

    // Calculate delivery time
    const deliveryTime = Math.round((new Date() - new Date(order.acceptedAt)) / 60000); // in minutes

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.actualDeliveryTime = deliveryTime;
    await order.save();

    // ✅ NEW: Sync to customer-backend - update status to 'Delivered'
    try {
      const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'https://customer-backend-ibwg.onrender.com';
      await axios.put(
        `${CUSTOMER_BACKEND_URL}/api/orders/${order.orderId}/update-status`,
        { status: 'Delivered' },
        { timeout: 30000 }
      );
      console.log(`✅ Synced 'Delivered' status to customer-backend for order ${order.orderNumber}`);
    } catch (syncError) {
      console.error('⚠️ Failed to sync delivered status to customer-backend:', syncError.message);
      // Don't fail the request if sync fails
    }

    // Update delivery boy stats
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    deliveryBoy.completedOrders += 1;
    deliveryBoy.totalEarnings += order.deliveryFee;
    deliveryBoy.currentOrder = null;
    deliveryBoy.isAvailable = true;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Order delivered successfully',
      data: {
        order,
        earnings: order.deliveryFee
      }
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing delivery'
    });
  }
};

// @desc    Get current active order
// @route   GET /api/delivery/orders/current
// @access  Private
export const getCurrentOrder = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (!deliveryBoy.currentOrder) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active order'
      });
    }

    const currentOrder = await DeliveryOrder.findById(deliveryBoy.currentOrder);

    res.status(200).json({
      success: true,
      data: currentOrder
    });
  } catch (error) {
    console.error('Get current order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current order'
    });
  }
};

// @desc    Get delivery history
// @route   GET /api/delivery/orders/history
// @access  Private
export const getDeliveryHistory = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      DeliveryOrder.find({
        deliveryBoy: deliveryBoyId,
        status: 'delivered'
      })
        .sort({ deliveredAt: -1 })
        .skip(skip)
        .limit(limit),
      DeliveryOrder.countDocuments({
        deliveryBoy: deliveryBoyId,
        status: 'delivered'
      })
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery history'
    });
  }
};

// @desc    Update delivery boy location
// @route   PUT /api/delivery/orders/location
// @access  Private
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Parse to float first
    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    // Check 1: Must be actual numbers (not NaN or strings)
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    // Check 2: Must be finite (not Infinity or -Infinity)
    if (!isFinite(parsedLat) || !isFinite(parsedLng)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be finite numbers'
      });
    }

    // Check 3: Valid geographical boundaries
    // Latitude must be between -90 and 90
    if (parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90 degrees'
      });
    }

    // Longitude must be between -180 and 180
    if (parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180 degrees'
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    deliveryBoy.currentLocation = {
      type: 'Point',
      coordinates: [parsedLng, parsedLat]
    };
    await deliveryBoy.save();

    // Emit live location to customer via Socket.io
    const io = req.app.get('io');

    if (io && deliveryBoy.currentOrder) {
      const order = await DeliveryOrder.findById(deliveryBoy.currentOrder);
      if (order) {
        // Emit to the specific order room so only that customer receives it
        io.to(`order_${order.orderId}`).emit('delivery_location_update', {
          orderId: order.orderId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date().toISOString(),
          deliveryBoyId: deliveryBoy._id
        });
        console.log(`Location emitted to room: order_${order.orderId}`);
      }
    } else if (!io) {
      console.error('Socket.io instance not found on app');
    }

    res.status(200).json({
      success: true,
      message: 'Location updated and broadcast to customer'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location'
    });
  }
};
