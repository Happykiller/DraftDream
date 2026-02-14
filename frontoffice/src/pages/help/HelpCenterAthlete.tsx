import * as React from 'react';
import {
  Box,
  Chip,
  Grid,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@components/common/GlassCard';

interface HelpCenterSection {
  key: string;
  title: string;
  badge?: string;
  description?: string;
  steps?: string[];
  note?: string;
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/** Convert plain text containing one support email into a clickable mailto link. */
function renderTextWithEmail(value: string): React.ReactNode {
  const match = value.match(EMAIL_PATTERN);
  if (!match || match.index === undefined) {
    return value;
  }

  const email = match[0];
  const start = match.index;
  const end = start + email.length;

  return (
    <>
      {value.slice(0, start)}
      <Link href={`mailto:${email}`} underline="hover">
        {email}
      </Link>
      {value.slice(end)}
    </>
  );
}

/** Athlete-oriented help center view rendered as numbered help cards. */
export function HelpCenterAthlete(): React.JSX.Element {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const sections = t('help_center.athlete.cards', { returnObjects: true }) as HelpCenterSection[];
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredSections = React.useMemo(
    () =>
      sections.filter((section) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchableContent = [
          section.title,
          section.badge,
          section.description,
          ...(section.steps ?? []),
          section.note,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();

        return searchableContent.includes(normalizedQuery);
      }),
    [normalizedQuery, sections],
  );

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">
          {t('help_center.athlete.subtitle')}
        </Typography>
      </Stack>

      <TextField
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={t('help_center.labels.search_placeholder')}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {!filteredSections.length ? (
        <Typography color="text.secondary" variant="body2">
          {t('help_center.labels.empty_results')}
        </Typography>
      ) : null}

      <Grid container spacing={2}>
        {filteredSections.map((section, index) => {
          const cardNumber = index + 1;

          return (
            <Grid key={section.key} size={{ xs: 12, md: 6 }}>
              <GlassCard accentColor="#7b1fa2" sx={{ height: '100%' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      color="secondary"
                      variant="outlined"
                      label={section.badge || t('help_center.labels.athlete_section')}
                    />
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={t('help_center.labels.sheet_number', {
                        number: String(cardNumber).padStart(2, '0'),
                      })}
                    />
                  </Stack>

                  <Typography variant="h6">{section.title}</Typography>

                  {section.description ? (
                    <Typography color="text.secondary" variant="body2">
                      {renderTextWithEmail(section.description)}
                    </Typography>
                  ) : null}

                  {section.steps?.length ? (
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {section.steps.map((step) => (
                        <Typography key={step} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {renderTextWithEmail(step)}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}

                  {section.note ? (
                    <Typography color="text.secondary" variant="caption">
                      {renderTextWithEmail(section.note)}
                    </Typography>
                  ) : null}
                </Stack>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
