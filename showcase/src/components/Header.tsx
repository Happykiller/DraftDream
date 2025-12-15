import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';


// ... existing imports ...

const Header = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 2,
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        backgroundColor: 'background.default',
        position: 'sticky',
        top: 0,
        zIndex: 1100, // Ensure it stays on top
      }}
    >
      {/* Brand / Logo */}
      <Box
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Box
          component="img"
          src="/Logo.webp"
          alt="FitDesk Logo"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain'
          }}
        />
        <Typography component="span" fontWeight={700} variant="h6" sx={{ color: 'text.primary' }}>
          FitDesk
        </Typography>
        <Typography component="span" fontWeight={400} variant="body2" sx={{ color: 'text.secondary', ml: -0.5, pt: 0.5 }}>
          CRM
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 5, alignItems: 'center' }}>
        <Typography
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
          sx={{
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Fonctionnalités
        </Typography>
        <Typography
          onClick={() => {
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          }}
          sx={{
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Tarifs
        </Typography>
        <Typography
          onClick={() => {
            document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
          }}
          sx={{
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Témoignages
        </Typography>
        <Typography
          onClick={() => navigate('/changelog')}
          sx={{
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Nouveautés
        </Typography>
      </Box>

      {/* Language Selector */}
      <Box>
        <LanguageSelector />
      </Box>

    </Box>
  );
};

export default Header;
