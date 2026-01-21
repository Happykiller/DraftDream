// src/components/common/LibraryCard.tsx
import * as React from 'react';
import { Add, DeleteOutline, Public } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Box, IconButton, Paper, Stack, Tooltip } from '@mui/material';

export type LibraryCardProps = {
    // Actions
    onAdd: (...args: any[]) => void;
    addTooltip: string;
    addDisabled?: boolean;
    addAriaLabel: string;

    // Public/Delete
    isPublic: boolean;
    publicTooltip?: string;
    deleteTooltip?: string;
    onDelete?: (...args: any[]) => void;
    deleteDisabled?: boolean;

    // Styling
    hoverColor?: 'primary' | 'success' | 'warning';

    // Content
    children: React.ReactNode;
};

export const LibraryCard = React.memo(function LibraryCard({
    onAdd,
    addTooltip,
    addDisabled = false,
    addAriaLabel,
    isPublic,
    publicTooltip,
    deleteTooltip,
    onDelete,
    deleteDisabled = false,
    hoverColor = 'warning',
    children,
}: LibraryCardProps): React.JSX.Element {
    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                cursor: 'default',
                transition: (theme) => theme.transitions.create(['background-color', 'border-color'], {
                    duration: theme.transitions.duration.shortest,
                }),
                width: '100%',
                maxWidth: '100%',
                '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette[hoverColor].main, 0.08),
                    borderColor: (theme) => alpha(theme.palette[hoverColor].main, 0.24),
                },
            }}
        >
            <Stack direction="row" spacing={0} sx={{ width: '100%' }}>
                {/* Left column: Content */}
                <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0, p: 1.5 }}>
                    {children}
                </Stack>

                {/* Right column: Actions */}
                <Stack
                    spacing={0}
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        width: 40,
                        flexShrink: 0,
                        py: 1,
                        px: 0.5,
                    }}
                >
                    {/* Add button at top */}
                    <Tooltip title={addTooltip} arrow placement="left">
                        <span style={{ display: 'inline-flex' }}>
                            <IconButton
                                size="small"
                                onClick={onAdd}
                                disabled={addDisabled}
                                aria-label={addAriaLabel}
                            >
                                <Add fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {/* Public icon or Delete button at bottom */}
                    {isPublic ? (
                        <Tooltip title={publicTooltip ?? 'Public'} arrow placement="left">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: (theme) => theme.palette.text.disabled,
                                }}
                            >
                                <Public fontSize="small" aria-hidden />
                            </Box>
                        </Tooltip>
                    ) : onDelete ? (
                        <Tooltip title={deleteTooltip ?? ''} arrow placement="left">
                            <span style={{ display: 'inline-flex' }}>
                                <IconButton size="small" onClick={onDelete} disabled={deleteDisabled}>
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : null}
                </Stack>
            </Stack>
        </Paper>
    );
});
