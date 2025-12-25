// src/pages/theme-studio/components/SectionNavigation.tsx
import * as React from 'react';
import { Button, Paper, Stack } from '@mui/material';

type Section = {
  id: string;
  label: string;
};

type SectionNavigationProps = {
  sections: Section[];
  activeSection?: string | null;
};

const SCROLL_OFFSET = 80;

/** Horizontal navigation that scrolls to sections and highlights the active one. */
export function SectionNavigation({ sections, activeSection }: SectionNavigationProps) {
  const handleNavigate = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const targetId = event.currentTarget.getAttribute('data-target');
    if (!targetId) return;
    const element = document.getElementById(targetId);
    if (!element) return;
    event.preventDefault();
    const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    const previousTabIndex = element.getAttribute('tabindex');
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    window.requestAnimationFrame(() => {
      if (previousTabIndex === null) {
        element.removeAttribute('tabindex');
      } else {
        element.setAttribute('tabindex', previousTabIndex);
      }
    });
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }} role="navigation" aria-label="Theme studio sections">
      {/* General information */}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {sections.map((section) => {
          const selected = section.id === activeSection;
          return (
            <Button
              key={section.id}
              data-target={section.id}
              onClick={handleNavigate}
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              size="small"
            >
              {section.label}
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
}
