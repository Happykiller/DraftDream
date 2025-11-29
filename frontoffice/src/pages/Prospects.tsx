// src/pages/Prospects.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  ProspectDeleteDialog,
  type ProspectDeleteDialogCopy,
} from '@components/prospects/ProspectDeleteDialog';
import { ProspectList } from '@components/prospects/ProspectList';
import { ProspectWorkflow } from '@components/prospects/ProspectWorkflow';

import { useProspects } from '@hooks/prospects/useProspects';
import { useProspectPipeline } from '@hooks/prospects/useProspectPipeline';
import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useProspectListMetrics } from '@hooks/prospects/useProspectListMetrics';
import { useDebouncedValue } from '@hooks/useDebouncedValue';

import { ProspectStatusEnum } from '@src/commons/prospects/status';
import type { Prospect, ProspectSourceFilterValue } from '@app-types/prospects';

/** Prospect dashboard listing coach-owned contacts with quick actions. */
export function Prospects(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'list' | 'pipeline'>('list');
  const [sourceFilter, setSourceFilter] = React.useState<ProspectSourceFilterValue>('all');
  const debouncedQuery = useDebouncedValue(searchQuery, 400);
  const { items, loading, reload, remove } = useProspects({
    page: 1,
    limit: 24,
    q: debouncedQuery,
    status: ProspectStatusEnum.CLIENT,
    sourceId: sourceFilter !== 'all' && sourceFilter !== 'none' ? sourceFilter : null,
  });
  const {
    prospectsByStatus: pipelineProspects,
    loading: pipelineLoading,
    reload: reloadPipeline,
    moveProspectToStatus,
  } = useProspectPipeline({ enabled: activeTab === 'pipeline' });
  const {
    metrics: listMetrics,
    loading: listMetricsLoading,
    reload: reloadListMetrics,
  } = useProspectListMetrics({ sourceFilter, enabled: activeTab === 'list' });
  const { sources: sourceMetadata } = useProspectMetadataOptions();
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
      await reload();
      await reloadPipeline();
      setProspectToDelete(null);
    } catch (error) {
      console.error('[Prospects] Failed to delete prospect', error);
    } finally {
      setDeleteLoading(false);
    }
  }, [prospectToDelete, reload, reloadPipeline, remove]);

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

  const handleRefresh = React.useCallback(() => {
    void reload();
    void reloadPipeline();
    void reloadListMetrics();
  }, [reload, reloadListMetrics, reloadPipeline]);

  const handleTabChange = React.useCallback((_: React.SyntheticEvent, value: 'list' | 'pipeline') => {
    setActiveTab(value);
  }, []);

  const sourceOptions = React.useMemo(
    () =>
      [...(sourceMetadata ?? [])]
        .map((option) => ({
          id: option.id,
          label: option.label ?? t('prospects.workflow.summary.filters.unknown_source'),
        }))
        .sort((first, second) => first.label.localeCompare(second.label, i18n.language)),
    [i18n.language, sourceMetadata, t],
  );

  const hasUnassignedSource = React.useMemo(() => {
    const listHasUnknown = items.some((prospect) => !(prospect.source?.id ?? prospect.sourceId));
    const pipelineHasUnknown = Object.values(pipelineProspects ?? {}).some((prospects) =>
      prospects.some((prospect) => !(prospect.source?.id ?? prospect.sourceId)),
    );

    return listHasUnknown || pipelineHasUnknown;
  }, [items, pipelineProspects]);

  const filteredListItems = React.useMemo(
    () =>
      sourceFilter === 'all'
        ? items
        : items.filter((prospect) => {
            const resolvedSourceId = prospect.source?.id ?? prospect.sourceId ?? '';

            if (sourceFilter === 'none') {
              return !resolvedSourceId;
            }

            return resolvedSourceId === sourceFilter;
          }),
    [items, sourceFilter],
  );

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack alignItems="flex-start" spacing={1.5} width="100%">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          width="100%"
        >
          <Stack spacing={0.5} width="100%">
            <Typography variant="h5">{t('prospects.subtitle')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('prospects.helper')}
            </Typography>
          </Stack>

          <Stack
            alignItems="center"
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            spacing={1}
            width={{ xs: '100%', md: 'auto' }}
          >
            <Button
              color="error"
              onClick={() => handleCreateProspect(ProspectStatusEnum.LEAD)}
              startIcon={<AddIcon fontSize="small" />}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, flexShrink: 0 }}
              variant="contained"
            >
              {t('prospects.actions.create_lead')}
            </Button>

            <FormControl
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 220 }, flexShrink: 0 }}
            >
              <InputLabel id="prospects-source-filter-label">
                {t('prospects.workflow.summary.filters.label')}
              </InputLabel>
              <Select
                labelId="prospects-source-filter-label"
                label={t('prospects.workflow.summary.filters.label')}
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(event.target.value as ProspectSourceFilterValue)
                }
                fullWidth
              >
                <MenuItem value="all">{t('prospects.workflow.summary.filters.all_sources')}</MenuItem>
                {hasUnassignedSource ? (
                  <MenuItem value="none">{t('prospects.workflow.summary.filters.none_source')}</MenuItem>
                ) : null}
                {sourceOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              color="error"
              onClick={handleRefresh}
              startIcon={<RefreshIcon fontSize="small" />}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, flexShrink: 0 }}
              variant="contained"
            >
              {t('prospects.workflow.summary.actions.refresh')}
            </Button>
          </Stack>
        </Stack>

        <Stack alignItems="center" spacing={1} width="100%">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              alignSelf: 'center',
              bgcolor: 'grey.100',
              p: 0.5,
              borderRadius: 2,
              minHeight: 48,
              '.MuiTabs-indicator': { display: 'none' },
            }}
            centered
          >
            <Tab
              value="list"
              icon={<PersonOutlineOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label={t('prospects.tabs.list')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 44,
                minWidth: 140,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: 'common.white',
                '&:not(:last-of-type)': { mr: 0.5 },
                '&.Mui-selected': {
                  color: 'common.white',
                  bgcolor: 'error.main',
                  borderColor: 'error.main',
                },
              }}
            />
            <Tab
              value="pipeline"
              icon={<QueryStatsOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label={t('prospects.tabs.pipeline')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 44,
                minWidth: 140,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: 'common.white',
                '&:not(:last-of-type)': { mr: 0.5 },
                '&.Mui-selected': {
                  color: 'common.white',
                  bgcolor: 'error.main',
                  borderColor: 'error.main',
                },
              }}
            />
          </Tabs>
        </Stack>
      </Stack>

      {activeTab === 'list' ? (
        <>
          <ProspectList
            prospects={filteredListItems}
            loading={loading}
            metrics={listMetrics}
            metricsLoading={listMetricsLoading}
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
          sourceFilter={sourceFilter}
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
