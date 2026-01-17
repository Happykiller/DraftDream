import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  CenterFocusStrongOutlined,
  PersonOutline,
  ScheduleOutlined,
} from '@mui/icons-material';

import type { Program } from '@hooks/programs/usePrograms';

import { deriveProgramDifficulty, formatProgramDate } from './programFormatting';
import {
  formatProgramDurationLabel,
  getProgramAthleteLabel,
} from './programViewUtils';
import type {
  OverviewInfoItem,
  ProgramStatItem,
  ProgramViewTab,
} from './programViewUtils';
import { ProgramOverviewTab } from './ProgramOverviewTab';
import { ProgramSessionsTab } from './ProgramSessionsTab';

interface ProgramViewContentProps {
  program: Program;
  activeTab: ProgramViewTab;
  onTabChange: (tab: ProgramViewTab) => void;
}

/**
 * Shared rendering surface for the Program View feature.
 */
export function ProgramViewContent({
  program,
  activeTab,
  onTabChange,
}: ProgramViewContentProps): React.JSX.Element {
  const { t, i18n } = useTranslation();

  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const totalDurationMinutes = program.sessions.reduce(
    (total, session) => total + session.durationMin,
    0,
  );
  const averageDurationMinutes = sessionsCount > 0 ? Math.round(totalDurationMinutes / sessionsCount) : 0;
  const difficulty = deriveProgramDifficulty(program);

  const athleteLabel = React.useMemo(() => getProgramAthleteLabel(program), [program]);

  const totalDurationLabel = React.useMemo(
    () => formatProgramDurationLabel(totalDurationMinutes, t),
    [t, totalDurationMinutes],
  );
  const averageDurationLabel = React.useMemo(
    () => formatProgramDurationLabel(averageDurationMinutes, t),
    [averageDurationMinutes, t],
  );
  const startDateLabel = React.useMemo(
    () => (program.startDate ? formatProgramDate(program.startDate, i18n.language) : null),
    [i18n.language, program.startDate],
  );
  const endDateLabel = React.useMemo(
    () => (program.endDate ? formatProgramDate(program.endDate, i18n.language) : null),
    [i18n.language, program.endDate],
  );

  const overviewInfoItems = React.useMemo<OverviewInfoItem[]>(() => {
    const items: OverviewInfoItem[] = [
      {
        key: 'duration',
        label: t('programs-coatch.view.information.duration'),
        value: t('programs-coatch.list.duration_weeks', { count: program.duration }),
        fallback: '',
        Icon: CalendarMonthOutlined,
        isChip: false,
      },
      {
        key: 'frequency',
        label: t('programs-coatch.view.information.frequency'),
        value: t('programs-coatch.list.frequency_week', { count: program.frequency }),
        fallback: '',
        Icon: ScheduleOutlined,
        isChip: false,
      },
      {
        key: 'startDate',
        label: t('programs-coatch.view.information.start_date'),
        value: startDateLabel,
        fallback: t('programs-coatch.view.information.no_start_date'),
        Icon: CalendarMonthOutlined,
        isChip: false,
      },
      {
        key: 'endDate',
        label: t('programs-coatch.view.information.end_date'),
        value: endDateLabel,
        fallback: t('programs-coatch.view.information.no_end_date'),
        Icon: CalendarMonthOutlined,
        isChip: false,
      },
      {
        key: 'athlete',
        label: t('programs-coatch.view.information.athlete'),
        value: athleteLabel,
        fallback: t('programs-coatch.view.information.no_athlete'),
        Icon: PersonOutline,
        isChip: false,
      },
    ];

    if (difficulty) {
      items.splice(2, 0, {
        key: 'difficulty',
        label: t('programs-coatch.view.information.difficulty'),
        value: t(`programs-coatch.list.difficulty.${difficulty}`),
        fallback: '',
        Icon: CenterFocusStrongOutlined,
        isChip: true,
      });
    }

    return items;
  }, [athleteLabel, difficulty, endDateLabel, program.duration, program.frequency, startDateLabel, t]);

  const statsItems = React.useMemo<ProgramStatItem[]>(
    () => [
      {
        key: 'sessions',
        label: t('programs-coatch.view.stats.sessions'),
        value: t('programs-coatch.view.stats.sessions_value', { count: sessionsCount }),
      },
      {
        key: 'exercises',
        label: t('programs-coatch.view.stats.exercises'),
        value: t('programs-coatch.view.stats.exercises_value', { count: exercisesCount }),
      },
      {
        key: 'totalDuration',
        label: t('programs-coatch.view.stats.total_duration'),
        value: totalDurationLabel,
      },
      {
        key: 'averageDuration',
        label: t('programs-coatch.view.stats.average_duration'),
        value: averageDurationLabel,
      },
    ],
    [averageDurationLabel, exercisesCount, sessionsCount, t, totalDurationLabel],
  );

  const handleTabsChange = React.useCallback(
    (_event: React.SyntheticEvent, value: ProgramViewTab) => {
      onTabChange(value);
    },
    [onTabChange],
  );

  return (
    <Stack spacing={3}>
      <Tabs
        value={activeTab}
        onChange={handleTabsChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab value="overview" label={t('programs-coatch.view.tabs.overview')} />
        <Tab value="sessions" label={t('programs-coatch.view.tabs.sessions')} />
      </Tabs>

      {activeTab === 'overview' ? (
        <ProgramOverviewTab
          overviewInfoItems={overviewInfoItems}
          statsItems={statsItems}
          description={program.description?.trim() || t('programs-coatch.list.no_description')}
        />
      ) : (
        <ProgramSessionsTab sessions={program.sessions} />
      )}

    </Stack>
  );
}
