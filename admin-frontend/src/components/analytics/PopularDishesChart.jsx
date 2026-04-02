import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#FF6B35', '#F7931E', '#FFAF61', '#FFD5A5', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const PopularDishesChart = ({ data = [] }) => {
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
    const yAxisWidth = isXs ? 55 : isMobile ? 65 : 70;
    const maxLabelLen = isXs ? 8 : isMobile ? 10 : 12;
    const chartHeight = isMobile ? 240 : 300;

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
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: isMobile ? 10 : 30, left: leftMargin, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        type="number"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={yAxisWidth}
                        tickFormatter={(value) =>
                            value.length > maxLabelLen ? `${value.slice(0, maxLabelLen)}…` : value
                        }
                    />
                    <Tooltip
                        formatter={(value, name) => [
                            name === 'orderCount' ? `${value} orders` : `₹${value}`,
                            name === 'orderCount' ? 'Orders' : 'Revenue',
                        ]}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                    <Bar dataKey="orderCount" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default PopularDishesChart;
