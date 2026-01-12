import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { MealRecord } from '@hooks/nutrition/useMealRecords';
import type { ProgramRecord } from '@hooks/program-records/useProgramRecords';

const CALENDAR_VIEWS = ['month', 'week', 'day'] as const;

type CalendarView = (typeof CALENDAR_VIEWS)[number];

interface CalendarDay {
  readonly date: Date;
  readonly isOutsideMonth: boolean;
}

const DAY_HEADERS = 7;
const MONTH_GRID_SIZE = 42;

/** Align a date to midnight for stable comparisons. */
function normalizeDate(value: Date): Date {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/** Determine if two dates occur on the same calendar day. */
function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
  );
}

/** Build a Monday-first week starting point. */
function getWeekStart(value: Date): Date {
  const normalized = normalizeDate(value);
  const day = normalized.getDay();
  const diff = (day + 6) % 7;
  normalized.setDate(normalized.getDate() - diff);
  return normalized;
}

/** Generate a fixed-size month grid anchored to a target date. */
function buildMonthDays(currentDate: Date): CalendarDay[] {
  const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const firstGridDay = getWeekStart(firstOfMonth);

  return Array.from({ length: MONTH_GRID_SIZE }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);

    return {
      date,
      isOutsideMonth: date.getMonth() !== currentDate.getMonth(),
    };
  });
}

/** Generate a week grid anchored to a target date. */
function buildWeekDays(currentDate: Date): CalendarDay[] {
  const firstGridDay = getWeekStart(currentDate);

  return Array.from({ length: DAY_HEADERS }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);

    return {
      date,
      isOutsideMonth: false,
    };
  });
}

interface AthleteCalendarProps {
  readonly programRecords: ProgramRecord[];
  readonly mealRecords: MealRecord[];
}

/** Calendar layout for coach athlete tabs. */
export function AthleteCalendar({ programRecords, mealRecords }: AthleteCalendarProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const isBelowXl = useMediaQuery(theme.breakpoints.down('xl'));
  const [view, setView] = React.useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = React.useState(() => normalizeDate(new Date()));
  const today = React.useMemo(() => normalizeDate(new Date()), []);

  const recordsByDate = React.useMemo(() => {
    const grouped = new Map<string, { programs: ProgramRecord[]; meals: MealRecord[] }>();

    const pushRecord = <T extends ProgramRecord | MealRecord>(
      dateLabel: string,
      key: 'programs' | 'meals',
      record: T,
    ) => {
      if (!grouped.has(dateLabel)) {
        grouped.set(dateLabel, { programs: [], meals: [] });
      }
      grouped.get(dateLabel)?.[key].push(record);
    };

    programRecords.forEach((record) => {
      const dateLabel = normalizeDate(new Date(record.createdAt)).toISOString().slice(0, 10);
      pushRecord(dateLabel, 'programs', record);
    });

    mealRecords.forEach((record) => {
      const dateLabel = normalizeDate(new Date(record.createdAt)).toISOString().slice(0, 10);
      pushRecord(dateLabel, 'meals', record);
    });

    return grouped;
  }, [mealRecords, programRecords]);

  const responsiveView = React.useMemo<CalendarView>(() => {
    if (isXs) {
      return 'day';
    }

    if (isXlUp) {
      return 'month';
    }

    return 'week';
  }, [isXs, isXlUp]);

  React.useEffect(() => {
    if (isBelowXl || isXlUp) {
      setView(responsiveView);
    }
  }, [isBelowXl, isXlUp, responsiveView]);

  const weekDayFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }),
    [i18n.language],
  );

  const monthFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }),
    [i18n.language],
  );

  const dayFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short' }),
    [i18n.language],
  );

  const fullDateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'long', year: 'numeric' }),
    [i18n.language],
  );

  const weekDayLabels = React.useMemo(() => {
    const start = getWeekStart(new Date());
    return Array.from({ length: DAY_HEADERS }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return weekDayFormatter.format(date);
    });
  }, [weekDayFormatter]);

  const days = React.useMemo(() => {
    if (view === 'month') {
      return buildMonthDays(currentDate);
    }

    if (view === 'week') {
      return buildWeekDays(currentDate);
    }

    return [
      {
        date: currentDate,
        isOutsideMonth: false,
      },
    ];
  }, [currentDate, view]);

  const currentLabel = React.useMemo(() => {
    if (view === 'month') {
      return monthFormatter.format(currentDate);
    }

    if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${dayFormatter.format(weekStart)} - ${dayFormatter.format(weekEnd)}`;
    }

    return fullDateFormatter.format(currentDate);
  }, [currentDate, dayFormatter, fullDateFormatter, monthFormatter, view]);

  const handlePrevious = React.useCallback(() => {
    setCurrentDate((date) => {
      const next = new Date(date);
      if (view === 'month') {
        next.setMonth(next.getMonth() - 1);
      } else if (view === 'week') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return normalizeDate(next);
    });
  }, [view]);

  const handleCurrent = React.useCallback(() => {
    setCurrentDate(today);
  }, [today]);

  const handleNext = React.useCallback(() => {
    setCurrentDate((date) => {
      const next = new Date(date);
      if (view === 'month') {
        next.setMonth(next.getMonth() + 1);
      } else if (view === 'week') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return normalizeDate(next);
    });
  }, [view]);

  const handleViewChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, nextView: CalendarView | null) => {
      if (nextView) {
        setView(nextView);
      }
    },
    [],
  );

  const columns = view === 'day' ? 1 : DAY_HEADERS;

  const resolveRecordLabel = React.useCallback((record: ProgramRecord | MealRecord) => {
    if ('sessionSnapshot' in record) {
      return record.sessionSnapshot?.label ?? t('athletes.details.tabs.sessions');
    }

    return record.mealSnapshot?.label ?? record.mealPlanSnapshot?.label ?? t('athletes.details.tabs.meal_records');
  }, [t]);

  const headerLabels = React.useMemo(() => {
    if (view === 'day') {
      return [fullDateFormatter.format(currentDate)];
    }

    return weekDayLabels;
  }, [currentDate, fullDateFormatter, view, weekDayLabels]);

  return (
    <Stack
      spacing={2}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* General information */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent={{ xs: 'flex-start', md: 'space-between' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <IconButton aria-label={t('athletes.details.calendar.controls.previous')} onClick={handlePrevious}>
            <ChevronLeft />
          </IconButton>
          <Button variant="outlined" size="small" onClick={handleCurrent}>
            {t('athletes.details.calendar.controls.current')}
          </Button>
          <IconButton aria-label={t('athletes.details.calendar.controls.next')} onClick={handleNext}>
            <ChevronRight />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {currentLabel}
          </Typography>
        </Stack>

        <ToggleButtonGroup value={view} exclusive size="small" onChange={handleViewChange}>
          <ToggleButton value="month">{t('athletes.details.calendar.views.month')}</ToggleButton>
          <ToggleButton value="week">{t('athletes.details.calendar.views.week')}</ToggleButton>
          <ToggleButton value="day">{t('athletes.details.calendar.views.day')}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 1,
        }}
      >
        {headerLabels.map((label) => (
          <Box
            key={label}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 1,
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {days.map((day) => {
          const isToday = isSameDay(day.date, today);
          const dayLabel = view === 'day' ? fullDateFormatter.format(day.date) : day.date.getDate();
          const isFullHeight = view === 'week';
          const dayKey = normalizeDate(day.date).toISOString().slice(0, 10);
          const dailyRecords = recordsByDate.get(dayKey);
          const programItems = dailyRecords?.programs ?? [];
          const mealItems = dailyRecords?.meals ?? [];

          return (
            <Box
              key={day.date.toISOString()}
              sx={{
                minHeight: view === 'day' ? 220 : 96,
                height: isFullHeight ? '100%' : 'auto',
                borderRadius: 2,
                border: 1,
                borderColor: isToday ? 'primary.main' : 'divider',
                bgcolor: day.isOutsideMonth ? 'action.hover' : 'background.paper',
                px: 1,
                py: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday ? 700 : 500,
                  color: day.isOutsideMonth ? 'text.disabled' : 'text.primary',
                }}
              >
                {dayLabel}
              </Typography>
              {programItems.map((record) => (
                <Typography
                  key={record.id}
                  variant="caption"
                  noWrap
                  sx={{
                    width: '100%',
                    color: theme.palette.success.main,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {resolveRecordLabel(record)}
                </Typography>
              ))}
              {mealItems.map((record) => (
                <Typography
                  key={record.id}
                  variant="caption"
                  noWrap
                  sx={{
                    width: '100%',
                    color: theme.palette.warning.main,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {resolveRecordLabel(record)}
                </Typography>
              ))}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
