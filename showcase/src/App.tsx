import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import ChangelogPage from './pages/ChangelogPage.tsx';
import LandingPage from './pages/LandingPage.tsx';

const App = (): JSX.Element => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* General information */}
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<ChangelogPage />} path="/changelog" />
      </Routes>
    </Box>
  );
};

export default App;
