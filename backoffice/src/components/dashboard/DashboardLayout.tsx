import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isFullHd = useMediaQuery(theme.breakpoints.up('xl'));

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* General information */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr'
                        : isFullHd
                            ? 'repeat(5, 1fr)'
                            : 'repeat(4, 1fr)',
                    gridAutoRows: 'minmax(180px, auto)',
                    gap: 3,
                    gridAutoFlow: 'dense', // This enables the masonry-like packing
                }}
            >
                {children}
            </Box>
        </Container>
    );
};
