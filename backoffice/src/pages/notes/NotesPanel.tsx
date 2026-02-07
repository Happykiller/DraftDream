import * as React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NotesTable } from '@components/notes/NotesTable';
import { useNotes } from '@hooks/useNotes';
import { useTabParams } from '@hooks/useTabParams';

/** Display the notes list for backoffice reviewers. */
export function NotesPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('notes', { page: 1, limit: 25 });
  const { items, total, loading, reload } = useNotes({ page, limit });

  /** Handle manual refresh from the backoffice toolbar. */
  const handleReload = React.useCallback(() => {
    void reload();
  }, [reload]);

  return (
    <Box>
      {/* General information */}
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{t('notes.title')}</Typography>
            <Tooltip title={t('notes.actions.reload')}>
              <span>
                <IconButton
                  aria-label={t('notes.actions.reload')}
                  onClick={handleReload}
                  disabled={loading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
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
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Stack>
    </Box>
  );
}
