import * as React from 'react';
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function RevenueAreaChart({ data }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!data || data.length === 0) return null;

    // On mobile show every other data point if dataset is large to avoid crowded x-axis
    const displayData = isMobile && data.length > 6
        ? data.filter((_, i) => i % 2 === 0 || i === data.length - 1)
        : data;

    const dates = displayData.map(d => d.date);
    const revenue = displayData.map(d => d.revenue);
    const chartHeight = isMobile ? 210 : 300;

    return (
        <Box sx={{
            width: '100%',
            p: { xs: 1.5, sm: 2 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxSizing: 'border-box',
        }}>
            <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}
            >
                Revenue Trend
            </Typography>
            <Box sx={{ width: '100%', height: chartHeight + (isMobile ? 40 : 20) }}>
                <LineChart
                    series={[{
                        data: revenue,
                        label: 'Revenue (₹)',
                        area: true,
                        showMark: false,
                        color: '#10B981',
                    }]}
                    xAxis={[{
                        scaleType: 'point',
                        data: dates,
                        tickLabelStyle: {
                            angle: isMobile ? -45 : 0,
                            textAnchor: isMobile ? 'end' : 'middle',
                            fontSize: isMobile ? 9 : 12,
                        },
                    }]}
                    height={chartHeight}
                    margin={{
                        left: isMobile ? 45 : 60,
                        right: isMobile ? 8 : 20,
                        top: 10,
                        bottom: isMobile ? 50 : 30,
                    }}
                    sx={{
                        [`& .${lineElementClasses.root}`]: {
                            strokeWidth: 2,
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
