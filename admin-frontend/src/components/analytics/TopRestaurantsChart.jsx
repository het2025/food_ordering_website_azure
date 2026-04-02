import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function TopRestaurantsChart({ data }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isXs = useMediaQuery('(max-width:380px)');

    if (!data || data.length === 0) return null;

    // Limit to 5 on mobile to keep chart readable
    const limit = isMobile ? 5 : 10;
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, limit);

    const names = sortedData.map(d =>
        isMobile && d.name.length > 14 ? `${d.name.slice(0, 14)}…` : d.name
    );
    const revenues = sortedData.map(d => d.revenue);

    const leftMargin = isXs ? 70 : isMobile ? 90 : 120;
    const chartHeight = isMobile ? 260 : 390;
    const labelFontSize = isXs ? 9 : isMobile ? 10 : 12;

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
                Top Restaurants by Revenue
            </Typography>
            <BarChart
                layout="horizontal"
                series={[{
                    data: revenues,
                    label: 'Revenue (₹)',
                    color: '#3B82F6',
                    valueFormatter: (value) => `₹${value.toLocaleString()}`,
                }]}
                yAxis={[{
                    scaleType: 'band',
                    data: names,
                    tickLabelStyle: { fontSize: labelFontSize },
                }]}
                xAxis={[{
                    tickLabelStyle: { fontSize: isMobile ? 9 : 11 },
                    valueFormatter: (v) => isMobile ? `₹${(v / 1000).toFixed(0)}k` : `₹${v.toLocaleString()}`,
                }]}
                margin={{ left: leftMargin, right: isMobile ? 8 : 16, top: 8, bottom: isMobile ? 30 : 36 }}
                height={chartHeight}
                borderRadius={4}
                slotProps={{ legend: { hidden: isMobile } }}
            />
        </Box>
    );
}
