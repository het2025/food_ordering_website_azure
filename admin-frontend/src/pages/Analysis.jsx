import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/adminApi';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Components
import KPICard from '../components/analytics/KPICard';
import RevenueAreaChart from '../components/analytics/RevenueAreaChart';
import PaymentPieChart from '../components/analytics/PaymentPieChart';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import StatusDonutChart from '../components/analytics/StatusDonutChart';
import TopRestaurantsChart from '../components/analytics/TopRestaurantsChart';
import CustomerRetentionCard from '../components/analytics/CustomerRetentionCard';

const Analysis = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        overview: null,
        orderStatus: [],
        ordersTrend: [],
        paymentSplit: [],
        peakHours: [],
        topRestaurants: [],
        customerRetention: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overview, orderStatus, ordersTrend, paymentSplit, peakHours, topRestaurants, customerRetention] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getOrderStatus(),
                analyticsAPI.getOrdersTrend(12),
                analyticsAPI.getPaymentSplit(),
                analyticsAPI.getPeakHours(),
                analyticsAPI.getTopRestaurants(10),
                analyticsAPI.getCustomerRetention()
            ]);

            setData({
                overview: overview.data.data ? JSON.parse(JSON.stringify(overview.data.data)) : null,
                orderStatus: orderStatus.data.data ? JSON.parse(JSON.stringify(orderStatus.data.data)) : [],
                ordersTrend: ordersTrend.data.data ? JSON.parse(JSON.stringify(ordersTrend.data.data)) : [],
                paymentSplit: paymentSplit.data.data ? JSON.parse(JSON.stringify(paymentSplit.data.data)) : [],
                peakHours: peakHours.data.data ? JSON.parse(JSON.stringify(peakHours.data.data)) : [],
                topRestaurants: topRestaurants.data.data ? JSON.parse(JSON.stringify(topRestaurants.data.data)) : [],
                customerRetention: customerRetention.data.data ? JSON.parse(JSON.stringify(customerRetention.data.data)) : null
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const { overview, orderStatus, ordersTrend, paymentSplit, peakHours, topRestaurants, customerRetention } = data;

    return (
        <Box sx={{ pb: { xs: 2, sm: 3 } }}>
            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 2, sm: 3, md: 4 },
                    fontWeight: 'bold',
                    color: '#1F2937',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                }}
            >
                Analytics Dashboard
            </Typography>

            {/* Row 1: Key Metrics (4 cols) */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Total Revenue"
                        value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`}
                        color="#10B981"
                        data={overview?.monthlyStats?.revenue}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Total Orders"
                        value={overview?.totalOrders?.toLocaleString()}
                        color="#3B82F6"
                        data={overview?.monthlyStats?.orders}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Active Users"
                        value={overview?.totalUsers?.toLocaleString()}
                        color="#8B5CF6"
                        data={overview?.monthlyStats?.users}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Active Restaurants"
                        value={overview?.totalRestaurants?.toLocaleString()}
                        color="#F59E0B"
                        data={overview?.monthlyStats?.restaurants}
                    />
                </Grid>
            </Grid>

            {/* Row 2: Trends & Status */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid item xs={12} lg={8}>
                    <RevenueAreaChart data={ordersTrend} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <StatusDonutChart data={orderStatus} />
                </Grid>
            </Grid>
            
            {/* Row 3: Heatmap & Payment Split */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid item xs={12} lg={8}>
                    <ActivityHeatmap data={peakHours} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <PaymentPieChart data={paymentSplit} />
                </Grid>
            </Grid>

            {/* Row 4: Top Restaurants & Customer Retention */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} lg={6}>
                    <TopRestaurantsChart data={topRestaurants} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <CustomerRetentionCard data={customerRetention} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analysis;
