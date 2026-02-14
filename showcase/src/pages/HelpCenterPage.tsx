import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Stack,
  Typography
} from '@mui/material';
import { useEffect } from 'react';

import { useI18n } from '../i18n/I18nProvider';

interface HelpCenterItem {
  question: string;
  answer: string;
}

interface HelpCenterSection {
  title: string;
  items: HelpCenterItem[];
}

/** Display the marketing FAQ content for the showcase help center page. */
const HelpCenterPage = (): JSX.Element => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('landing.helpCenter.title');
  }, [t]);
  const sections = t('landing.helpCenter.sections', { returnObjects: true }) as HelpCenterSection[];

  return (
    <Box component="main" sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* General information */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={5}>
          <Stack spacing={1}>
            <Typography component="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800 }}>
              {t('landing.helpCenter.title')}
            </Typography>
            <Typography color="text.secondary" variant="body1">
              {t('landing.helpCenter.subtitle')}
            </Typography>
          </Stack>

          <Stack spacing={4}>
            {sections.map((section) => (
              <Stack key={section.title} spacing={1.5}>
                <Typography component="h2" sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' }, fontWeight: 700 }}>
                  {section.title}
                </Typography>

                <Stack spacing={1.5}>
                  {section.items.map((item) => (
                    <Accordion
                      key={item.question}
                      disableGutters
                      elevation={0}
                      sx={{
                        backgroundColor: '#fff',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        '&:before': { display: 'none' },
                        '& .MuiAccordionSummary-root': {
                          minHeight: 72,
                          px: { xs: 2.5, md: 3 }
                        },
                        '& .MuiAccordionSummary-content': {
                          my: 0
                        },
                        '& .MuiAccordionSummary-expandIconWrapper': {
                          color: 'text.secondary'
                        },
                        '& .MuiAccordionDetails-root': {
                          px: { xs: 2.5, md: 3 },
                          pb: 2.5,
                          pt: 0
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={(
                          <Typography aria-hidden component="span" sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
                            ⌄
                          </Typography>
                        )}
                      >
                        <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.25rem' }, fontWeight: 500 }}>
                          {item.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }} variant="body1">
                          {item.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default HelpCenterPage;
