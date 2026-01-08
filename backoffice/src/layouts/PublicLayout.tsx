// src/layouts/PublicLayout.tsx
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';

export function PublicLayout(): React.JSX.Element {
  return (
    <Container
      component="main"
      role="main"
      tabIndex={-1}
      maxWidth={false}
      disableGutters
      sx={{ p: 0 }}
    >
      {/* General information */}
      <Outlet />
    </Container>
  );
}
