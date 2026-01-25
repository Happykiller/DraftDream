import * as React from 'react';
import { useTranslation } from 'react-i18next';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import {
  Box,
  Checkbox,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { GlassCard } from '@components/common/GlassCard';
import { useDateFormatter } from '@hooks/useDateFormatter';
import { useTasks, type Task, type TaskPriority, type TaskStatus } from '@hooks/useTasks';

type TaskStatusFilter = 'all' | 'open' | 'done';

function isOverdue(task: Task, isCompleted: boolean): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.day);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }
  return !isCompleted && dueDate.getTime() < today.getTime();
}

export function CoachTasksNotesCard(): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });
  const [filter, setFilter] = React.useState<TaskStatusFilter>('all');
  const [showForm, setShowForm] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('MIDDLE');
  const [day, setDay] = React.useState('');
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

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, value: TaskStatusFilter | null) => {
    if (value) {
      setFilter(value);
    }
  };

  const priorityLabel = (priority: TaskPriority) => {
    if (priority === 'HIGH') return t('dashboard.tasksNotes.priority.high');
    if (priority === 'MIDDLE') return t('dashboard.tasksNotes.priority.middle');
    return t('dashboard.tasksNotes.priority.low');
  };

  const priorityColor = (priority: TaskPriority) => {
    if (priority === 'HIGH') return 'error';
    if (priority === 'MIDDLE') return 'warning';
    return 'success';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim() || !day) {
      return;
    }
    await create({
      label: label.trim(),
      priority,
      status: 'TODO',
      day,
    });
    setLabel('');
    setPriority('MIDDLE');
    setDay('');
    setShowForm(false);
  };

  const handleStatusToggle = async (task: Task, checked: boolean) => {
    setPendingTaskId(task.id);
    try {
      await update({ id: task.id, status: checked ? 'DONE' : 'TODO' });
    } finally {
      setPendingTaskId(null);
    }
  };

  const handleDelete = async (task: Task) => {
    setPendingTaskId(task.id);
    try {
      await remove(task.id);
    } finally {
      setPendingTaskId(null);
    }
  };

  return (
    <GlassCard sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AddTaskOutlinedIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            {t('dashboard.tasksNotes.title')}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 6 }}>
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
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                      backgroundColor: 'action.hover',
                      borderRadius: 999,
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        textTransform: 'none',
                        px: 2,
                      },
                    }}
                  >
                    <ToggleButton value="all">{t('dashboard.tasksNotes.filters.all')}</ToggleButton>
                    <ToggleButton value="open">{t('dashboard.tasksNotes.filters.open')}</ToggleButton>
                    <ToggleButton value="done">{t('dashboard.tasksNotes.filters.done')}</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                {!showForm ? (
                  <ResponsiveButton
                    variant="outlined"
                    color="primary"
                    label={t('dashboard.tasksNotes.actions.newTask')}
                    onClick={() => setShowForm(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      backgroundColor: 'action.hover',
                      borderRadius: 2,
                      borderColor: 'divider',
                      p: 2,
                    }}
                  >
                    <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                      <TextField
                        required
                        fullWidth
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
                              label={t('dashboard.tasksNotes.actions.cancel')}
                              onClick={() => setShowForm(false)}
                            />
                            <ResponsiveButton
                              variant="contained"
                              color="primary"
                              label={t('dashboard.tasksNotes.actions.addTask')}
                              type="submit"
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                )}

                <Stack spacing={2}>
                  {items.map((task) => {
                    const isCompleted = task.status === 'DONE';
                    const overdue = isOverdue(task, isCompleted);
                    const dueDate = formatDate(task.day);
                    return (
                    <Paper
                      key={task.id}
                      variant="outlined"
                      sx={{ borderRadius: 3, p: 2, borderColor: 'divider' }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <DragIndicatorIcon sx={{ color: 'text.disabled' }} fontSize="small" />
                          <Checkbox
                            checked={isCompleted}
                            disabled={pendingTaskId === task.id}
                            onChange={(_event, checked) => {
                              void handleStatusToggle(task, checked);
                            }}
                            sx={{ mt: -0.5 }}
                          />
                          <Typography fontWeight={600}>{task.label}</Typography>
                        </Stack>

                        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1.5}>
                          <Chip
                            icon={<FlagOutlinedIcon fontSize="small" />}
                            label={priorityLabel(task.priority)}
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

                        <Box display="flex" justifyContent="flex-end">
                          <Tooltip title={t('dashboard.tasksNotes.actions.delete')}>
                            <IconButton
                              size="small"
                              disabled={pendingTaskId === task.id}
                              onClick={() => {
                                void handleDelete(task);
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                  })}
                  {!items.length && !loading && (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.no_content')}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
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
                <Stack direction="row" alignItems="center" spacing={1}>
                  <NotesOutlinedIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('dashboard.tasksNotes.notes.title')}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.tasksNotes.notes.placeholder')}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </GlassCard>
  );
}
