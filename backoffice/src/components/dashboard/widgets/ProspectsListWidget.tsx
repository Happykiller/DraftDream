import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
} from '@mui/material';
import type { Prospect } from '@hooks/useProspects';

import { StatCard } from './StatCard';
import type { StatCardProps } from './StatCard';

interface ProspectsListWidgetProps extends StatCardProps {
    prospects: Prospect[];
}

export const ProspectsListWidget: React.FC<ProspectsListWidgetProps> = ({ prospects, children, ...statCardProps }) => {
    return (
        <StatCard {...statCardProps}>
          {/* General information */}
            <List disablePadding>
                {prospects.map((prospect, index) => (
                    <ListItem
                        key={prospect.id}
                        divider={index !== prospects.length - 1}
                        sx={{ px: 0 }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {prospect.firstName} {prospect.lastName}
                                </Typography>
                            }
                            secondary={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
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
            {children}
        </StatCard>
    )
};
