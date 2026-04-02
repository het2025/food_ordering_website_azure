import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 18,
}));

function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

export default function StatusDonutChart({ data }) {
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            setChartWidth(entries[0].contentRect.width);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    if (!data || data.length === 0) return null;

    const successCount = data.find(d => d.status === 'Delivered')?.count || 0;
    const cancelledCount = data
        .filter(d => ['Cancelled', 'Rejected'].includes(d.status))
        .reduce((sum, d) => sum + d.count, 0);
    const activeCount = data
        .filter(d => ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(d.status))
        .reduce((sum, d) => sum + d.count, 0);

    const chartData = [
        { label: 'Delivered', value: successCount, color: '#10B981' },
        { label: 'Cancelled/Rejected', value: cancelledCount, color: '#EF4444' },
        { label: 'Active', value: activeCount, color: '#F59E0B' },
    ].filter(d => d.value > 0);

    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    const innerR = isMobile ? 45 : 80;
    const outerR = isMobile ? 75 : 120;
    const chartHeight = isMobile ? 240 : 250;
    const w = chartWidth || 300;

    return (
        <Box sx={{
            width: '100%',
            p: { xs: 1.5, sm: 2 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
        }}>
            <Typography
                variant="h6"
                align="left"
                sx={{ width: '100%', mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}
            >
                Order Status
            </Typography>
            <Box ref={containerRef} sx={{ width: '100%' }}>
                <PieChart
                    series={[{
                        innerRadius: innerR,
                        outerRadius: outerR,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        data: chartData,
                        arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
                    }]}
                    sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontSize: isMobile ? 10 : 12,
                            fontWeight: 'bold',
                        },
                    }}
                    width={w}
                    height={chartHeight}
                    slotProps={{
                        legend: {
                            hidden: false,
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                        },
                    }}
                >
                    <PieCenterLabel>{total} Orders</PieCenterLabel>
                </PieChart>
            </Box>
        </Box>
    );
}
