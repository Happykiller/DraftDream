import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import {
  formatAthleteLabel,
  type AthleteSearchOption,
  useCoachAthleteSearch,
} from '@hooks/athletes/useCoachAthleteSearch';
import type { Program, ProgramUser } from '@hooks/programs/usePrograms';
import { StandardDialog } from '@components/common/StandardDialog';

type CloneAction = 'copy' | 'copy_and_open';

export interface ProgramCloneDialogProps {
  open: boolean;
  program: Program;
  onClose: () => void;
  onClone?: (
    program: Program,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
  onSubmittingChange?: (submitting: boolean) => void;
}

function getProgramAthleteLabel(athlete: AthleteSearchOption | ProgramUser): string {
  return formatAthleteLabel({
    id: athlete.id,
    email: athlete.email,
    first_name: athlete.first_name ?? null,
    last_name: athlete.last_name ?? null,
  });
}

export function ProgramCloneDialog({
  open,
  program,
  onClose,
  onClone,
  onSubmittingChange,
}: ProgramCloneDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [cloneLabel, setCloneLabel] = React.useState('');
  const [cloneError, setCloneError] = React.useState<string | null>(null);
  const [cloneLabelError, setCloneLabelError] = React.useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = React.useState(false);
  const [activeCloneAction, setActiveCloneAction] = React.useState<CloneAction | null>(null);
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteSearchOption | null>(null);
  const [athleteInputValue, setAthleteInputValue] = React.useState('');
  const {
    options: rawAthleteOptions,
    loading: athletesLoading,
    setQuery: setAthleteQuery,
    reset: resetAthleteSearch,
  } = useCoachAthleteSearch({ enabled: open });

  const programAthleteOption = React.useMemo<AthleteSearchOption | null>(() => {
    if (!program.athlete) {
      return null;
    }

    return {
      id: program.athlete.id,
      email: program.athlete.email,
      first_name: program.athlete.first_name ?? null,
      last_name: program.athlete.last_name ?? null,
    };
  }, [program.athlete]);

  const mergedAthleteOptions = React.useMemo(() => {
    const dedup = new Map<string, AthleteSearchOption>();

    rawAthleteOptions.forEach((option) => {
      dedup.set(option.id, option);
    });

    if (programAthleteOption) {
      dedup.set(programAthleteOption.id, programAthleteOption);
    }

    if (selectedAthlete) {
      dedup.set(selectedAthlete.id, selectedAthlete);
    }

    return Array.from(dedup.values());
  }, [programAthleteOption, rawAthleteOptions, selectedAthlete]);

  React.useEffect(() => {
    if (!open) {
      setCloneLoading(false);
      setCloneError(null);
      setCloneLabelError(null);
      setActiveCloneAction(null);
      setSelectedAthlete(null);
      setAthleteInputValue('');
      setAthleteQuery('');
      resetAthleteSearch();
      return;
    }

    const copySuffix = t('programs-coatch.list.clone_dialog.copy_suffix');
    const baseLabel = program.label?.trim() ?? '';
    const nextLabel = baseLabel.length > 0 ? `${baseLabel} ${copySuffix}`.trim() : copySuffix;

    setCloneLabel(nextLabel);
    setCloneError(null);
    setCloneLabelError(null);
    setSelectedAthlete(programAthleteOption);
    setAthleteInputValue(programAthleteOption ? getProgramAthleteLabel(programAthleteOption) : '');
    setAthleteQuery('');
  }, [open, programAthleteOption, program.label, resetAthleteSearch, setAthleteQuery, t]);

  React.useEffect(() => {
    onSubmittingChange?.(cloneLoading);
  }, [cloneLoading, onSubmittingChange]);

  const handleDialogClose = React.useCallback(() => {
    if (cloneLoading) {
      return;
    }

    onClose();
  }, [cloneLoading, onClose]);

  const handleCloneSubmit = React.useCallback(
    async (openBuilder: boolean) => {
      if (cloneLoading) {
        return;
      }

      if (!onClone) {
        onClose();
        return;
      }

      const trimmedLabel = cloneLabel.trim();
      setCloneLabelError(null);
      if (!trimmedLabel) {
        setCloneLabelError(t('programs-coatch.list.clone_dialog.errors.missing_label'));
        return;
      }

      setActiveCloneAction(openBuilder ? 'copy_and_open' : 'copy');
      setCloneLoading(true);
      try {
        setCloneError(null);
        setCloneLabelError(null);
        await onClone(program, {
          label: trimmedLabel,
          athleteId: selectedAthlete?.id ?? null,
          openBuilder,
        });
        onClose();
      } catch (error: unknown) {
        setCloneError(
          error instanceof Error ? error.message : t('common.unexpected_error'),
        );
      } finally {
        setActiveCloneAction(null);
        setCloneLoading(false);
      }
    },
    [cloneLoading, onClone, program, selectedAthlete, cloneLabel, t, onClose],
  );

  const handleAthleteSelection = React.useCallback((_: unknown, option: AthleteSearchOption | null) => {
    setSelectedAthlete(option);
  }, []);

  const handleAthleteInputChange = React.useCallback((_: unknown, value: string) => {
    setAthleteInputValue(value);
    setAthleteQuery(value);
  }, [setAthleteQuery]);

  const cloneDialogTitle = t('programs-coatch.list.clone_dialog.title');
  const cloneDialogDescription = t('programs-coatch.list.clone_dialog.description');
  const cloneDialogNameLabel = t('programs-coatch.list.clone_dialog.fields.name');
  const cloneDialogNamePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.name_placeholder',
  );
  const cloneDialogAthleteLabel = t('programs-coatch.list.clone_dialog.fields.athlete');
  const cloneDialogAthletePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.athlete_placeholder',
  );
  const cloneDialogNoResults = t('programs-coatch.list.clone_dialog.no_results');
  const cloneDialogCancel = t('programs-coatch.list.clone_dialog.actions.cancel');
  const cloneDialogCopy = t('programs-coatch.list.clone_dialog.actions.copy');
  const cloneDialogCopyAndOpen = t('programs-coatch.list.clone_dialog.actions.copy_and_open');
  const cloneDialogCopying = t('programs-coatch.list.clone_dialog.actions.copying');
  const cloneDialogCopyingAndOpen = t(
    'programs-coatch.list.clone_dialog.actions.copying_and_opening',
  );

  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void handleCloneSubmit(false);
    },
    [handleCloneSubmit],
  );

  const dialogActions = (
    <>
      <ResponsiveButton onClick={handleDialogClose} disabled={cloneLoading} color="inherit">
        {cloneDialogCancel}
      </ResponsiveButton>
      <ResponsiveButton type="submit" variant="contained" color="success" disabled={cloneLoading}>
        {cloneLoading && activeCloneAction === 'copy' ? cloneDialogCopying : cloneDialogCopy}
      </ResponsiveButton>
      <ResponsiveButton
        type="button"
        variant="contained"
        color="primary"
        disabled={cloneLoading}
        onClick={() => {
          void handleCloneSubmit(true);
        }}
      >
        {cloneLoading && activeCloneAction === 'copy_and_open'
          ? cloneDialogCopyingAndOpen
          : cloneDialogCopyAndOpen}
      </ResponsiveButton>
    </>
  );

  return (
    <StandardDialog
      open={open}
      onClose={handleDialogClose}
      icon={<ContentCopy fontSize="large" />}
      title={cloneDialogTitle}
      description={cloneDialogDescription}
      dialogProps={{ maxWidth: 'sm' }}
      formComponent="form"
      formProps={{ onSubmit: handleFormSubmit, noValidate: true }}
      actions={dialogActions}
    >
      <Stack spacing={3}>
        {/* General information */}
        {/* Program name */}
        <TextField
          autoFocus
          fullWidth
          label={cloneDialogNameLabel}
          placeholder={cloneDialogNamePlaceholder}
          value={cloneLabel}
          onChange={(event) => {
            setCloneLabel(event.target.value);
            if (cloneLabelError) {
              setCloneLabelError(null);
            }
          }}
          error={Boolean(cloneLabelError)}
          helperText={cloneLabelError ?? ' '}
          disabled={cloneLoading}
        />
        {/* Athlete selection */}
        <Autocomplete
          options={mergedAthleteOptions}
          value={selectedAthlete}
          onChange={handleAthleteSelection}
          inputValue={athleteInputValue}
          onInputChange={handleAthleteInputChange}
          loading={athletesLoading}
          getOptionLabel={(option) => formatAthleteLabel(option)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          clearOnBlur={false}
          handleHomeEndKeys
          noOptionsText={cloneDialogNoResults}
          disabled={cloneLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={cloneDialogAthleteLabel}
              placeholder={cloneDialogAthletePlaceholder}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        {/* Error message */}
        {cloneError && (
          <Typography variant="body2" color="error">
            {cloneError}
          </Typography>
        )}
      </Stack>
    </StandardDialog>
  );
}
