import axios from 'axios';
import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { Additive } from '../models/Additive.js';  // Stub provided below
import { Extra } from '../models/Extra.js';  // Stub provided below
import { findRestaurantByOwner } from '../models/Restaurant.js';
import { Payout } from '../models/Payout.js'; // ✅ NEW

// Helper: Get restaurant ID for current restaurant owner (fixed field)
const getRestaurantId = async (restaurantOwnerId) => {
  const restaurant = await findRestaurantByOwner(restaurantOwnerId);  // Fixed: { owner }
  return restaurant ? restaurant._id : null;
};

// GET /api/dashboard/stats
export const getRestaurantOwnerDashboardStats = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;

    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) {
      console.log('No restaurant for dashboard – owner:', restaurantOwnerId);
      return res.json({  // Fixed: success: true for graceful handling
        success: true,
        data: null,
        message: 'No restaurant linked. Create your store profile in the Store page first.'
      });
    }

    // Parallel queries
    const [
      ordersCount,
      totalRevenue,
      menuItemsCount,
      categoriesCount,
      additivesCount,
      extrasCount,
      popularItem,
      pendingOrders,
      completedOrders,
      avgDeliveryTime
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ restaurant: restaurantId }),  // Fixed: restaurant ref

      // Total revenue (completed/delivered)
      Order.aggregate([
        { $match: { restaurant: restaurantId, status: { $regex: /^delivered$/i } } },  // Enum: lowercase? Adjust if 'Delivered'
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(results => results[0]?.total || 0),

      // Menu items
      MenuItem.countDocuments({ restaurant: restaurantId }),  // Fixed: restaurant ref

      // Categories
      MenuCategory.countDocuments({ restaurant: restaurantId }),

      // Additives
      Additive.countDocuments({ restaurant: restaurantId }),

      // Extras
      Extra.countDocuments({ restaurant: restaurantId }),

      // Popular item (fixed aggregate: collection, field)
      Order.aggregate([
        { $match: { restaurant: restaurantId } },
        { $unwind: '$items' },
        { $group: { _id: '$items.menuItemId', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },  // Fixed collection
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$item.name', orders: '$count' } }
      ]).then(results => results[0] || { name: 'None', orders: 0 }),

      // Pending
      Order.countDocuments({ restaurant: restaurantId, status: { $in: ['pending', 'preparing'] } }),

      // Completed
      Order.countDocuments({ restaurant: restaurantId, status: { $regex: /^delivered$/i } }),

      // Avg delivery (ms to min)
      Order.aggregate([
        { $match: { restaurant: restaurantId, status: { $regex: /^delivered$/i } } },
        { $group: { _id: null, avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } } } }
      ]).then(results => {
        const avgMs = results[0]?.avgTime || 0;
        return Math.round(avgMs / (1000 * 60)) || 0;
      })
    ]);

    const stats = {
      orders: {
        total: ordersCount,
        pending: pendingOrders,
        completed: completedOrders,
        revenue: totalRevenue
      },
      menu: {
        items: menuItemsCount,
        categories: categoriesCount,
        additives: additivesCount,
        extras: extrasCount,
        popularItem: popularItem.name !== 'None' ? `${popularItem.name} (${popularItem.orders} orders)` : 'None'
      },
      operations: {
        avgDeliveryTime: `${avgDeliveryTime} minutes`
      }
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats loaded successfully'
    });
  } catch (error) {
    console.error('getRestaurantOwnerDashboardStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats'
    });
  }
};

// ✅ GET /api/dashboard/payouts-stats
export const getPayoutStats = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    console.log('🔍 Calculating payouts for restaurantId:', restaurantId);

    // Calculate Total Revenue strictly from DELIVERED orders
    const result = await Order.aggregate([
      {
        $match: {
          restaurant: restaurantId,
          status: { $regex: /^delivered$/i }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalDishPrice: { $sum: { $ifNull: ['$subtotal', 0] } },
          totalTaxes: { $sum: { $ifNull: ['$taxes', 0] } },
          totalRevenue: { $sum: { $add: [{ $ifNull: ['$subtotal', 0] }, { $ifNull: ['$taxes', 0] }] } }
        }
      }
    ]);

    console.log('📊 Order aggregation result:', JSON.stringify(result));

    const stats = result[0] || { totalOrders: 0, totalDishPrice: 0, totalTaxes: 0, totalRevenue: 0 };

    console.log('💰 Stats calculated:', stats);

    // Calculate total already paid out (including breakdown)
    const payoutResult = await Payout.aggregate([
      { $match: { restaurantId: restaurantId, status: 'Completed' } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          paidOrders: { $sum: { $ifNull: ['$orderCount', 0] } },
          paidDishPrice: { $sum: { $ifNull: ['$breakdown.dishPrice', 0] } },
          paidTaxes: { $sum: { $ifNull: ['$breakdown.taxes', 0] } }
        }
      }
    ]);

    const totalPaid = payoutResult[0]?.totalPaid || 0;
    const paidOrders = payoutResult[0]?.paidOrders || 0;
    const paidDishPrice = payoutResult[0]?.paidDishPrice || 0;
    const paidTaxes = payoutResult[0]?.paidTaxes || 0;

    console.log('💵 Total already paid:', totalPaid);

    // Pending payout = Total revenue - Total paid
    const pendingPayout = stats.totalRevenue - totalPaid;
    const pendingOrdersCount = stats.totalOrders - paidOrders;
    const pendingDishPrice = stats.totalDishPrice - paidDishPrice;
    const pendingTaxes = stats.totalTaxes - paidTaxes;

    console.log('✅ Pending payout:', pendingPayout);

    res.json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue,
        totalPaid: totalPaid,
        orderCount: Math.max(0, pendingOrdersCount),
        pendingPayout: Math.max(0, pendingPayout), // Ensure non-negative
        breakdown: {
          dishPrice: Math.max(0, pendingDishPrice),
          taxes: Math.max(0, pendingTaxes)
        }
      }
    });

  } catch (error) {
    console.error('getPayoutStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payout stats' });
  }
};

// ✅ POST /api/dashboard/collect-payout
export const collectPayout = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { amount, breakdown } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    // Create payout record
    const payout = new Payout({
      restaurantId: restaurantId,
      amount: amount,
      breakdown: breakdown || {},
      status: 'Completed',
      transactionDate: new Date()
    });

    await payout.save();

    res.status(201).json({
      success: true,
      message: 'Payout collected successfully',
      data: payout
    });

  } catch (error) {
    console.error('collectPayout error:', error);
    res.status(500).json({ success: false, message: 'Failed to collect payout' });
  }
};

// ✅ GET /api/dashboard/payout-history
export const getPayoutHistory = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const payouts = await Payout.find({ restaurantId: restaurantId })
      .sort({ transactionDate: -1 })
      .limit(50); // Limit to recent 50 payouts

    res.json({
      success: true,
      data: payouts
    });

  } catch (error) {
    console.error('getPayoutHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payout history' });
  }
};

// ✅ GET /api/dashboard/menu-performance
// Returns top and bottom performing menu items by order count
export const getMenuPerformance = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Aggregate order items to find most/least ordered
    const itemPerformance = await Order.aggregate([
      { $match: { restaurant: restaurantId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          orderCount: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { orderCount: -1 } }
    ]);

    // Get top 5 and bottom 5
    const topItems = itemPerformance.slice(0, 5).map(item => ({
      name: item._id || 'Unknown',
      orderCount: item.orderCount,
      revenue: Math.round(item.revenue || 0)
    }));

    const bottomItems = itemPerformance.slice(-5).reverse().map(item => ({
      name: item._id || 'Unknown',
      orderCount: item.orderCount,
      revenue: Math.round(item.revenue || 0)
    }));

    res.json({
      success: true,
      data: {
        topItems,
        bottomItems,
        totalItems: itemPerformance.length
      }
    });

  } catch (error) {
    console.error('getMenuPerformance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu performance' });
  }
};

// ✅ GET /api/dashboard/revenue-by-category
// Returns revenue breakdown by menu category
export const getRevenueByCategory = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Get all menu items with their categories
    const menuItems = await MenuItem.find({ restaurant: restaurantId })
      .populate('category', 'name');

    // Create a map of item names to categories
    const itemCategoryMap = {};
    menuItems.forEach(item => {
      itemCategoryMap[item.name] = item.category?.name || 'Uncategorized';
    });

    // Aggregate revenue from orders
    const orderItems = await Order.aggregate([
      { $match: { restaurant: restaurantId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Group by category
    const categoryRevenue = {};
    orderItems.forEach(item => {
      const category = itemCategoryMap[item._id] || 'Uncategorized';
      if (!categoryRevenue[category]) {
        categoryRevenue[category] = { revenue: 0, orders: 0 };
      }
      categoryRevenue[category].revenue += item.revenue;
      categoryRevenue[category].orders += item.quantity;
    });

    // Convert to array and sort by revenue
    const data = Object.entries(categoryRevenue)
      .map(([name, stats]) => ({
        category: name,
        revenue: Math.round(stats.revenue),
        orders: stats.orders
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, data });

  } catch (error) {
    console.error('getRevenueByCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue by category' });
  }
};

// ✅ GET /api/dashboard/order-frequency
// Returns order counts by day and hour
export const getOrderFrequency = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Orders by day of week
    const ordersByDay = await Order.aggregate([
      { $match: { restaurant: restaurantId } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = dayNames.map((name, index) => {
      const found = ordersByDay.find(d => d._id === index + 1);
      return {
        day: name,
        orders: found?.count || 0,
        revenue: Math.round(found?.revenue || 0)
      };
    });

    // Orders by hour
    const ordersByHour = await Order.aggregate([
      { $match: { restaurant: restaurantId } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const found = ordersByHour.find(h => h._id === i);
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        orders: found?.count || 0
      };
    });

    // Recent 7 days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrend = await Order.aggregate([
      { $match: { restaurant: restaurantId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        daily: dailyData,
        hourly: hourlyData,
        recentTrend: recentTrend.map(d => ({
          date: d._id,
          orders: d.count,
          revenue: Math.round(d.revenue || 0)
        }))
      }
    });

  } catch (error) {
    console.error('getOrderFrequency error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order frequency' });
  }
};

// ✅ GET /api/dashboard/customer-feedback
// Returns order ratings and reviews analysis
export const getCustomerFeedback = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    try {
      const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${CUSTOMER_BACKEND_URL}/api/reviews/restaurant/${restaurantId}`);
      const reviewsData = response.data;
      const allReviews = reviewsData.reviews || [];
      
      const distribution = [5, 4, 3, 2, 1].map(rating => {
        return {
          rating,
          count: allReviews.filter(r => Math.round(r.rating) === rating).length
        };
      });

      res.json({
        success: true,
        data: {
          averageRating: reviewsData.averageRating?.toFixed(1) || '0.0',
          totalReviews: reviewsData.totalReviews || 0,
          distribution,
          recentReviews: allReviews.map(r => ({
            orderNumber: r.order || 'N/A',
            rating: r.rating,
            review: r.comment,
            date: r.createdAt
          }))
        }
      });
    } catch (apiError) {
      console.warn('Customer backend API error (fetching reviews):', apiError.message);
      res.json({
        success: true,
        data: {
          averageRating: '0.0',
          totalReviews: 0,
          distribution: [5, 4, 3, 2, 1].map(r => ({rating: r, count: 0})),
          recentReviews: []
        }
      });
    }

  } catch (error) {
    console.error('getCustomerFeedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer feedback' });
  }
};

// Restart trigger
