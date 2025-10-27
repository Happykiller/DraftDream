import { Container, Stack, Typography } from '@mui/material';

import ChangelogTabs, { type ChangelogEntry } from '../components/ChangelogTabs.tsx';

import backofficeChangelog from '../../../backoffice/CHANGELOG.md?raw';
import frontofficeChangelog from '../../../frontoffice/CHANGELOG.md?raw';
import globalChangelog from '../../../CHANGELOG.md?raw';
import apiChangelog from '../../../api/CHANGELOG.md?raw';
import version from '../../../VERSION?raw';

const changelogEntries: ChangelogEntry[] = [
  {
    id: 'global',
    title: 'FitDesk Platform',
    version: version.trim(),
    content: globalChangelog
  },
  {
    id: 'api',
    title: 'API',
    content: apiChangelog
  },
  {
    id: 'frontoffice',
    title: 'Frontoffice',
    content: frontofficeChangelog
  },
  {
    id: 'backoffice',
    title: 'Backoffice',
    content: backofficeChangelog
  }
];

const ChangelogPage = (): JSX.Element => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      {/* General information */}
      <Stack spacing={4}>
        <Stack spacing={1.5}>
          <Typography color="primary.main" variant="overline">
            Release notes
          </Typography>
          <Typography variant="h2">Stay ahead with the FitDesk roadmap</Typography>
          <Typography color="text.secondary" variant="body1">
            Explore the latest enhancements across the FitDesk ecosystem. Tabs help you review
            updates for each area of the platform so you can brief your teams quickly.
          </Typography>
        </Stack>
        <ChangelogTabs entries={changelogEntries} />
      </Stack>
    </Container>
  );
};

export default ChangelogPage;
