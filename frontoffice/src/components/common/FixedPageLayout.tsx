import * as React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { TextWithTooltip } from './TextWithTooltip';

export interface FixedPageLayoutProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    headerProps?: {
        backgroundColor?: string;
        iconBackgroundColor?: string;
        iconColor?: string;
        iconBoxShadow?: string;
    };
    headerRight?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

export function FixedPageLayout({
    title,
    subtitle,
    icon,
    headerProps,
    headerRight,
    footer,
    children,
}: FixedPageLayoutProps): React.JSX.Element {
    const theme = useTheme();
    const headerBackground = headerProps?.backgroundColor ?? alpha(theme.palette.primary.main, 0.1);
    const iconBackground = headerProps?.iconBackgroundColor ?? 'primary.main';
    const iconColor = headerProps?.iconColor ?? 'primary.contrastText';
    const iconShadow = headerProps?.iconBoxShadow ?? '0 10px 20px rgba(25, 118, 210, 0.24)';

    return (
        <Stack
            sx={{
                minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
                maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
                height: '100%',
                flex: 1,
                overflow: 'hidden',
                bgcolor: theme.palette.backgroundColor,
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    px: { xs: 2, md: 3 },
                    py: { xs: 2, md: 3 },
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        bgcolor: theme.palette.backgroundColor,
                    }}
                >
                    {/* Header */}
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{
                            backgroundColor: headerBackground,
                            px: { xs: 2, sm: 3, md: 4 },
                            py: { xs: 2, sm: 2.5 },
                        }}
                    >
                        {icon && (
                            <Box
                                aria-hidden
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: iconBackground,
                                    color: iconColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: iconShadow,
                                }}
                            >
                                {icon}
                            </Box>
                        )}
                        <Box
                            sx={{
                                flexGrow: 1,
                                minWidth: 0,
                                maxWidth: { xs: '100%', sm: '50%' },
                                flexBasis: { xs: '100%', sm: '50%' },
                            }}
                        >
                            <TextWithTooltip
                                tooltipTitle={title}
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                }}
                            />
                            {subtitle && (
                                <TextWithTooltip
                                    tooltipTitle={subtitle}
                                    variant="body2"
                                    color="text.secondary"
                                />
                            )}
                        </Box>
                        {headerRight ? (
                            <Box sx={{ flexShrink: 0 }}>
                                {headerRight}
                            </Box>
                        ) : null}
                    </Stack>

                    <Divider />

                    {/* Content */}
                    <CardContent
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            p: 0,
                            overflow: 'auto',
                        }}
                    >
                        {children}
                    </CardContent>

                    {/* Fixed Footer */}
                    {footer && (
                        <>
                            <Divider />
                            <Box
                                component="footer"
                                sx={{
                                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                    px: { xs: 2, sm: 3, md: 4 },
                                    py: { xs: 2, sm: 2.5 },
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={2}>
                                    {footer}
                                </Stack>
                            </Box>
                        </>
                    )}
                </Card>
            </Box>
        </Stack>
    );
}
