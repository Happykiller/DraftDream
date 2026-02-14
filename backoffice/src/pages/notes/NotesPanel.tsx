import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NotesTable } from '@components/notes/NotesTable';
import { useNotes } from '@hooks/useNotes';
import { useTabParams } from '@hooks/useTabParams';

/** Display the notes list for backoffice reviewers. */
export function NotesPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('notes', { page: 1, limit: 25 });
  const { items, total, loading, reload } = useNotes({ page, limit });

  return (
    <Box>
      {/* General information */}
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">{t('notes.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('notes.subtitle')}
          </Typography>
        </Stack>
        <NotesTable
          rows={items}
          total={total}
          page={page}
          limit={limit}
          loading={loading}
          onRefresh={() => {
            void reload();
          }}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Stack>
    </Box>
  );
}
