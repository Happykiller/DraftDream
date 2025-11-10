// src/pages/ProgramDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Visibility } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { type LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from 'react-router-dom';

import { ProgramViewContent } from '@src/components/programs/ProgramViewContent';
import { formatProgramDate } from '@src/components/programs/programFormatting';
import { getProgramAthleteLabel, type ProgramViewTab } from '@src/components/programs/programViewUtils';

import { useProgram } from '@src/hooks/programs/useProgram';
import { type Program } from '@src/hooks/programs/usePrograms';
import { programGet } from '@src/services/graphql/programs.service';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

export type ProgramDetailsLoaderStatus = 'success' | 'not_found' | 'error';

export interface ProgramDetailsLoaderData {
  program: Program | null;
  status: ProgramDetailsLoaderStatus;
}

/**
 * Loader ensuring program details are fetched before rendering the detail page.
 */
export async function programDetailsLoader({
  params,
}: LoaderFunctionArgs): Promise<ProgramDetailsLoaderData> {
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
    console.error('[ProgramDetailsLoader] Failed to fetch program', error);
    return { program: null, status: 'error' };
  }
}

type ProgramDetailsCopy = {
  back_to_list: string;
  generic_title: string;
};

/** Shared program detail view for both coaches and athletes. */
export function ProgramDetails(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { programId } = useParams<{ programId: string }>();
  const loaderData = useLoaderData() as ProgramDetailsLoaderData;
  const role = session((state) => state.role);
  const [activeTab, setActiveTab] = React.useState<ProgramViewTab>('overview');

  const detailCopy = React.useMemo<ProgramDetailsCopy>(() => {
    if (role === UserType.Athlete) {
      return {
        back_to_list: t('programs-athlete.actions.back_to_list'),
        generic_title: t('programs-athlete.title'),
      };
    }

    return {
      back_to_list: t('programs-coatch.view.actions.back_to_list'),
      generic_title: t('programs-coatch.title'),
    };
  }, [role, t]);

  const initialError = React.useMemo(() => {
    if (loaderData.status === 'not_found') {
      return t('programs-details.errors.not_found');
    }

    if (loaderData.status === 'error') {
      return t('programs-details.errors.load_failed');
    }

    return null;
  }, [loaderData.status, t]);

  const { program, loading, error } = useProgram({
    programId,
    initialProgram: loaderData.program,
    initialError,
  });

  const programSubtitle = React.useMemo(() => {
    if (!program) {
      return '';
    }

    const athleteLabel = getProgramAthleteLabel(program);
    const createdOn = formatProgramDate(program.createdAt, i18n.language);

    return athleteLabel
      ? t('programs-coatch.view.dialog.subtitle_with_athlete', { athlete: athleteLabel, date: createdOn })
      : t('programs-coatch.view.dialog.subtitle_without_athlete', { date: createdOn });
  }, [i18n.language, program, t]);

  const programUpdatedOn = React.useMemo(() => {
    if (!program) {
      return '';
    }

    return t('programs-coatch.list.updated_on', {
      date: formatProgramDate(program.updatedAt, i18n.language),
    });
  }, [i18n.language, program, t]);

  React.useEffect(() => {
    setActiveTab('overview');
  }, [programId]);

  const handleBackToList = React.useCallback(() => {
    if (role === UserType.Athlete) {
      navigate('/programs-athlete');
      return;
    }

    navigate('/programs-coach');
  }, [navigate, role]);

  const handleTabChange = React.useCallback((tab: ProgramViewTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <Stack
      sx={{
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        height: '100%',
        flex: 1,
        overflow: 'hidden',
        bgcolor: theme.palette.backgroundColor,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            bgcolor: theme.palette.backgroundColor,
          }}
        >
          {/* General information */}
          <Box
            component="header"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 10px 20px rgba(25, 118, 210, 0.24)',
                }}
              >
                <Visibility fontSize="medium" />
              </Box>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  noWrap
                >
                  {program ? program.label : detailCopy.generic_title}
                </Typography>
                {programSubtitle ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {programSubtitle}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              p: 0,
              '&:last-child': {
                pb: 0,
              },
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
              <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3.5 } }}>
                {loading ? null : (
                  <Stack spacing={3}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {program ? (
                      <ProgramViewContent
                        program={program}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        updatedOnLabel={programUpdatedOn}
                      />
                    ) : null}
                  </Stack>
                )}
              </Box>
            </Box>
          </CardContent>

          <Divider />

          <Box
            component="footer"
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              {programUpdatedOn ? (
                <Typography variant="caption" color="text.secondary">
                  {programUpdatedOn}
                </Typography>
              ) : (
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToList}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {detailCopy.back_to_list}
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}
