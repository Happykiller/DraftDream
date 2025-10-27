import { SyntheticEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';

export type ChangelogEntry = {
  readonly id: string;
  readonly title: string;
  readonly version?: string;
  readonly content: string;
};

type ChangelogTabsProps = {
  readonly entries: ChangelogEntry[];
};

const ChangelogTabs = ({ entries }: ChangelogTabsProps): JSX.Element => {
  const defaultTab = entries[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleChange = (_event: SyntheticEvent, value: string): void => {
    setActiveTab(value);
  };

  const activeEntry = entries.find((entry) => entry.id === activeTab) ?? entries[0];

  return (
    <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
      {/* General information */}
      <Tabs
        onChange={handleChange}
        scrollButtons="auto"
        value={activeEntry?.id ?? false}
        variant="scrollable"
      >
        {entries.map((entry) => (
          <Tab key={entry.id} label={entry.title} value={entry.id} />
        ))}
      </Tabs>
      <Box sx={{ p: { xs: 3, md: 4 }, backgroundColor: 'background.paper' }}>
        {activeEntry ? (
          <Box>
            {activeEntry.version ? (
              <Typography color="text.secondary" sx={{ mb: 2 }} variant="subtitle1">
                Version {activeEntry.version}
              </Typography>
            ) : null}
            <Box className="markdown-body">
              <ReactMarkdown>{activeEntry.content}</ReactMarkdown>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">No changelog information available.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ChangelogTabs;
