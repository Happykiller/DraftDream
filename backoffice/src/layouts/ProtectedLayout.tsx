// src/layouts/ProtectedLayout.tsx
// ⚠️ Comment in English: Protected shell; topbar/sidebar can live here. The loader guards access.
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';

export function ProtectedLayout(): React.JSX.Element {
  return (
    <Container component="main" maxWidth="lg" role="main" tabIndex={-1}>
      {/* Add AppBar/Drawer here later */}
      <Outlet />
    </Container>
  );
}
