// src/pages/Clients.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Add, Refresh } from '@mui/icons-material';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { ClientDeleteDialog, type ClientDeleteDialogCopy } from '@components/clients/ClientDeleteDialog';
import { ClientList } from '@components/clients/ClientList';

import { useClients } from '@hooks/clients/useClients';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

import type { Client } from '@types/clients';

/** Client dashboard listing coach-owned contacts with quick actions. */
export function Clients(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 400);
  const { items, loading, reload, remove } = useClients({ page: 1, limit: 24, q: debouncedQuery });
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const deleteDialogCopy = React.useMemo(
    () =>
      t('clients.list.delete_dialog', {
        returnObjects: true,
      }) as ClientDeleteDialogCopy,
    [t],
  );

  const handleCreateClient = React.useCallback(() => {
    navigate('/clients/create');
  }, [navigate]);

  const handleEditClient = React.useCallback(
    (client: Client) => {
      navigate(`/clients/edit/${client.id}`);
    },
    [navigate],
  );

  const handleDeleteClient = React.useCallback((client: Client) => {
    setClientToDelete(client);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!clientToDelete) {
      return;
    }
    setDeleteLoading(true);
    try {
      await remove(clientToDelete.id);
      setClientToDelete(null);
    } catch (error) {
      console.error('[Clients] Failed to delete client', error);
    } finally {
      setDeleteLoading(false);
    }
  }, [clientToDelete, remove]);

  const handleCancelDelete = React.useCallback(() => {
    if (deleteLoading) return;
    setClientToDelete(null);
  }, [deleteLoading]);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Stack alignItems="center" direction="row" flexWrap="wrap" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h5">{t('clients.subtitle')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('clients.helper')}
            </Typography>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Tooltip title={t('clients.actions.refresh')}>
              <IconButton aria-label="refresh-clients" color="primary" onClick={() => void reload()} size="small">
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button color="warning" startIcon={<Add />} variant="contained" onClick={handleCreateClient}>
              {t('clients.actions.create')}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <ClientList
        clients={items}
        loading={loading}
        searchQuery={searchQuery}
        searchPlaceholder={t('clients.list.search_placeholder')}
        searchAriaLabel={t('clients.list.search_aria')}
        emptyTitle={t('clients.list.empty_title')}
        emptyDescription={t('clients.list.empty_description')}
        onSearchChange={setSearchQuery}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
      />

      <ClientDeleteDialog
        client={clientToDelete}
        open={Boolean(clientToDelete)}
        loading={deleteLoading}
        copy={deleteDialogCopy}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  );
}
