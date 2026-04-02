import express from 'express'
import {
    getRestaurantOwnerDashboardStats,
    getPayoutStats,
    collectPayout,
    getPayoutHistory,
    getMenuPerformance,
    getRevenueByCategory,
    getOrderFrequency,
    getCustomerFeedback
} from '../controllers/restaurantOwnerDashboardController.js'
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js'

const router = express.Router()

router.use(authRestaurantOwner)

router.get('/stats', getRestaurantOwnerDashboardStats)
router.get('/payouts-stats', getPayoutStats)
router.post('/collect-payout', collectPayout)
router.get('/payout-history', getPayoutHistory)
router.get('/menu-performance', getMenuPerformance)
router.get('/revenue-by-category', getRevenueByCategory)
router.get('/order-frequency', getOrderFrequency)
router.get('/customer-feedback', getCustomerFeedback)

export default router
