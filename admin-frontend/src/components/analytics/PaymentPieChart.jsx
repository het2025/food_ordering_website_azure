import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useDrawingArea } from '@mui/x-charts/hooks';
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

export default function PaymentPieChart({ data }) {
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

    const formattedData = data.map((item, index) => ({
        id: index,
        value: item.count,
        label: item.method,
        color: item.method === 'online' ? '#3B82F6' : '#F59E0B',
    }));

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const innerR = isMobile ? 45 : 80;
    const outerR = isMobile ? 75 : 120;
    const chartHeight = isMobile ? 260 : 350;
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
                Payment Methods
            </Typography>
            <Box ref={containerRef} sx={{ width: '100%' }}>
                <PieChart
                    series={[{
                        innerRadius: innerR,
                        outerRadius: outerR,
                        paddingAngle: 5,
                        cornerRadius: 5,
                        data: formattedData,
                        arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
                    }]}
                    sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                            fill: 'white',
                            fontSize: isMobile ? 11 : 14,
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
                    <PieCenterLabel>Total: {total}</PieCenterLabel>
                </PieChart>
            </Box>
        </Box>
    );
}
