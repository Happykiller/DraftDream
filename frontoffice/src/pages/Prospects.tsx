// src/pages/Prospects.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Refresh } from '@mui/icons-material';
import { IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';

import {
  ProspectDeleteDialog,
  type ProspectDeleteDialogCopy,
} from '@components/prospects/ProspectDeleteDialog';
import { ProspectList } from '@components/prospects/ProspectList';
import { ProspectWorkflow } from '@components/prospects/ProspectWorkflow';

import { useProspects } from '@hooks/prospects/useProspects';
import { useProspectPipeline } from '@hooks/prospects/useProspectPipeline';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

import { ProspectStatusEnum } from '@src/commons/prospects/status';
import type { Prospect } from '@app-types/prospects';

/** Prospect dashboard listing coach-owned contacts with quick actions. */
export function Prospects(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'list' | 'pipeline'>('list');
  const debouncedQuery = useDebouncedValue(searchQuery, 400);
  const { items, loading, reload, remove } = useProspects({
    page: 1,
    limit: 24,
    q: debouncedQuery,
    status: ProspectStatusEnum.CLIENT,
  });
  const {
    prospectsByStatus: pipelineProspects,
    loading: pipelineLoading,
    reload: reloadPipeline,
    moveProspectToStatus,
  } = useProspectPipeline({ enabled: activeTab === 'pipeline' });
  const [prospectToDelete, setProspectToDelete] = React.useState<Prospect | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const deleteDialogCopy = React.useMemo(
    () =>
      t('prospects.list.delete_dialog', {
        returnObjects: true,
      }) as ProspectDeleteDialogCopy,
    [t],
  );

  const handleCreateProspect = React.useCallback(
    (status?: ProspectStatusEnum) => {
      const url = status ? `/prospects/create?status=${status}` : '/prospects/create';
      navigate(url);
    },
    [navigate],
  );

  const handleEditProspect = React.useCallback(
    (prospect: Prospect) => {
      navigate(`/prospects/edit/${prospect.id}`);
    },
    [navigate],
  );

  const handleDeleteProspect = React.useCallback((prospect: Prospect) => {
    setProspectToDelete(prospect);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!prospectToDelete) {
      return;
    }
    setDeleteLoading(true);
    try {
      await remove(prospectToDelete.id);
      await reloadPipeline();
      setProspectToDelete(null);
    } catch (error) {
      console.error('[Prospects] Failed to delete prospect', error);
    } finally {
      setDeleteLoading(false);
    }
  }, [prospectToDelete, reloadPipeline, remove]);

  const handleCancelDelete = React.useCallback(() => {
    if (deleteLoading) return;
    setProspectToDelete(null);
  }, [deleteLoading]);

  const handleMoveProspect = React.useCallback(
    (prospect: Prospect, toStatus: ProspectStatusEnum, fromStatus: ProspectStatusEnum) => {
      void moveProspectToStatus(prospect, toStatus, fromStatus);
    },
    [moveProspectToStatus],
  );

  const handleValidateProspect = React.useCallback(
    (prospect: Prospect) => {
      void moveProspectToStatus(prospect, ProspectStatusEnum.A_FAIRE, ProspectStatusEnum.GAGNE);
    },
    [moveProspectToStatus],
  );

  const handleTabChange = React.useCallback((_: React.SyntheticEvent, value: 'list' | 'pipeline') => {
    setActiveTab(value);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (activeTab === 'pipeline') {
      void reloadPipeline();
      return;
    }
    void reload();
  }, [activeTab, reload, reloadPipeline]);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack alignItems="flex-start" spacing={1} width="100%">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            alignSelf: 'center',
            '.MuiTabs-indicator': { height: 3, borderRadius: 1 },
          }}
        >
          <Tab
            value="list"
            label={t('prospects.tabs.list')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              minHeight: 40,
              minWidth: 120,
              '&.Mui-selected': {
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
              },
            }}
          />
          <Tab
            value="pipeline"
            label={t('prospects.tabs.pipeline')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              minHeight: 40,
              minWidth: 120,
              '&.Mui-selected': {
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
              },
            }}
          />
        </Tabs>
        <Stack alignItems="center" direction="row" flexWrap="wrap" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h5">{t('prospects.subtitle')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('prospects.helper')}
            </Typography>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Tooltip title={t('prospects.actions.refresh')}>
              <IconButton aria-label="refresh-prospects" color="primary" onClick={handleRefresh} size="small">
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {activeTab === 'list' ? (
        <>
          <ProspectList
            prospects={items}
            loading={loading}
            searchQuery={searchQuery}
            searchPlaceholder={t('prospects.list.search_placeholder')}
            searchAriaLabel={t('prospects.list.search_aria')}
            emptyTitle={t('prospects.list.empty_title')}
            emptyDescription={t('prospects.list.empty_description')}
            onSearchChange={setSearchQuery}
            onEditProspect={handleEditProspect}
            onDeleteProspect={handleDeleteProspect}
          />
        </>
      ) : (
        <ProspectWorkflow
          loading={pipelineLoading}
          prospectsByStatus={pipelineProspects}
          onCreateProspect={handleCreateProspect}
          onEditProspect={handleEditProspect}
          onDeleteProspect={handleDeleteProspect}
          onMoveProspect={handleMoveProspect}
          onValidateProspect={handleValidateProspect}
        />
      )}

      <ProspectDeleteDialog
        prospect={prospectToDelete}
        open={Boolean(prospectToDelete)}
        loading={deleteLoading}
        copy={deleteDialogCopy}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  );
}
