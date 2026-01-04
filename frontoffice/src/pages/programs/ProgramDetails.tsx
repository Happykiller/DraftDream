// src/pages/ProgramDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';

import { ProgramViewContent } from '@src/components/programs/ProgramViewContent';
import { formatProgramDate } from '@src/components/programs/programFormatting';
import { getProgramAthleteLabel, type ProgramViewTab } from '@src/components/programs/programViewUtils';

import { useProgram } from '@src/hooks/programs/useProgram';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

import type { ProgramDetailsLoaderData } from './ProgramDetails.loader';
import { TextWithTooltip } from '@src/components/common/TextWithTooltip';

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

    return athleteLabel || '';
  }, [program]);

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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}>
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
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <TextWithTooltip
                tooltipTitle={program ? program.label : detailCopy.generic_title}
                variant="h6"
                sx={{
                  fontWeight: 700
                }}
              />
              {programSubtitle ? (
                <TextWithTooltip
                  tooltipTitle={programSubtitle}
                  variant="body2"
                  color="text.secondary"
                />
              ) : null}
            </Box>
          </Stack>

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

              <ResponsiveButton
                variant="contained"
                color="primary"
                onClick={handleBackToList}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {detailCopy.back_to_list}
              </ResponsiveButton>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}