import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';

export default function KPICard({ title, value, data, color, type = 'line' }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const isMonthlyData = data && data.length > 0 && data[0].hasOwnProperty('month');
    const barHeight = isMobile ? 220 : 300;
    const leftMargin = isMobile ? 32 : 50;

    return (
        <Box sx={{
            p: { xs: 1.5, sm: 2 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            height: '100%',
            minHeight: isMonthlyData ? (isMobile ? 300 : 400) : 150,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
                {title}
            </Typography>
            <Typography
                component="div"
                sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </Typography>

            <Box sx={{ flexGrow: 1, width: '100%' }}>
                {isMonthlyData ? (
                    <BarChart
                        dataset={data}
                        yAxis={[{
                            scaleType: 'band',
                            dataKey: 'month',
                            tickLabelStyle: { fontSize: isMobile ? 10 : 12 },
                        }]}
                        series={[{
                            dataKey: 'value',
                            label: 'Monthly Change',
                            color: color,
                            valueFormatter: (v) => v ? v.toLocaleString() : '0',
                        }]}
                        layout="horizontal"
                        height={barHeight}
                        margin={{ left: leftMargin, right: isMobile ? 8 : 20, top: 8, bottom: 8 }}
                        slotProps={{ legend: { hidden: true } }}
                    />
                ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">No monthly data</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
