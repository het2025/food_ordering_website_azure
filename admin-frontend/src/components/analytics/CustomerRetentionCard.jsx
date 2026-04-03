import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';

export default function CustomerRetentionCard({ data }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!data) {
        return (
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%', borderRadius: 3 }}>
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                >
                    👥 Customer Retention
                </Typography>
                <Typography color="text.secondary">No data available</Typography>
            </Paper>
        );
    }

    const chartData = [
        { id: 0, label: 'New Customers', value: data.newCustomers, color: '#3B82F6' },
        { id: 1, label: 'Returning', value: data.returningCustomers, color: '#10B981' },
    ];

    const pieHeight = isMobile ? 150 : 180;
    const innerR = isMobile ? 40 : 50;
    const outerR = isMobile ? 62 : 75;

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%', borderRadius: 3 }}>
            <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
            >
                👥 Customer Retention
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
                New vs returning customers
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <PieChart
                    series={[
                        {
                            data: chartData,
                            innerRadius: innerR,
                            outerRadius: outerR,
                            paddingAngle: 5,
                            cornerRadius: 5,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
                        }
                    ]}
                    height={pieHeight}
                    slotProps={{ legend: { hidden: true } }}
                    margin={{ right: 5, left: 5, top: 5, bottom: 5 }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        fontWeight="bold"
                        color="#3B82F6"
                        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                        {data.newRate}%
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                        New ({data.newCustomers})
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        fontWeight="bold"
                        color="#10B981"
                        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                        {data.retentionRate}%
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                        Returning ({data.returningCustomers})
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                    Total Unique Customers
                </Typography>
                <Typography
                    fontWeight="bold"
                    color="primary"
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                >
                    {data.totalCustomers?.toLocaleString()}
                </Typography>
            </Box>
        </Paper>
    );
}