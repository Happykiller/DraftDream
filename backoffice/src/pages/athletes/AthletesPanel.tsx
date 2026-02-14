import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useCoachAthletes } from '@hooks/useCoachAthletes';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';
import { CoachAthleteDialog, type CoachAthleteDialogValues, type CoachAthleteUserOption } from '@components/athletes/CoachAthleteDialog';
import { CoachAthleteTable } from '@components/athletes/CoachAthleteTable';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

const mapUserOption = (user: { id: string; email: string; first_name: string; last_name: string }): CoachAthleteUserOption => {
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return { id: user.id, email: user.email, fullName: fullName || user.email };
};

export function AthletesPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('athl');
  const [coachFilter, setCoachFilter] = React.useState<CoachAthleteUserOption | null>(null);
  const [athleteFilter, setAthleteFilter] = React.useState<CoachAthleteUserOption | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [includeArchived, setIncludeArchived] = React.useState(false);

  const isActiveParam = React.useMemo(() => {
    if (statusFilter === 'active') return true;
    if (statusFilter === 'inactive') return false;
    return null;
  }, [statusFilter]);

  const { items, total, loading, create, update, remove, reload } = useCoachAthletes({
    page,
    limit,
    coachId: coachFilter?.id,
    athleteId: athleteFilter?.id,
    isActive: isActiveParam,
    includeArchived,
  });

  const { items: coachItems } = useUsers({ page: 1, limit: 200, q: '', type: 'coach' });
  const { items: athleteItems } = useUsers({ page: 1, limit: 200, q: '', type: 'athlete' });

  const coachOptions = React.useMemo(() => coachItems.map(mapUserOption), [coachItems]);
  const athleteOptions = React.useMemo(() => athleteItems.map(mapUserOption), [athleteItems]);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const editing = React.useMemo(() => items.find((link) => link.id === editId) ?? null, [items, editId]);
  const deleting = React.useMemo(() => items.find((link) => link.id === deleteId) ?? null, [items, deleteId]);

  const handleCreate = async (values: CoachAthleteDialogValues) => {
    if (!values.coach || !values.athlete || !values.startDate) {
      throw new Error('Missing required fields');
    }
    await create({
      coachId: values.coach.id,
      athleteId: values.athlete.id,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      note: values.note ? values.note : undefined,
      is_active: values.is_active,
    });
  };

  const handleUpdate = async (values: CoachAthleteDialogValues) => {
    if (!editId) return;
    await update({
      id: editId,
      coachId: values.coach?.id,
      athleteId: values.athlete?.id,
      startDate: values.startDate,
      endDate: values.endDate === '' ? null : values.endDate || undefined,
      note: values.note === '' ? null : values.note || undefined,
      is_active: values.is_active,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
    } finally {
      setDeleteId(null);
    }
  };

  const resetPage = () => setPage(1);

  const coachLabel = deleting?.coach
    ? `${deleting.coach.first_name} ${deleting.coach.last_name}`.trim()
    : deleting?.coachId ?? t('common.messages.no_value');
  const athleteLabel = deleting?.athlete
    ? `${deleting.athlete.first_name} ${deleting.athlete.last_name}`.trim()
    : deleting?.athleteId ?? t('common.messages.no_value');

  return (
    <Box>
      {/* General information */}
      <CoachAthleteTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        coachOptions={coachOptions}
        athleteOptions={athleteOptions}
        coachFilter={coachFilter}
        athleteFilter={athleteFilter}
        statusFilter={statusFilter}
        includeArchived={includeArchived}
        onCoachFilterChange={(value) => {
          setCoachFilter(value);
          resetPage();
        }}
        onAthleteFilterChange={(value) => {
          setAthleteFilter(value);
          resetPage();
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          resetPage();
        }}
        onIncludeArchivedChange={(value) => {
          setIncludeArchived(value);
          resetPage();
        }}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRefresh={() => {
          void reload();
        }}
      />

      <CoachAthleteDialog
        open={openCreate}
        mode="create"
        coachOptions={coachOptions}
        athleteOptions={athleteOptions}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />

      <CoachAthleteDialog
        open={Boolean(editId)}
        mode="edit"
        initial={editing ?? undefined}
        coachOptions={coachOptions}
        athleteOptions={athleteOptions}
        onClose={() => setEditId(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('athletes.confirm.delete_title')}
        message={t('athletes.confirm.delete_message', {
          coach: coachLabel,
          athlete: athleteLabel,
        })}
        confirmLabel={t('athletes.confirm.delete_confirm')}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
