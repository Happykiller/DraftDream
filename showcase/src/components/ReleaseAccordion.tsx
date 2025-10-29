import { type SyntheticEvent, useMemo, useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography
} from '@mui/material';

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

type ProjectSectionsProps = {
  readonly labels: ReleaseAccordionProps['labels'];
  readonly projects: ReleaseEntry['projects'];
};

type ParsedEntry = {
  readonly description: string;
  readonly tag: string | null;
};

const animationDuration = 250;

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

const chevronStyles = {
  alignItems: 'center',
  display: 'inline-flex',
  height: 24,
  justifyContent: 'center',
  transition: `transform ${animationDuration}ms ease`,
  width: 24
} as const;

const ChevronIcon = ({ expanded }: { readonly expanded: boolean }): JSX.Element => {
  return (
    <Box component="span" sx={{ ...chevronStyles, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <Box
        component="span"
        sx={{
          borderBottom: '2px solid currentColor',
          borderLeft: '2px solid currentColor',
          display: 'inline-block',
          height: 12,
          transform: 'rotate(-45deg)',
          width: 12
        }}
      />
    </Box>
  );
};

const SummaryList = ({ entries }: { readonly entries: string[] }): JSX.Element => {
  const parsedEntries = useMemo(() => entries.map(parseEntry), [entries]);

  return (
    <Stack
      component="ul"
      spacing={1.5}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0
      }}
    >
      {/* General information */}
      {parsedEntries.map((entry, index) => (
        <Box
          component="li"
          key={`${entry.description}-${index.toString()}`}
          sx={{
            alignItems: 'start',
            columnGap: 1.5,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr'
          }}
        >
          <Box
            component="span"
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
              height: '100%'
            }}
          >
            <Box
              component="span"
              sx={{
                backgroundColor: 'divider',
                borderRadius: '50%',
                display: 'inline-flex',
                height: 6,
                width: 6
              }}
            />
          </Box>
          <Stack spacing={0.5}>
            {entry.tag ? (
              <Typography
                color="text.secondary"
                sx={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}
                variant="caption"
              >
                {entry.tag}
              </Typography>
            ) : null}
            <Typography color="text.secondary" variant="body2">
              {entry.description}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

const ProjectSections = ({ labels, projects }: ProjectSectionsProps): JSX.Element => {
  return (
    <Stack component="dl" spacing={3} sx={{ m: 0 }}>
      {/* General information */}
      {Object.entries(projects).map(([projectKey, entries]) => (
        <Box component="div" key={projectKey}>
          <Typography component="dt" fontWeight={600} sx={{ mb: 1, textTransform: 'uppercase' }} variant="caption">
            {projectKey}
          </Typography>
          <Box component="dd" sx={{ m: 0 }}>
            {entries.length > 0 ? (
              <SummaryList entries={entries} />
            ) : (
              <Typography color="text.secondary" variant="body2">
                {labels.emptyScope}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
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
  return (
    <Accordion
      disableGutters
      expanded={expanded}
      key={release.version}
      onChange={onChange}
      square={false}
      TransitionProps={{ timeout: animationDuration }}
      sx={{
        backgroundColor: 'transparent',
        borderColor: 'divider',
        borderRadius: 0,
        borderTop: '1px solid',
        boxShadow: 'none',
        margin: 0,
        overflow: 'visible',
        '&:last-of-type': {
          borderBottom: '1px solid'
        },
        '&:before': {
          display: 'none'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronIcon expanded={expanded} />}
        sx={{
          px: { xs: 1.5, md: 2 },
          py: { xs: 2, md: 2.5 },
          '& .MuiAccordionSummary-content': {
            margin: 0
          }
        }}
      >
        <Stack spacing={0.75} sx={{ width: '100%' }}>
          <Typography color="text.secondary" fontWeight={500} variant="overline">
            {release.version}
          </Typography>
          <Typography fontWeight={600} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {release.title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {getReleaseDateLabel(release.date)}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 1.5, md: 2 }, pb: { xs: 4, md: 5 }, pt: 0 }}>
        <Stack spacing={3.5}>
          <Box>
            <Typography color="text.primary" fontWeight={600} sx={{ mb: 1.5 }} variant="subtitle1">
              {labels.global}
            </Typography>
            <SummaryList entries={release.global} />
          </Box>
          <Divider sx={{ borderColor: 'divider', opacity: 0.4 }} />
          <Box>
            <Typography color="text.primary" fontWeight={600} sx={{ mb: 1.5 }} variant="subtitle1">
              {labels.scope}
            </Typography>
            <ProjectSections labels={labels} projects={release.projects} />
          </Box>
          {release.notes ? (
            <Box>
              <Typography color="text.primary" fontWeight={600} sx={{ mb: 1.5 }} variant="subtitle1">
                {labels.notes}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {release.notes}
              </Typography>
            </Box>
          ) : null}
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
    <Stack spacing={0}>
      {/* General information */}
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
