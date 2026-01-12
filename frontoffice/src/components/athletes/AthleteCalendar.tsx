import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { MealRecord } from '@hooks/nutrition/useMealRecords';
import type { ProgramRecord } from '@hooks/program-records/useProgramRecords';

const _CALENDAR_VIEWS = ['month', 'week', 'day'] as const;

type CalendarView = (typeof _CALENDAR_VIEWS)[number];

interface CalendarDay {
  readonly date: Date;
  readonly isOutsideMonth: boolean;
}

const DAY_HEADERS = 7;
const MONTH_GRID_SIZE = 42;
const MAX_VISIBLE_RECORDS = 3;

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
  readonly onProgramRecordClick: (recordId: string) => void;
  readonly onMealRecordClick: (recordId: string) => void;
}

interface CalendarRecordItem {
  readonly id: string;
  readonly label: string;
  readonly type: 'program' | 'meal';
}

interface ExpandedDay {
  readonly label: string;
  readonly records: CalendarRecordItem[];
}

interface DayCellProps {
  readonly day: CalendarDay;
  readonly view: CalendarView;
  readonly isToday: boolean;
  readonly recordItems: CalendarRecordItem[];
  readonly renderRecordPill: (
    record: CalendarRecordItem,
    onRecordClick: (record: CalendarRecordItem) => void,
  ) => React.ReactNode;
  readonly onExpand: (payload: ExpandedDay) => void;
  readonly onRecordClick: (record: CalendarRecordItem) => void;
  readonly fullDateLabel: string;
  readonly getHiddenLabel: (count: number) => string;
  readonly pillHeight: number;
}

/** Calendar day cell with overflow-aware record rendering. */
function DayCell({
  day,
  view,
  isToday,
  recordItems,
  renderRecordPill,
  onExpand,
  onRecordClick,
  fullDateLabel,
  getHiddenLabel,
  pillHeight,
}: DayCellProps): React.JSX.Element {
  const theme = useTheme();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [cellHeight, setCellHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setCellHeight(entry.contentRect.height);
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const captionFontSize = React.useMemo(() => {
    const size = theme.typography.caption.fontSize;
    const numeric = typeof size === 'number' ? size : Number.parseFloat(size ?? '0');
    return Number.isNaN(numeric) ? 12 : numeric * 16;
  }, [theme.typography.caption.fontSize]);

  const captionLineHeight = React.useMemo(() => {
    const lineHeight = theme.typography.caption.lineHeight;
    const numeric = typeof lineHeight === 'number' ? lineHeight : Number.parseFloat(lineHeight ?? '');
    return Number.isNaN(numeric) ? 1.5 : numeric;
  }, [theme.typography.caption.lineHeight]);

  const cellPaddingY = React.useMemo(() => Number.parseFloat(theme.spacing(1)), [theme]);
  const gapSize = React.useMemo(() => Number.parseFloat(theme.spacing(0.5)), [theme]);

  const maxVisibleRecords = React.useMemo(() => {
    if (!cellHeight) {
      return MAX_VISIBLE_RECORDS;
    }

    const headerHeight = captionFontSize * captionLineHeight;
    const availableHeight = Math.max(0, cellHeight - cellPaddingY * 2 - headerHeight - gapSize);
    return Math.max(0, Math.floor((availableHeight + gapSize) / (pillHeight + gapSize)));
  }, [captionFontSize, captionLineHeight, cellHeight, cellPaddingY, gapSize, pillHeight]);

  const visibleCount = React.useMemo(() => {
    if (recordItems.length <= maxVisibleRecords) {
      return maxVisibleRecords;
    }

    return Math.max(0, maxVisibleRecords - 1);
  }, [maxVisibleRecords, recordItems.length]);

  const visibleItems = recordItems.slice(0, visibleCount);
  const hiddenCount = recordItems.length - visibleItems.length;
  const dayLabel = view === 'day' ? fullDateLabel : day.date.getDate();
  const isFullHeight = view === 'week';

  return (
    <Box
      ref={containerRef}
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
        overflow: 'hidden',
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
      {visibleItems.map((record) => renderRecordPill(record, onRecordClick))}
      {hiddenCount > 0 ? (
        <Tooltip title={getHiddenLabel(hiddenCount)} arrow>
          <Box
            role="button"
            tabIndex={0}
            onClick={() =>
              onExpand({
                label: fullDateLabel,
                records: recordItems,
              })
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onExpand({
                  label: fullDateLabel,
                  records: recordItems,
                });
              }
            }}
            aria-label={getHiddenLabel(hiddenCount)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: pillHeight,
              px: 0.75,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
              cursor: 'pointer',
            }}
          >
            <MoreHoriz fontSize="small" />
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  );
}

/** Calendar layout for coach athlete tabs. */
export function AthleteCalendar({
  programRecords,
  mealRecords,
  onProgramRecordClick,
  onMealRecordClick,
}: AthleteCalendarProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const isBelowXl = useMediaQuery(theme.breakpoints.down('xl'));
  const [view, setView] = React.useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = React.useState(() => normalizeDate(new Date()));
  const [expandedDay, setExpandedDay] = React.useState<ExpandedDay | null>(null);
  const today = React.useMemo(() => normalizeDate(new Date()), []);

  const captionFontSize = React.useMemo(() => {
    const size = theme.typography.caption.fontSize;
    const numeric = typeof size === 'number' ? size : Number.parseFloat(size ?? '0');
    return Number.isNaN(numeric) ? 12 : numeric * 16;
  }, [theme.typography.caption.fontSize]);

  const captionLineHeight = React.useMemo(() => {
    const lineHeight = theme.typography.caption.lineHeight;
    const numeric = typeof lineHeight === 'number' ? lineHeight : Number.parseFloat(lineHeight ?? '');
    return Number.isNaN(numeric) ? 1.5 : numeric;
  }, [theme.typography.caption.lineHeight]);

  const recordsByDate = React.useMemo(() => {
    const grouped = new Map<string, { programs: ProgramRecord[]; meals: MealRecord[] }>();

    programRecords.forEach((record) => {
      const dateLabel = normalizeDate(new Date(record.createdAt)).toISOString().slice(0, 10);
      if (!grouped.has(dateLabel)) {
        grouped.set(dateLabel, { programs: [], meals: [] });
      }
      grouped.get(dateLabel)?.programs.push(record);
    });

    mealRecords.forEach((record) => {
      const dateLabel = normalizeDate(new Date(record.createdAt)).toISOString().slice(0, 10);
      if (!grouped.has(dateLabel)) {
        grouped.set(dateLabel, { programs: [], meals: [] });
      }
      grouped.get(dateLabel)?.meals.push(record);
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

    const mealRecord = record as MealRecord;
    return mealRecord.mealSnapshot?.label ?? mealRecord.mealPlanSnapshot?.label ?? t('athletes.details.tabs.meal_records');
  }, [t]);

  const buildRecordItem = React.useCallback(
    (record: ProgramRecord | MealRecord, type: CalendarRecordItem['type']): CalendarRecordItem => ({
      id: record.id,
      label: resolveRecordLabel(record),
      type,
    }),
    [resolveRecordLabel],
  );

  const handleCloseExpandedDay = React.useCallback(() => {
    setExpandedDay(null);
  }, []);

  const pillPaddingY = React.useMemo(() => Number.parseFloat(theme.spacing(0.25)), [theme]);
  const pillHeight = React.useMemo(
    () => captionFontSize * captionLineHeight + pillPaddingY * 2,
    [captionFontSize, captionLineHeight, pillPaddingY],
  );

  /** Render a full-width pill that keeps the record label on a single line. */
  const renderRecordPill = React.useCallback(
    (record: CalendarRecordItem, onRecordClick: (record: CalendarRecordItem) => void) => {
      const isProgram = record.type === 'program';
      const backgroundColor = isProgram ? theme.palette.success.main : theme.palette.warning.main;
      const textColor = isProgram ? theme.palette.success.contrastText : theme.palette.warning.contrastText;

      return (
        <Tooltip key={record.id} title={record.label} arrow>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => onRecordClick(record)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRecordClick(record);
              }
            }}
            sx={{ width: '100%', cursor: 'pointer' }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                width: '100%',
                height: pillHeight,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: backgroundColor,
                color: textColor,
              }}
            >
              <Typography
                variant="caption"
                noWrap
                sx={{
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {record.label}
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      );
    },
    [
      pillHeight,
      theme.palette.success.contrastText,
      theme.palette.success.main,
      theme.palette.warning.contrastText,
      theme.palette.warning.main,
    ],
  );

  const headerLabels = React.useMemo(() => {
    if (view === 'day') {
      return [fullDateFormatter.format(currentDate)];
    }

    return weekDayLabels;
  }, [currentDate, fullDateFormatter, view, weekDayLabels]);

  const handleRecordClick = React.useCallback(
    (record: CalendarRecordItem) => {
      if (record.type === 'program') {
        onProgramRecordClick(record.id);
        return;
      }

      onMealRecordClick(record.id);
    },
    [onMealRecordClick, onProgramRecordClick],
  );

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
          const dayKey = normalizeDate(day.date).toISOString().slice(0, 10);
          const dailyRecords = recordsByDate.get(dayKey);
          const programItems = dailyRecords?.programs ?? [];
          const mealItems = dailyRecords?.meals ?? [];
          const recordItems = [
            ...programItems.map((record) => buildRecordItem(record, 'program')),
            ...mealItems.map((record) => buildRecordItem(record, 'meal')),
          ];
          const fullDateLabel = fullDateFormatter.format(day.date);
          return (
            <DayCell
              key={day.date.toISOString()}
              day={day}
              view={view}
              isToday={isToday}
              recordItems={recordItems}
              renderRecordPill={renderRecordPill}
              onExpand={setExpandedDay}
              onRecordClick={handleRecordClick}
              fullDateLabel={fullDateLabel}
              getHiddenLabel={(count) =>
                t('athletes.details.calendar.records.view_all', {
                  count,
                })
              }
              pillHeight={pillHeight}
            />
          );
        })}
      </Box>
      <Dialog
        open={Boolean(expandedDay)}
        onClose={handleCloseExpandedDay}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {expandedDay ? t('athletes.details.calendar.records.title', { date: expandedDay.label }) : null}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ py: 1 }}>
            {expandedDay?.records.map((record) => renderRecordPill(record, handleRecordClick)) ?? null}
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
