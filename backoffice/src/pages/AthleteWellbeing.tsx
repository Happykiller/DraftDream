// src/pages/AthleteWellbeing.tsx
import * as React from 'react';
import { Stack } from '@mui/material';

import { AthleteWellbeingTable } from '@components/athletes/AthleteWellbeingTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useDailyReports } from '@hooks/useDailyReports';
import { useTabParams } from '@hooks/useTabParams';

export function AthleteWellbeing(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('athwell');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);

  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, reload } = useDailyReports({ page, limit });

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = debounced.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const firstName = item.athlete?.first_name?.toLowerCase() ?? '';
      const lastName = item.athlete?.last_name?.toLowerCase() ?? '';
      const fullName = `${lastName} ${firstName}`.trim();
      const email = item.athlete?.email?.toLowerCase() ?? '';
      return fullName.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [debounced, items]);

  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <AthleteWellbeingTable
        rows={filteredItems}
        total={debounced ? filteredItems.length : total}
        page={page}
        limit={limit}
        query={searchInput}
        loading={loading}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRefresh={reload}
      />
    </Stack>
  );
}
