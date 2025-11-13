// src/components/nutrition/MealPlanCloneDialog.tsx
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
import { UserType } from '@src/commons/enums';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';
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

type CloneAction = 'copy' | 'copy_and_open';

export interface MealPlanCloneDialogProps {
  open: boolean;
  mealPlan: MealPlan;
  onClose: () => void;
  onClone?: (
    mealPlan: MealPlan,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
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

function formatAthleteLabel({ first_name, last_name, email }: AthleteOption): string {
  const displayName = [first_name, last_name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email;
}

/** Dialog allowing coaches to duplicate a meal plan with a new label and athlete. */
export function MealPlanCloneDialog({
  open,
  mealPlan,
  onClose,
  onClone,
  onSubmittingChange,
}: MealPlanCloneDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [cloneLabel, setCloneLabel] = React.useState('');
  const [cloneError, setCloneError] = React.useState<string | null>(null);
  const [cloneLabelError, setCloneLabelError] = React.useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = React.useState(false);
  const [activeCloneAction, setActiveCloneAction] = React.useState<CloneAction | null>(null);
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteOption | null>(null);
  const [athleteInputValue, setAthleteInputValue] = React.useState('');
  const [rawAthleteOptions, setRawAthleteOptions] = React.useState<AthleteOption[]>([]);
  const [athletesLoading, setAthletesLoading] = React.useState(false);
  const [athleteQuery, setAthleteQuery] = React.useState('');
  const debouncedAthleteQuery = useDebouncedValue(athleteQuery, 300);

  const mealPlanAthleteOption = React.useMemo<AthleteOption | null>(() => {
    if (!mealPlan.athlete) {
      return null;
    }

    return {
      id: mealPlan.athlete.id,
      email: mealPlan.athlete.email,
      first_name: mealPlan.athlete.first_name ?? null,
      last_name: mealPlan.athlete.last_name ?? null,
    };
  }, [mealPlan.athlete]);

  const mergedAthleteOptions = React.useMemo(() => {
    const dedup = new Map<string, AthleteOption>();

    rawAthleteOptions.forEach((option) => {
      dedup.set(option.id, option);
    });

    if (mealPlanAthleteOption) {
      dedup.set(mealPlanAthleteOption.id, mealPlanAthleteOption);
    }

    if (selectedAthlete) {
      dedup.set(selectedAthlete.id, selectedAthlete);
    }

    return Array.from(dedup.values());
  }, [mealPlanAthleteOption, rawAthleteOptions, selectedAthlete]);

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
              type: UserType.Athlete,
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
      setActiveCloneAction(null);
      setSelectedAthlete(null);
      setAthleteInputValue('');
      setAthleteQuery('');
      setRawAthleteOptions([]);
      setAthletesLoading(false);
      return;
    }

    const copySuffix = t('nutrition-coach.list.clone_dialog.copy_suffix');
    const baseLabel = mealPlan.label?.trim() ?? '';
    const nextLabel = baseLabel.length > 0 ? `${baseLabel} ${copySuffix}`.trim() : copySuffix;

    setCloneLabel(nextLabel);
    setCloneError(null);
    setCloneLabelError(null);
    setSelectedAthlete(mealPlanAthleteOption);
    setAthleteInputValue(
      mealPlanAthleteOption ? formatAthleteLabel(mealPlanAthleteOption) : '',
    );
    setAthleteQuery('');
  }, [mealPlan.label, mealPlanAthleteOption, open, t]);

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
        setCloneLabelError(t('nutrition-coach.list.clone_dialog.errors.missing_label'));
        return;
      }

      setActiveCloneAction(openBuilder ? 'copy_and_open' : 'copy');
      setCloneLoading(true);
      try {
        setCloneError(null);
        setCloneLabelError(null);
        await onClone(mealPlan, {
          label: trimmedLabel,
          athleteId: selectedAthlete?.id ?? null,
          openBuilder,
        });
        onClose();
      } catch (error: unknown) {
        setCloneError(error instanceof Error ? error.message : t('common.unexpected_error'));
      } finally {
        setActiveCloneAction(null);
        setCloneLoading(false);
      }
    },
    [cloneLoading, onClone, mealPlan, selectedAthlete, cloneLabel, t, onClose],
  );

  const handleAthleteSelection = React.useCallback((_: unknown, option: AthleteOption | null) => {
    setSelectedAthlete(option);
  }, []);

  const handleAthleteInputChange = React.useCallback((_: unknown, value: string) => {
    setAthleteInputValue(value);
    setAthleteQuery(value);
  }, []);

  const cloneDialogTitle = t('nutrition-coach.list.clone_dialog.title');
  const cloneDialogDescription = t('nutrition-coach.list.clone_dialog.description');
  const cloneDialogNameLabel = t('nutrition-coach.list.clone_dialog.fields.name');
  const cloneDialogNamePlaceholder = t(
    'nutrition-coach.list.clone_dialog.fields.name_placeholder',
  );
  const cloneDialogAthleteLabel = t('nutrition-coach.list.clone_dialog.fields.athlete');
  const cloneDialogAthletePlaceholder = t(
    'nutrition-coach.list.clone_dialog.fields.athlete_placeholder',
  );
  const cloneDialogNoResults = t('nutrition-coach.list.clone_dialog.no_results');
  const cloneDialogCancel = t('nutrition-coach.list.clone_dialog.actions.cancel');
  const cloneDialogCopy = t('nutrition-coach.list.clone_dialog.actions.copy');
  const cloneDialogCopyAndOpen = t('nutrition-coach.list.clone_dialog.actions.copy_and_open');
  const cloneDialogCopying = t('nutrition-coach.list.clone_dialog.actions.copying');
  const cloneDialogCopyingAndOpen = t(
    'nutrition-coach.list.clone_dialog.actions.copying_and_opening',
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
      <Button onClick={handleDialogClose} disabled={cloneLoading} color="inherit">
        {cloneDialogCancel}
      </Button>
      <Button type="submit" variant="contained" color="success" disabled={cloneLoading}>
        {cloneLoading && activeCloneAction === 'copy' ? cloneDialogCopying : cloneDialogCopy}
      </Button>
      <Button
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
        {/* General information */}
        <Stack spacing={1.5}>
          <TextField
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
            fullWidth
          />

          <Autocomplete
            value={selectedAthlete}
            options={mergedAthleteOptions}
            getOptionLabel={formatAthleteLabel}
            onChange={handleAthleteSelection}
            inputValue={athleteInputValue}
            onInputChange={handleAthleteInputChange}
            loading={athletesLoading}
            noOptionsText={cloneDialogNoResults}
            disabled={cloneLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={cloneDialogAthleteLabel}
                placeholder={cloneDialogAthletePlaceholder}
                fullWidth
              />
            )}
          />
        </Stack>

        {cloneError && (
          <Typography color="error" variant="body2">
            {cloneError}
          </Typography>
        )}
      </Stack>
    </ProgramDialogLayout>
  );
}
