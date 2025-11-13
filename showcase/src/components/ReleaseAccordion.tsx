import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography
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

const badgeColor = (tag: string | null): 'default' | 'info' | 'success' | 'warning' => {
  if (!tag) {
    return 'default';
  }

  const normalizedTag = tag.toUpperCase();

  if (normalizedTag === 'FEAT') {
    return 'success';
  }

  if (normalizedTag === 'FIX') {
    return 'info';
  }

  return 'warning';
};

const SummaryList = ({ entries }: { readonly entries: string[] }): JSX.Element => {
  const parsedEntries = useMemo(() => entries.map(parseEntry), [entries]);

  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {/* General information */}
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
            <Chip color={badgeColor(entry.tag)} label={entry.tag} size="small" sx={{ fontWeight: 600 }} />
          ) : null}
          <Typography color="text.secondary" variant="body2">
            {entry.description}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

const ProjectAccordion = ({ labels, projects }: ProjectAccordionProps): JSX.Element => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const handleProjectChange = (projectKey: string) => (_event: SyntheticEvent, expanded: boolean): void => {
    setExpandedProjects((current) => ({
      ...current,
      [projectKey]: expanded
    }));
  };

  return (
    <Stack spacing={1.5}>
      {/* General information */}
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
              backgroundColor: 'transparent',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 'none',
              '&:before': {
                display: 'none'
              }
            }}
          >
            <AccordionSummary expandIcon={<ChevronIcon expanded={expanded} />} sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography fontWeight={600} variant="body1">
                  {projectKey}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {labels.scope}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
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
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        '&:before': {
          display: 'none'
        }
      }}
    >
      <AccordionSummary expandIcon={<ChevronIcon expanded={expanded} />} sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 } }}>
        <Stack spacing={0.75} sx={{ width: '100%' }}>
          <Typography fontWeight={600} variant="h5">
            {release.title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {getReleaseDateLabel(release.date)}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: { xs: 3, md: 4 }, pt: { xs: 0, md: 0.5 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography color="text.primary" fontWeight={600} sx={{ mb: 1.5 }} variant="subtitle1">
              {labels.global}
            </Typography>
            <SummaryList entries={release.global} />
          </Box>
          <Divider />
          <Box>
            <Typography color="text.primary" fontWeight={600} sx={{ mb: 1.5 }} variant="subtitle1">
              {labels.scope}
            </Typography>
            <ProjectAccordion labels={labels} projects={release.projects} />
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
    <Stack spacing={2.5}>
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
