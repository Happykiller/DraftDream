// src/pages/ProgramsAthlete.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { type LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router-dom';

import { ProgramList } from '@src/components/programs/ProgramList';
import { ProgramViewContent } from '@src/components/programs/ProgramViewContent';
import { formatProgramDate } from '@src/components/programs/programFormatting';
import { getProgramAthleteLabel, type ProgramViewTab } from '@src/components/programs/programViewUtils';
import { useProgram } from '@src/hooks/useProgram';
import { type Program, usePrograms } from '@src/hooks/usePrograms';
import { programGet } from '@src/services/graphql/programs.service';
import { session } from '@stores/session';

export type ProgramsAthleteLoaderStatus = 'idle' | 'success' | 'not_found' | 'error';

export interface ProgramsAthleteLoaderData {
  program: Program | null;
  status: ProgramsAthleteLoaderStatus;
}

/**
 * Loader ensuring program details are fetched before rendering the athlete view.
 */
export async function programsAthleteLoader({
  params,
}: LoaderFunctionArgs): Promise<ProgramsAthleteLoaderData> {
  const programId = params.programId;

  if (!programId) {
    return { program: null, status: 'idle' };
  }

  try {
    const program = await programGet({ programId });

    if (!program) {
      return { program: null, status: 'not_found' };
    }

    return { program, status: 'success' };
  } catch (error) {
    console.error('[ProgramsAthleteLoader] Failed to fetch program', error);
    return { program: null, status: 'error' };
  }
}

type AthleteEmptyStateCopy = {
  title: string;
  description: string;
  helper: string;
};

/** Athlete-facing list of assigned training programs. */
export function ProgramsAthlete(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const athleteId = session((state) => state.id);
  const navigate = useNavigate();
  const { programId } = useParams<{ programId?: string }>();
  const loaderData = useLoaderData() as ProgramsAthleteLoaderData;
  const [activeTab, setActiveTab] = React.useState<ProgramViewTab>('overview');

  const initialError = React.useMemo(() => {
    if (!programId) {
      return null;
    }

    if (loaderData.status === 'not_found') {
      return t('programs-athlete.errors.not_found');
    }

    if (loaderData.status === 'error') {
      return t('programs-athlete.errors.load_failed');
    }

    return null;
  }, [loaderData.status, programId, t]);

  const { program, loading: programLoading, error: programError } = useProgram({
    programId,
    initialProgram: loaderData.program,
    initialError,
  });

  const emptyStateCopy = t('programs-athlete.empty_state', {
    returnObjects: true,
  }) as AthleteEmptyStateCopy;

  const { items: programs, loading: listLoading } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
    userId: athleteId ?? undefined,
  });

  const handleCloseProgram = React.useCallback(() => {
    navigate('/programs-athlete');
  }, [navigate]);

  const handleNavigateToProgram = React.useCallback(
    (nextProgram: Program) => {
      navigate(`/programs-athlete/${nextProgram.id}`);
      setActiveTab('overview');
    },
    [navigate],
  );

  const handleTabChange = React.useCallback((tab: ProgramViewTab) => {
    setActiveTab(tab);
  }, []);

  const programCreatedOn = React.useMemo(() => {
    if (!program) {
      return '';
    }

    return formatProgramDate(program.createdAt, i18n.language);
  }, [i18n.language, program]);

  const programUpdatedOn = React.useMemo(() => {
    if (!program) {
      return '';
    }

    return t('programs-coatch.list.updated_on', {
      date: formatProgramDate(program.updatedAt, i18n.language),
    });
  }, [i18n.language, program, t]);

  const programSubtitle = React.useMemo(() => {
    if (!program) {
      return t('programs-athlete.subtitle');
    }

    const athleteLabel = getProgramAthleteLabel(program);

    return athleteLabel
      ? t('programs-coatch.view.dialog.subtitle_with_athlete', {
          athlete: athleteLabel,
          date: programCreatedOn,
        })
      : t('programs-coatch.view.dialog.subtitle_without_athlete', {
          date: programCreatedOn,
        });
  }, [program, programCreatedOn, t]);

  React.useEffect(() => {
    setActiveTab('overview');
  }, [programId]);

  const showDetail = Boolean(programId);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      {showDetail ? (
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {program ? program.label : t('programs-athlete.title')}
              </Typography>
              <Typography color="text.secondary">{programSubtitle}</Typography>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBack fontSize="small" />}
              onClick={handleCloseProgram}
            >
              {t('programs-athlete.actions.back_to_list')}
            </Button>
          </Stack>

          {programLoading && (
            <Stack alignItems="center" py={6}>
              <CircularProgress color="primary" />
            </Stack>
          )}

          {!programLoading && programError && <Alert severity="error">{programError}</Alert>}

          {!programLoading && program && (
            <ProgramViewContent
              program={program}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              updatedOnLabel={programUpdatedOn}
            />
          )}
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {t('programs-athlete.title')}
            </Typography>
            <Typography color="text.secondary">{t('programs-athlete.subtitle')}</Typography>
          </Stack>

          <ProgramList
            programs={programs}
            loading={listLoading}
            placeholderTitle={emptyStateCopy.title}
            placeholderSubtitle={emptyStateCopy.description}
            placeholderHelper={emptyStateCopy.helper}
            allowedActions={['view']}
            onViewProgram={handleNavigateToProgram}
          />
        </Stack>
      )}
    </Stack>
  );
}
