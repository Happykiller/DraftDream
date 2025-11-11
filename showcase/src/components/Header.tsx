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
const Header = (): JSX.Element => {
  const { language, setLanguage } = useI18n();

  const handleLanguageChange = (_event: MouseEvent<HTMLElement>, newLanguage: Language | null): void => {
    if (!newLanguage || newLanguage === language) {
      return;
    }

    setLanguage(newLanguage);
  };

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
        px: { xs: 2, sm: 3 },
        py: 2
      }}
    >
      {/* General information */}
      <Typography component="span" fontWeight={700} variant="h6">
        FitDesk Showcase
      </Typography>
      <ToggleButtonGroup
        aria-label="Select interface language"
        exclusive
        onChange={handleLanguageChange}
        sx={{
          marginLeft: 'auto',
          '& .MuiToggleButton-root': {
            px: 1.5
          }
        }}
        value={language}
      >
        {supportedLanguages.map((supportedLanguage) => (
          <ToggleButton
            aria-label={ariaLabelByLanguage[supportedLanguage]}
            key={supportedLanguage}
            value={supportedLanguage}
          >
            <Box aria-hidden component="span" sx={{ fontSize: 20 }}>
              {flagByLanguage[supportedLanguage]}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default Header;
