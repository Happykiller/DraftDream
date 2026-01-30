import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import {
    Checkbox,
    Chip,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';

import { TextWithTooltip } from '@components/common/TextWithTooltip';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Task, TaskPriority } from '@hooks/useTasks';

interface TaskCardProps {
    task: Task;
    isPending: boolean;
    onStatusToggle: (task: Task, checked: boolean) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
}

function isOverdue(task: Task, isCompleted: boolean): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.day);
    if (Number.isNaN(dueDate.getTime())) {
        return false;
    }
    return !isCompleted && dueDate.getTime() < today.getTime();
}

function priorityLabel(priority: TaskPriority, t: (key: string) => string): string {
    if (priority === 'HIGH') return t('dashboard.tasksNotes.priority.high');
    if (priority === 'MIDDLE') return t('dashboard.tasksNotes.priority.middle');
    return t('dashboard.tasksNotes.priority.low');
}

function priorityColor(priority: TaskPriority): 'error' | 'warning' | 'success' {
    if (priority === 'HIGH') return 'error';
    if (priority === 'MIDDLE') return 'warning';
    return 'success';
}

export function TaskCard({ task, isPending, onStatusToggle, onDelete }: TaskCardProps): React.JSX.Element {
    const { t } = useTranslation();
    const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });

    const isCompleted = task.status === 'DONE';
    const overdue = isOverdue(task, isCompleted);
    const dueDate = formatDate(task.day);

    return (
        <Paper
            variant="outlined"
            sx={{ borderRadius: 3, p: 2, borderColor: 'divider' }}
        >
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '600px' }}>
                    <DragIndicatorIcon sx={{ color: 'text.disabled', mt: 0.5 }} fontSize="small" />
                    <Checkbox
                        checked={isCompleted}
                        disabled={isPending}
                        onChange={(_event, checked) => {
                            void onStatusToggle(task, checked);
                        }}
                        sx={{ p: 0.5 }}
                        size="small"
                    />
                    <TextWithTooltip tooltipTitle={task.label} fontWeight={600}>
                        {task.label}
                    </TextWithTooltip>
                </Stack>

                <Stack direction="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" spacing={1.5}>
                    <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1.5}>
                        <Chip
                            icon={<FlagOutlinedIcon fontSize="small" />}
                            label={priorityLabel(task.priority, t)}
                            color={priorityColor(task.priority)}
                            variant="outlined"
                            size="small"
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <EventOutlinedIcon fontSize="small" color={overdue ? 'error' : 'action'} />
                            <Typography variant="body2" color={overdue ? 'error.main' : 'text.secondary'}>
                                {dueDate}
                            </Typography>
                            {overdue && (
                                <Typography variant="body2" color="error.main">
                                    • {t('dashboard.tasksNotes.labels.overdue')}
                                </Typography>
                            )}
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CalendarMonthOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {t('dashboard.tasksNotes.labels.created', { date: formatDate(task.createdAt) })}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Tooltip title={t('dashboard.tasksNotes.actions.delete')}>
                        <IconButton
                            size="small"
                            disabled={isPending}
                            onClick={() => {
                                void onDelete(task);
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Paper>
    );
}
