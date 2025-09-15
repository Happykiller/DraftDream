// src/layouts/PublicLayout.tsx
// ⚠️ Comment in English: Public shell; provides structure and an outlet for child routes.
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';

export function PublicLayout(): React.JSX.Element {
  return (
    <Container component="main" maxWidth="sm" role="main" tabIndex={-1}>
      <Outlet />
    </Container>
  );
}
