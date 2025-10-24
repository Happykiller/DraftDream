import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';

import inversify from '@src/commons/inversify';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import type { Program, ProgramUser } from '@src/hooks/usePrograms';
import { GraphqlServiceFetch } from '@src/services/graphql/graphql.service.fetch';
import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

interface AthleteOption {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

interface AthleteListPayload {
  user_list: {
    items: AthleteOption[];
  };
}

export interface ProgramCloneDialogProps {
  open: boolean;
  program: Program;
  onClose: () => void;
  onClone?: (program: Program, payload: { label: string; athleteId: string | null }) => Promise<void>;
  onSubmittingChange?: (submitting: boolean) => void;
}

const ATHLETE_CACHE = new Map<string, AthleteOption[]>();

const LIST_USERS_QUERY = `
  query ListUsers($input: ListUsersInput) {
    user_list(input: $input) {
      items {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

function formatAthleteLabel({ first_name, last_name, email }: AthleteOption | ProgramUser): string {
  const displayName = [first_name, last_name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email;
}

export function ProgramCloneDialog({
  open,
  program,
  onClose,
  onClone,
  onSubmittingChange,
}: ProgramCloneDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [cloneLabel, setCloneLabel] = React.useState('');
  const [cloneError, setCloneError] = React.useState<string | null>(null);
  const [cloneLabelError, setCloneLabelError] = React.useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = React.useState(false);
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteOption | null>(null);
  const [athleteInputValue, setAthleteInputValue] = React.useState('');
  const [rawAthleteOptions, setRawAthleteOptions] = React.useState<AthleteOption[]>([]);
  const [athletesLoading, setAthletesLoading] = React.useState(false);
  const [athleteQuery, setAthleteQuery] = React.useState('');
  const debouncedAthleteQuery = useDebouncedValue(athleteQuery, 300);

  const programAthleteOption = React.useMemo<AthleteOption | null>(() => {
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
    const dedup = new Map<string, AthleteOption>();

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

  const loadAthletes = React.useCallback(
    async (search: string) => {
      const key = search.trim().toLowerCase();

      if (ATHLETE_CACHE.has(key)) {
        setRawAthleteOptions(ATHLETE_CACHE.get(key) ?? []);
        setAthletesLoading(false);
        return;
      }

      setAthletesLoading(true);
      try {
        const { data, errors } = await gql.send<AthleteListPayload>({
          query: LIST_USERS_QUERY,
          operationName: 'ListUsers',
          variables: {
            input: {
              page: 1,
              limit: 25,
              q: search.trim() || undefined,
            },
          },
        });

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        const items = data?.user_list.items ?? [];
        ATHLETE_CACHE.set(key, items);
        setRawAthleteOptions(items);
      } catch (_error) {
        setRawAthleteOptions([]);
      } finally {
        setAthletesLoading(false);
      }
    },
    [gql],
  );

  React.useEffect(() => {
    if (!open) {
      setCloneLoading(false);
      setCloneError(null);
      setCloneLabelError(null);
      setSelectedAthlete(null);
      setAthleteInputValue('');
      setAthleteQuery('');
      setRawAthleteOptions([]);
      setAthletesLoading(false);
      return;
    }

    const copySuffix = t('programs-coatch.list.clone_dialog.copy_suffix', {
      defaultValue: '(Copy)',
    });
    const baseLabel = program.label?.trim() ?? '';
    const nextLabel = baseLabel.length > 0 ? `${baseLabel} ${copySuffix}`.trim() : copySuffix;

    setCloneLabel(nextLabel);
    setCloneError(null);
    setCloneLabelError(null);
    setSelectedAthlete(programAthleteOption);
    setAthleteInputValue(programAthleteOption ? formatAthleteLabel(programAthleteOption) : '');
    setAthleteQuery('');
  }, [open, programAthleteOption, program.label, t]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    void loadAthletes(debouncedAthleteQuery);
  }, [debouncedAthleteQuery, loadAthletes, open]);

  React.useEffect(() => {
    onSubmittingChange?.(cloneLoading);
  }, [cloneLoading, onSubmittingChange]);

  const handleDialogClose = React.useCallback(() => {
    if (cloneLoading) {
      return;
    }

    onClose();
  }, [cloneLoading, onClose]);

  const handleCloneSubmit = React.useCallback(async () => {
    if (!onClone) {
      onClose();
      return;
    }

    const trimmedLabel = cloneLabel.trim();
    setCloneLabelError(null);
    if (!trimmedLabel) {
      setCloneLabelError(
        t('programs-coatch.list.clone_dialog.errors.missing_label', {
          defaultValue: 'Please provide a program name.',
        }),
      );
      return;
    }

    setCloneLoading(true);
    try {
      setCloneError(null);
      setCloneLabelError(null);
      await onClone(program, {
        label: trimmedLabel,
        athleteId: selectedAthlete?.id ?? null,
      });
      onClose();
    } catch (error: unknown) {
      setCloneError(
        error instanceof Error
          ? error.message
          : t('common.unexpected_error', { defaultValue: 'Unexpected error.' }),
      );
    } finally {
      setCloneLoading(false);
    }
  }, [onClone, program, selectedAthlete, cloneLabel, t, onClose]);

  const handleAthleteSelection = React.useCallback((_: unknown, option: AthleteOption | null) => {
    setSelectedAthlete(option);
  }, []);

  const handleAthleteInputChange = React.useCallback((_: unknown, value: string) => {
    setAthleteInputValue(value);
    setAthleteQuery(value);
  }, []);

  const cloneDialogTitle = t('programs-coatch.list.clone_dialog.title', {
    defaultValue: 'Copy the program',
  });
  const cloneDialogDescription = t('programs-coatch.list.clone_dialog.description', {
    defaultValue: 'Update the program name and athlete before duplicating.',
  });
  const cloneDialogNameLabel = t('programs-coatch.list.clone_dialog.fields.name', {
    defaultValue: 'Program name',
  });
  const cloneDialogNamePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.name_placeholder',
    {
      defaultValue: 'Ex: Summer strength plan',
    },
  );
  const cloneDialogAthleteLabel = t('programs-coatch.list.clone_dialog.fields.athlete', {
    defaultValue: 'Athlete',
  });
  const cloneDialogAthletePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.athlete_placeholder',
    {
      defaultValue: 'Select an athlete (optional)',
    },
  );
  const cloneDialogNoResults = t('programs-coatch.list.clone_dialog.no_results', {
    defaultValue: 'No athlete found',
  });
  const cloneDialogCancel = t('programs-coatch.list.clone_dialog.actions.cancel', {
    defaultValue: 'Cancel',
  });
  const cloneDialogSubmit = t('programs-coatch.list.clone_dialog.actions.submit', {
    defaultValue: 'Copy',
  });
  const cloneDialogSubmitting = t('programs-coatch.list.clone_dialog.actions.submitting', {
    defaultValue: 'Copying…',
  });

  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void handleCloneSubmit();
    },
    [handleCloneSubmit],
  );

  const dialogActions = (
    <>
      <Button onClick={handleDialogClose} disabled={cloneLoading} color="inherit">
        {cloneDialogCancel}
      </Button>
      <Button type="submit" variant="contained" color="success" disabled={cloneLoading}>
        {cloneLoading ? cloneDialogSubmitting : cloneDialogSubmit}
      </Button>
    </>
  );

  return (
    <ProgramDialogLayout
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
    </ProgramDialogLayout>
  );
}
