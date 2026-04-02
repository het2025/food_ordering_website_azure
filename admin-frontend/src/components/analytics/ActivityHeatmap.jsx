import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { interpolateBlues } from 'd3-scale-chromatic';

export default function ActivityHeatmap({ data }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isXs = useMediaQuery('(max-width:380px)');

    if (!data || data.length === 0) return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabels = isXs ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : isMobile ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : days;

    let maxVal = 0;
    data.forEach(row => {
        days.forEach(day => {
            if (row[day] > maxVal) maxVal = row[day];
        });
    });

    const getColor = (value) => {
        if (value === 0) return 'rgba(255,255,255,0.05)';
        const t = maxVal > 0 ? value / maxVal : 0;
        return interpolateBlues(Math.min(t + 0.1, 1));
    };

    const cellHeight = isXs ? 18 : isMobile ? 22 : 30;
    const labelFontSize = isXs ? '0.5rem' : isMobile ? '0.6rem' : '0.75rem';

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
                Peak Activity (Orders)
            </Typography>
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: `auto repeat(${days.length}, 1fr)`,
                    gap: { xs: 0.25, sm: 0.5 },
                    minWidth: isXs ? 260 : isMobile ? 300 : 400,
                }}>
                    {/* Header row */}
                    <Box />
                    {dayLabels.map((label, i) => (
                        <Typography
                            key={days[i]}
                            variant="caption"
                            align="center"
                            sx={{ fontWeight: 'bold', fontSize: labelFontSize, display: 'block' }}
                        >
                            {label}
                        </Typography>
                    ))}

                    {/* Data rows */}
                    {data.map((row) => (
                        <React.Fragment key={row.hour}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    pr: { xs: 0.5, sm: 1 },
                                    fontSize: labelFontSize,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {isMobile ? row.hour : `${row.hour}:00`}
                            </Typography>
                            {days.map(day => (
                                <Box
                                    key={`${row.hour}-${day}`}
                                    sx={{
                                        bgcolor: getColor(row[day]),
                                        height: cellHeight,
                                        borderRadius: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'default',
                                    }}
                                    title={`${day} ${row.hour}:00 — ${row[day]} orders`}
                                >
                                    {!isMobile && row[day] > 0 && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: '0.6rem',
                                                color: row[day] > maxVal / 2 ? 'white' : 'black',
                                            }}
                                        >
                                            {row[day]}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
