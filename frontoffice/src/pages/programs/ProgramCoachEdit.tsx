// src/pages/ProgramCoachEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Stack } from '@mui/material';
import { type LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router-dom';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';

import { useProgram } from '@src/hooks/useProgram';
import { type Program } from '@src/hooks/usePrograms';
import { programGet } from '@src/services/graphql/programs.service';

export type ProgramCoachEditLoaderStatus = 'success' | 'not_found' | 'error';

export interface ProgramCoachEditLoaderData {
  program: Program | null;
  status: ProgramCoachEditLoaderStatus;
}

/** Ensures the target program is loaded before rendering the edit builder. */
export async function programCoachEditLoader({
  params,
}: LoaderFunctionArgs): Promise<ProgramCoachEditLoaderData> {
  const programId = params.programId;

  if (!programId) {
    return { program: null, status: 'not_found' };
  }

  try {
    const program = await programGet({ programId });

    if (!program) {
      return { program: null, status: 'not_found' };
    }

    return { program, status: 'success' };
  } catch (error) {
    console.error('[ProgramCoachEditLoader] Failed to fetch program', error);
    return { program: null, status: 'error' };
  }
}

/** Program editing flow dedicated to coaches. */
export function ProgramCoachEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const loaderData = useLoaderData() as ProgramCoachEditLoaderData;

  const builderCopy = React.useMemo(
    () =>
      t('programs-coatch.builder', {
        returnObjects: true,
      }) as unknown as BuilderCopy,
    [t],
  );

  const initialError = React.useMemo(() => {
    if (loaderData.status === 'not_found') {
      return t('programs-details.errors.not_found');
    }

    if (loaderData.status === 'error') {
      return t('programs-details.errors.load_failed');
    }

    return null;
  }, [loaderData.status, t]);

  const { program, loading, error, reload } = useProgram({
    programId,
    initialProgram: loaderData.program,
    initialError,
  });

  const handleCancel = React.useCallback(() => {
    navigate('/programs-coach');
  }, [navigate]);

  const handleRetry = React.useCallback(() => {
    if (!programId) {
      return;
    }

    void reload();
  }, [programId, reload]);

  if (loading) {
    return (
      <>
        {/* General information */}
      </>
    );
  }

  if (!program || error) {
    return (
      <Stack spacing={3} sx={{ width: '100%', mt: 4, px: { xs: 2, md: 4 } }}>
        {/* General information */}
        <Alert severity="error">{error ?? t('programs-details.errors.load_failed')}</Alert>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRetry}
            disabled={!programId}
          >
            {t('common.actions.retry')}
          </Button>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            {t('programs-coatch.view.actions.back_to_list')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <>
      {/* General information */}
      <ProgramBuilderPanel
        builderCopy={builderCopy}
        onCancel={handleCancel}
        program={program}
      />
    </>
  );
}
