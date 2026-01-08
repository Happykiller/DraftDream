import { Box } from '@mui/material';
import { JSX } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';

const App = (): JSX.Element => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* General information */}
      <Header />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<ReleaseNotesPage />} path="/changelog" />
      </Routes>
    </Box>
  );
};

export default App;
