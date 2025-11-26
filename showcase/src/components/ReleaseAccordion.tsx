import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { type SyntheticEvent, useMemo, useState } from 'react';

import type { ReleaseEntry } from '../types/releases.ts';

type ReleaseAccordionProps = {
  readonly getReleaseDateLabel: (isoDate: string) => string;
  readonly labels: {
    readonly emptyScope: string;
    readonly global: string;
    readonly notes: string;
    readonly scope: string;
  };
  readonly releases: ReleaseEntry[];
};

type ReleaseAccordionItemProps = {
  readonly expanded: boolean;
  readonly getReleaseDateLabel: (isoDate: string) => string;
  readonly labels: ReleaseAccordionProps['labels'];
  readonly onChange: (event: SyntheticEvent, expanded: boolean) => void;
  readonly release: ReleaseEntry;
};

type ProjectAccordionProps = {
  readonly labels: ReleaseAccordionProps['labels'];
  readonly projects: ReleaseEntry['projects'];
};

type ParsedEntry = {
  readonly description: string;
  readonly tag: string | null;
};

const animationDuration = 300;

const parseEntry = (entry: string): ParsedEntry => {
  const match = entry.match(/^\s*\[(?<tag>[^\]]+)\]\s*(?<description>.+)$/);

  if (match?.groups) {
    return {
      description: match.groups.description.trim(),
      tag: match.groups.tag.trim()
    };
  }

  return {
    description: entry.trim(),
    tag: null
  };
};

const ChevronIcon = ({ expanded }: { readonly expanded: boolean }): JSX.Element => {
  return (
    <Box
      component="span"
      sx={{
        alignItems: 'center',
        backgroundColor: expanded ? 'primary.main' : 'action.hover',
        borderRadius: '50%',
        color: expanded ? 'primary.contrastText' : 'text.secondary',
        display: 'inline-flex',
        height: 32,
        justifyContent: 'center',
        transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        width: 32,
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }}
    >
      <Box
        component="span"
        sx={{
          borderBottom: '2px solid currentColor',
          borderLeft: '2px solid currentColor',
          display: 'inline-block',
          height: 8,
          marginTop: '-2px',
          transform: 'rotate(-45deg)',
          width: 8
        }}
      />
    </Box>
  );
};

const badgeColor = (tag: string | null): 'default' | 'info' | 'success' | 'warning' | 'primary' | 'secondary' => {
  if (!tag) {
    return 'default';
  }

  const normalizedTag = tag.toUpperCase();

  switch (normalizedTag) {
    case 'FEAT':
    case 'NOUVEAUTÉ':
      return 'success';
    case 'FIX':
    case 'CORRECTION':
      return 'warning';
    case 'IMPROVEMENT':
    case 'AMÉLIORATION':
    case 'EXPÉRIENCE':
    case 'ERGONOMIE':
      return 'info';
    case 'DESIGN':
    case 'VISIBILITÉ':
      return 'secondary';
    case 'RELATION':
    case 'ALIGNEMENT':
    case 'FIABILITÉ':
      return 'primary';
    default:
      return 'default';
  }
};

const SummaryList = ({ entries }: { readonly entries: string[] }): JSX.Element => {
  const parsedEntries = useMemo(() => entries.map(parseEntry), [entries]);

  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {parsedEntries.map((entry, index) => (
        <Box
          component="li"
          key={`${entry.description}-${index.toString()}`}
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            gap: 1.5
          }}
        >
          {entry.tag ? (
            <Chip
              color={badgeColor(entry.tag)}
              label={entry.tag}
              size="small"
              sx={{
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 700,
                height: 24
              }}
              variant="soft"
            />
          ) : (
            <Box
              sx={{
                backgroundColor: 'text.disabled',
                borderRadius: '50%',
                flexShrink: 0,
                height: 6,
                mt: 1,
                width: 6
              }}
            />
          )}
          <Typography color="text.secondary" sx={{ lineHeight: 1.6 }} variant="body2">
            {entry.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

const ProjectAccordion = ({ labels, projects }: ProjectAccordionProps): JSX.Element => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const theme = useTheme();

  const handleProjectChange = (projectKey: string) => (_event: SyntheticEvent, expanded: boolean): void => {
    setExpandedProjects((current) => ({
      ...current,
      [projectKey]: expanded
    }));
  };

  return (
    <Stack spacing={1}>
      {Object.entries(projects).map(([projectKey, entries]) => {
        const expanded = Boolean(expandedProjects[projectKey]);

        return (
          <Accordion
            disableGutters
            expanded={expanded}
            key={projectKey}
            onChange={handleProjectChange(projectKey)}
            square={false}
            TransitionProps={{ timeout: animationDuration }}
            sx={{
              backgroundColor: expanded ? 'background.paper' : alpha(theme.palette.action.hover, 0.5),
              border: '1px solid',
              borderColor: expanded ? 'divider' : 'transparent',
              borderRadius: '12px !important',
              boxShadow: expanded ? theme.shadows[1] : 'none',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '&:before': { display: 'none' },
              '&:hover': {
                backgroundColor: expanded ? 'background.paper' : theme.palette.action.hover
              }
            }}
          >
            <AccordionSummary
              expandIcon={
                <Box
                  sx={{
                    color: 'text.secondary',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  ▼
                </Box>
              }
              sx={{
                minHeight: 48,
                px: 2,
                '& .MuiAccordionSummary-content': { my: 1 }
              }}
            >
              <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                <Typography fontWeight={600} variant="body2">
                  {projectKey}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.75rem', opacity: 0.8 }} variant="caption">
                  {entries.length} items
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
              <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
              {entries.length > 0 ? (
                <SummaryList entries={entries} />
              ) : (
                <Typography color="text.secondary" variant="body2">
                  {labels.emptyScope}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};

const ReleaseAccordionItem = ({
  expanded,
  getReleaseDateLabel,
  labels,
  onChange,
  release
}: ReleaseAccordionItemProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Accordion
      disableGutters
      expanded={expanded}
      key={release.version}
      onChange={onChange}
      square={false}
      TransitionProps={{ timeout: animationDuration }}
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        borderRadius: '16px !important',
        boxShadow: expanded ? '0px 12px 40px rgba(0, 0, 0, 0.08)' : '0px 2px 4px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:before': { display: 'none' },
        '&:hover': {
          borderColor: expanded ? 'primary.main' : 'text.secondary'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronIcon expanded={expanded} />}
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          '& .MuiAccordionSummary-content': { margin: 0 }
        }}
      >
        <Stack spacing={0.5} sx={{ width: '100%' }}>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography
              color={expanded ? 'primary.main' : 'text.primary'}
              fontWeight={800}
              sx={{ transition: 'color 0.3s' }}
              variant="h5"
            >
              {release.version}
            </Typography>
            {!expanded && (
              <Chip
                label={getReleaseDateLabel(release.date)}
                size="small"
                sx={{ backgroundColor: 'action.hover', fontWeight: 500 }}
              />
            )}
          </Stack>
          <Typography color="text.secondary" fontWeight={500} variant="body1">
            {release.title}
          </Typography>
          {expanded && (
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
              {getReleaseDateLabel(release.date)}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: { xs: 3, md: 4 }, pt: 0 }}>
        <Divider sx={{ mb: 3, opacity: 0.6 }} />
        <Stack spacing={4}>
          <Box>
            <Typography
              color="text.primary"
              fontWeight={700}
              sx={{
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
              variant="subtitle2"
            >
              {labels.global}
            </Typography>
            <SummaryList entries={release.global} />
          </Box>

          {release.notes ? (
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 3,
                p: 2.5
              }}
            >
              <Typography
                color="primary.main"
                fontWeight={700}
                sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                variant="subtitle2"
              >
                💡 {labels.notes}
              </Typography>
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }} variant="body2">
                {release.notes}
              </Typography>
            </Box>
          ) : null}

          <Box>
            <Typography
              color="text.primary"
              fontWeight={700}
              sx={{
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
              variant="subtitle2"
            >
              {labels.scope}
            </Typography>
            <ProjectAccordion labels={labels} projects={release.projects} />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const ReleaseAccordion = ({ getReleaseDateLabel, labels, releases }: ReleaseAccordionProps): JSX.Element => {
  const [expandedRelease, setExpandedRelease] = useState<string | false>(releases[0]?.version ?? false);

  const handleReleaseChange = (releaseId: string) => (_event: SyntheticEvent, expanded: boolean): void => {
    setExpandedRelease(expanded ? releaseId : false);
  };

  return (
    <Stack spacing={3}>
      {releases.map((release) => (
        <ReleaseAccordionItem
          expanded={expandedRelease === release.version}
          getReleaseDateLabel={getReleaseDateLabel}
          key={release.version}
          labels={labels}
          onChange={handleReleaseChange(release.version)}
          release={release}
        />
      ))}
    </Stack>
  );
};

export default ReleaseAccordion;
