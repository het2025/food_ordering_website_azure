import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';

const COLORS = ['#FF6B35', '#F7931E', '#FFAF61', '#FFD5A5', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function PopularDishesChart({ data = [] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isXs = useMediaQuery('(max-width:380px)');

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                    🍕 Popular Dishes
                </Typography>
                <Typography color="text.secondary">No data available</Typography>
            </Paper>
        );
    }

    const leftMargin = isXs ? 60 : isMobile ? 70 : 80;
    const maxLabelLen = isXs ? 8 : isMobile ? 10 : 12;
    const chartHeight = isMobile ? 240 : 300;

    const names = data.map(d =>
        d.name.length > maxLabelLen ? `${d.name.slice(0, maxLabelLen)}…` : d.name
    );
    const orderCounts = data.map(d => d.orderCount);

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%', borderRadius: 3 }}>
            <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
            >
                🍕 Popular Dishes
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
                Top selling items by order count
            </Typography>
            <Box sx={{ width: '100%', height: chartHeight }}>
                <BarChart
                    layout="horizontal"
                    series={[{
                        data: orderCounts,
                        color: COLORS[0],
                        valueFormatter: (value) => `${value} orders`,
                        label: 'Orders'
                    }]}
                    yAxis={[{
                        scaleType: 'band',
                        data: names,
                        tickLabelStyle: { fontSize: isMobile ? 10 : 12 },
                    }]}
                    xAxis={[{
                        tickLabelStyle: { fontSize: isMobile ? 10 : 12 },
                    }]}
                    margin={{ left: leftMargin, right: isMobile ? 10 : 30, top: 5, bottom: 25 }}
                    height={chartHeight}
                    borderRadius={4}
                    slotProps={{ legend: { hidden: true } }}
                />
            </Box>
        </Paper>
    );
}
