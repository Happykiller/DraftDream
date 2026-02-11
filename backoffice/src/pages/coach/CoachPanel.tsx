import * as React from 'react';
import { Box } from '@mui/material';

import { CoachTable, type CoachWithLinks } from '@components/coach/CoachTable';
import { useCoachAthletes } from '@hooks/useCoachAthletes';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

export function CoachPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('coh');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);

  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const {
    items: coaches,
    total,
    loading: coachesLoading,
  } = useUsers({
    page,
    limit,
    q,
    type: 'coach',
  });

  const {
    items: activeLinks,
    loading: linksLoading,
  } = useCoachAthletes({
    page: 1,
    limit: 1000,
    isActive: true,
    includeArchived: false,
  });

  const coachRows = React.useMemo<CoachWithLinks[]>(() => {
    const linksByCoachId = activeLinks.reduce<Record<string, number>>((acc, link) => {
      if (!link.coachId) return acc;
      acc[link.coachId] = (acc[link.coachId] ?? 0) + 1;
      return acc;
    }, {});

    return coaches.map((coach) => ({
      ...coach,
      activeAthleteLinks: linksByCoachId[coach.id] ?? 0,
    }));
  }, [activeLinks, coaches]);

  return (
    <Box>
      {/* General information */}
      <CoachTable
        rows={coachRows}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        loading={coachesLoading || linksLoading}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </Box>
  );
}
