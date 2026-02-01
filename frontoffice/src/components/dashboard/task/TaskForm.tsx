import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    MenuItem,
    Paper,
    Stack,
    TextField,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import type { TaskPriority } from '@hooks/useTasks';

interface TaskFormProps {
    onSubmit: (data: { label: string; priority: TaskPriority; day: string }) => Promise<void>;
    onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps): React.JSX.Element {
    const { t } = useTranslation();
    const [label, setLabel] = React.useState('');
    const [priority, setPriority] = React.useState<TaskPriority>('MIDDLE');
    const [day, setDay] = React.useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!label.trim() || !day) {
            return;
        }
        await onSubmit({
            label: label.trim(),
            priority,
            day,
        });
        setLabel('');
        setPriority('MIDDLE');
        setDay('');
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                backgroundColor: 'grey.50',
                borderRadius: 2,
                borderColor: 'divider',
                p: 2,
            }}
        >
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <TextField
                    required
                    fullWidth
                    size="small"
                    label={t('dashboard.tasksNotes.form.label')}
                    placeholder={t('dashboard.tasksNotes.form.placeholder')}
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                />
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label={t('dashboard.tasksNotes.form.priority')}
                            value={priority}
                            onChange={(event) => setPriority(event.target.value as TaskPriority)}
                        >
                            <MenuItem value="LOW">{t('dashboard.tasksNotes.priority.low')}</MenuItem>
                            <MenuItem value="MIDDLE">{t('dashboard.tasksNotes.priority.middle')}</MenuItem>
                            <MenuItem value="HIGH">{t('dashboard.tasksNotes.priority.high')}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t('dashboard.tasksNotes.form.day')}
                            InputLabelProps={{ shrink: true }}
                            value={day}
                            onChange={(event) => setDay(event.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                            <ResponsiveButton
                                variant="text"
                                color="inherit"
                                size="small"
                                label={t('dashboard.tasksNotes.actions.cancel')}
                                onClick={onCancel}
                            />
                            <ResponsiveButton
                                variant="contained"
                                color="primary"
                                size="small"
                                label="Ajouter"
                                type="submit"
                                disabled={!label.trim() || !day}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </Paper>
    );
}
