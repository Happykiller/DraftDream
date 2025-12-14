import { MenuItem, Select, FormControl } from '@mui/material';

import { useI18n, Language } from '../i18n/I18nProvider';

const LanguageSelector = () => {
    const { language, setLanguage } = useI18n();

    return (
        <FormControl variant="standard" size="small">
            <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                disableUnderline
                sx={{
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '& .MuiSelect-select': {
                        py: 0.5,
                    },
                    '&:hover': {
                        color: 'primary.main',
                    },
                }}
                MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                        sx: {
                            mt: 1,
                            boxShadow: 3
                        }
                    }
                }}
            >
                <MenuItem value="fr">FR</MenuItem>
                <MenuItem value="en">EN</MenuItem>
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;
