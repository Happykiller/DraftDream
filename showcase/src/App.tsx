import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import LandingPage from './pages/LandingPage.tsx';
import ReleaseNotesPage from './pages/ReleaseNotesPage.tsx';

const App = (): JSX.Element => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* General information */}
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<ReleaseNotesPage />} path="/changelog" />
      </Routes>
    </Box>
  );
};

export default App;
