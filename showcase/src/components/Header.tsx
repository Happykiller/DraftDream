import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { type MouseEvent } from 'react';

import { supportedLanguages, useI18n, type Language } from '../i18n/I18nProvider';

const flagByLanguage: Record<Language, string> = {
  en: '🇬🇧',
  fr: '🇫🇷'
};

const ariaLabelByLanguage: Record<Language, string> = {
  en: 'English language',
  fr: 'Langue française'
};

/**
 * Renders the global showcase header with branding and language selector.
 */
const Header = () => {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

      {/* Navigation Links - Hidden on mobile for simplicity, or we can use a basic stack */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
        <Typography
          component="a"
          href="#features"
          sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
        >
          Fonctionnalités
        </Typography>
        <Typography
          component="a"
          href="#pricing"
          sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
        >
          Tarifs
        </Typography>
        <Typography
          component="a"
          href="#testimonials"
          sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
        >
          Témoignages
        </Typography>
      </Box>

      {/* CTA Button - Optional "Voir la démo" as per plan? The prompt said "pas question de reproduire 'connecter vous', 'essai gratuit'" */}
      {/* Keeping distinct logic: If 'Connect/FreeTrial' are excluded, maybe just an empty box or a 'Contact' if logic requires balance, but prompt implies simple header */}
      {/* For now, leaving the right side empty or just ensuring space */}
      <Box />
    </Box>
  );
};

export default Header;
