import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useTasks, type TaskPriority, type TaskStatus } from '@hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

type TaskStatusFilter = 'all' | 'open' | 'done';

export function TaskList(): React.JSX.Element {
    const { t } = useTranslation();
    const [filter, setFilter] = React.useState<TaskStatusFilter>('open');
    const [showForm, setShowForm] = React.useState(false);
    const [pendingTaskId, setPendingTaskId] = React.useState<string | null>(null);

    const statusFilter: TaskStatus | undefined = React.useMemo(() => {
        if (filter === 'open') return 'TODO';
        if (filter === 'done') return 'DONE';
        return undefined;
    }, [filter]);

    const taskQuery = React.useMemo(
        () => ({
            page: 1,
            limit: 10,
            status: statusFilter,
        }),
        [statusFilter],
    );

    const { items, loading, create, update, remove } = useTasks(taskQuery);

    const handleFilterChange = (value: TaskStatusFilter) => {
        setFilter(value);
    };

    const handleFormSubmit = async (data: { label: string; priority: TaskPriority; day: string }) => {
        await create({
            label: data.label,
            priority: data.priority,
            status: 'TODO',
            day: data.day,
        });
        setShowForm(false);
    };

    const handleStatusToggle = async (task: { id: string }, checked: boolean) => {
        setPendingTaskId(task.id);
        try {
            await update({ id: task.id, status: checked ? 'DONE' : 'TODO' });
        } finally {
            setPendingTaskId(null);
        }
    };

    const handleDelete = async (task: { id: string }) => {
        setPendingTaskId(task.id);
        try {
            await remove(task.id);
        } finally {
            setPendingTaskId(null);
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                borderColor: 'divider',
                p: { xs: 2, sm: 3 },
                height: '100%',
            }}
        >
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {t('dashboard.tasksNotes.tasks.title')}
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={3}
                        sx={{
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                        }}
                    >
                        <Box
                            component="button"
                            onClick={() => handleFilterChange('all')}
                            sx={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                position: 'relative',
                                pb: 0.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: filter === 'all' ? 'text.primary' : 'text.secondary',
                                    fontWeight: filter === 'all' ? 600 : 400,
                                    '&::after': filter === 'all' ? {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        backgroundColor: 'primary.main',
                                    } : {},
                                }}
                            >
                                {t('dashboard.tasksNotes.filters.all')}
                            </Typography>
                        </Box>
                        <Box
                            component="button"
                            onClick={() => handleFilterChange('open')}
                            sx={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                position: 'relative',
                                pb: 0.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: filter === 'open' ? 'text.primary' : 'text.secondary',
                                    fontWeight: filter === 'open' ? 600 : 400,
                                    '&::after': filter === 'open' ? {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        backgroundColor: 'primary.main',
                                    } : {},
                                }}
                            >
                                {t('dashboard.tasksNotes.filters.open')}
                            </Typography>
                        </Box>
                        <Box
                            component="button"
                            onClick={() => handleFilterChange('done')}
                            sx={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                position: 'relative',
                                pb: 0.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: filter === 'done' ? 'text.primary' : 'text.secondary',
                                    fontWeight: filter === 'done' ? 600 : 400,
                                    '&::after': filter === 'done' ? {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        backgroundColor: 'primary.main',
                                    } : {},
                                }}
                            >
                                {t('dashboard.tasksNotes.filters.done')}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                {!showForm ? (
                    <ResponsiveButton
                        variant="outlined"
                        color="primary"
                        size="small"
                        label={t('dashboard.tasksNotes.actions.newTask')}
                        onClick={() => setShowForm(true)}
                        sx={{ alignSelf: 'flex-start' }}
                    />
                ) : (
                    <TaskForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                <Stack spacing={2}>
                    {items.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isPending={pendingTaskId === task.id}
                            onStatusToggle={handleStatusToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                    {!items.length && !loading && (
                        <Typography variant="body2" color="text.secondary">
                            {t('common.no_content')}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
