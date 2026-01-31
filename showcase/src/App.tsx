import { Box } from '@mui/material';
import { JSX } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';

const App = (): JSX.Element => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* General information */}
      <Header />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<ReleaseNotesPage />} path="/changelog" />
        {/* Footer pages */}
        <Route element={<PlaceholderPage title="Contact" />} path="/contact" />
        <Route element={<PlaceholderPage title="Centre d'aide" />} path="/help-center" />
        <Route element={<PlaceholderPage title="Mentions légales" />} path="/legal/legal-notice" />
        <Route element={<PlaceholderPage title="CGU" />} path="/legal/terms-of-service" />
        <Route element={<PlaceholderPage title="CGV" />} path="/legal/sales-conditions" />
        <Route element={<PlaceholderPage title="Politique de confidentialité" />} path="/legal/privacy-policy" />
      </Routes>
    </Box >
  );
};

export default App;
