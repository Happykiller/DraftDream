import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Chip,
    useTheme,
    Box,
    IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Prospect } from '@hooks/useProspects';
import { ProspectStatus } from '@src/commons/prospects/status';

interface ProspectsListWidgetProps {
    prospects: Prospect[];
}

const getStatusColor = (status?: ProspectStatus | null): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (!status) return 'default';
    switch (status) {
        case 'LEAD': return 'info';
        case 'CONTACTED': return 'warning';
        case 'TODO': return 'info';
        case 'MEETING_SCHEDULED': return 'secondary';
        case 'WON': return 'success';
        case 'LOST': return 'error';
        default: return 'default';
    }
};

export const ProspectsListWidget: React.FC<ProspectsListWidgetProps> = ({ prospects }) => {
    const theme = useTheme();

    return (
        <List disablePadding>
            {prospects.map((prospect, index) => (
                <ListItem
                    key={prospect.id}
                    divider={index !== prospects.length - 1}
                    secondaryAction={
                        <IconButton edge="end" aria-label="options" size="small">
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    }
                    sx={{ px: 0 }}
                >
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                            {prospect.firstName[0]}{prospect.lastName[0]}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle2" fontWeight="bold">
                                {prospect.firstName} {prospect.lastName}
                            </Typography>
                        }
                        secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={prospect.status || 'Unknown'}
                                    size="small"
                                    color={getStatusColor(prospect.status)}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(prospect.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        }
                    />
                </ListItem>
            ))}
            {prospects.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No prospects to display properly.
                    </Typography>
                </Box>
            )}
        </List>
    );
};
