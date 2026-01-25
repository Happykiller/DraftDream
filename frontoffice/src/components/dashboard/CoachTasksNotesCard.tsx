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
  Divider,
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

type TaskPriority = 'low' | 'middle' | 'high';
type TaskStatusFilter = 'all' | 'open' | 'done';

interface TaskItem {
  id: string;
  label: string;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  completed: boolean;
}

const TODAY = new Date();
const TWO_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const NEXT_WEEK = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const TASKS: TaskItem[] = [
  {
    id: 'task-1',
    label: 'Relancer Pierre',
    priority: 'middle',
    dueDate: TWO_DAYS_AGO,
    createdAt: TODAY,
    completed: false,
  },
  {
    id: 'task-2',
    label: 'Préparer le bilan',
    priority: 'high',
    dueDate: NEXT_WEEK,
    createdAt: TODAY,
    completed: false,
  },
];

function isOverdue(task: TaskItem): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !task.completed && task.dueDate.getTime() < today.getTime();
}

export function CoachTasksNotesCard(): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });
  const [filter, setFilter] = React.useState<TaskStatusFilter>('all');
  const [showForm, setShowForm] = React.useState(false);

  const filteredTasks = React.useMemo(() => {
    if (filter === 'done') {
      return TASKS.filter((task) => task.completed);
    }
    if (filter === 'open') {
      return TASKS.filter((task) => !task.completed);
    }
    return TASKS;
  }, [filter]);

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, value: TaskStatusFilter | null) => {
    if (value) {
      setFilter(value);
    }
  };

  const priorityLabel = (priority: TaskPriority) => {
    if (priority === 'high') return t('dashboard.tasksNotes.priority.high');
    if (priority === 'middle') return t('dashboard.tasksNotes.priority.middle');
    return t('dashboard.tasksNotes.priority.low');
  };

  const priorityColor = (priority: TaskPriority) => {
    if (priority === 'high') return 'error';
    if (priority === 'middle') return 'warning';
    return 'success';
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
                  <Stack spacing={2} component="form">
                    <TextField
                      required
                      fullWidth
                      label={t('dashboard.tasksNotes.form.label')}
                      placeholder={t('dashboard.tasksNotes.form.placeholder')}
                    />
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                        <TextField select fullWidth label={t('dashboard.tasksNotes.form.priority')}>
                          <MenuItem value="low">{t('dashboard.tasksNotes.priority.low')}</MenuItem>
                          <MenuItem value="middle">{t('dashboard.tasksNotes.priority.middle')}</MenuItem>
                          <MenuItem value="high">{t('dashboard.tasksNotes.priority.high')}</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                        <TextField
                          fullWidth
                          type="date"
                          label={t('dashboard.tasksNotes.form.day')}
                          InputLabelProps={{ shrink: true }}
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
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>
                )}

                <Divider />

                <Stack spacing={2}>
                  {filteredTasks.map((task) => (
                    <Paper
                      key={task.id}
                      variant="outlined"
                      sx={{ borderRadius: 3, p: 2, borderColor: 'divider' }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <DragIndicatorIcon sx={{ color: 'text.disabled' }} fontSize="small" />
                          <Checkbox checked={task.completed} sx={{ mt: -0.5 }} />
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
                            <EventOutlinedIcon fontSize="small" color={isOverdue(task) ? 'error' : 'action'} />
                            <Typography variant="body2" color={isOverdue(task) ? 'error.main' : 'text.secondary'}>
                              {formatDate(task.dueDate)}
                            </Typography>
                            {isOverdue(task) && (
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
                            <IconButton size="small">
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
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
