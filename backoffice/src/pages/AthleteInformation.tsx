// src/pages/AthleteInformation.tsx
import * as React from 'react';
import { Stack } from '@mui/material';

import { AthleteInformationTable } from '@components/athletes/AthleteInformationTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

export function AthleteInformation(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('athinfo');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading } = useUsers({
    page,
    limit,
    q,
    type: 'athlete',
  });

  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <AthleteInformationTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        query={searchInput}
        loading={loading}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </Stack>
  );
}
