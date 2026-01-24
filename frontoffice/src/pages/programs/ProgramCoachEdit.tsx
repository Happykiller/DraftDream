// src/pages/ProgramCoachEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Stack,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useNavigate, useParams } from 'react-router-dom';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';

import { useProgram } from '@src/hooks/programs/useProgram';

/** Program editing flow dedicated to coaches. */
export function ProgramCoachEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();

  const builderCopy = React.useMemo(
    () =>
      t('programs-coatch.builder', {
        returnObjects: true,
      }) as unknown as BuilderCopy,
    [t],
  );

  React.useEffect(() => {
    document.title = t('programs-coatch.builder.header.page_title_edit');
  }, [t]);

  const { program, loading, error, reload } = useProgram({ programId });

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
          <ResponsiveButton
            variant="contained"
            color="primary"
            onClick={handleRetry}
            disabled={!programId}
          >
            {t('common.actions.retry')}
          </ResponsiveButton>
          <ResponsiveButton variant="outlined" color="primary" onClick={handleCancel}>
            {t('programs-coatch.view.actions.back_to_list')}
          </ResponsiveButton>
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