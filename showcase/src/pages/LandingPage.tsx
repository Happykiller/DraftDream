import {
  Box,
  Stack,
  styled,
  Card,
  Grid,
  Chip,
  Avatar,
  Switch,
  Container,
  Typography,
  CardContent,
} from '@mui/material';
import { useState } from 'react';

import { useI18n } from '../i18n/I18nProvider';

// Simple SVG Icons
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00C853' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FeatureIcon = ({ color = '#6200EE', children }: { color?: string; children: React.ReactNode }) => (
  <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </Box>
);

// Custom Switch styling
const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 56,
  height: 32,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 24,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(24px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 4,
    '&.Mui-checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 24,
    height: 24,
    borderRadius: 12,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

const LandingPage = () => {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(false);

  const heroTitle = t('landing.hero.title');
  const heroHighlight = t('landing.hero.titleHighlight');
  const heroPrefix = heroTitle.replace(heroHighlight, '');

  const plans = [
    {
      key: 'trial',
      price: 0,
      monthlyPrice: 0,
      currentPrice: 0,
      annualPrice: 0,
      popular: false
    },
    {
      key: 'starter',
      price: 25,
      monthlyPrice: 29,
      currentPrice: annual ? 25 : 29,
      popular: false
    },
    {
      key: 'pro',
      price: 50,
      monthlyPrice: 59,
      currentPrice: annual ? 50 : 59,
      popular: true
    },
    {
      key: 'premium',
      price: 84,
      monthlyPrice: 99,
      currentPrice: annual ? 84 : 99,
      popular: false
    }
  ];

  const featuresList = [
    {
      key: 'clientManagement',
      color: '#2962FF',
      icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
    },
    {
      key: 'clientPortal',
      color: '#00C853',
      icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8" />
    },
    {
      key: 'programs',
      color: '#D50000',
      icon: <path d="M6.5 6.5l11 11 M21 21l-1-1 M3 3l1 1 M18 22l-3-3 M3 6l3-3 M6 21l-3-3 M21 6l-3-3" />
    },
    {
      key: 'messaging',
      color: '#2E7D32',
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    },
    {
      key: 'calendar',
      color: '#AA00FF',
      icon: <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18" />
    },
    {
      key: 'progress',
      color: '#304FFE',
      icon: <path d="M23 6l-9.5 9.5-5-5L1 18 M19 6h4v4" />
    },
    {
      key: 'nutrition',
      color: '#E65100',
      icon: <path d="M12 2a10 10 0 1 0 10 10 M12 2v10l5 5" />
    },
    {
      key: 'billing',
      color: '#00BFA5',
      icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    },
    {
      key: 'reports',
      color: '#00838F',
      icon: <path d="M12 20V10 M18 20V4 M6 20v-4" />
    },
    {
      key: 'library',
      color: '#1565C0',
      icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                {heroPrefix} <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #D500F9 0%, #651FFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{heroHighlight}</Box>
              </Typography>

              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                {t('landing.hero.subtitle')}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
                {t('landing.hero.description')}
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 4, color: 'text.secondary', fontSize: '0.95rem' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon /> {t('landing.hero.benefits.trial')}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon /> {t('landing.hero.benefits.noCommitment')}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon /> {t('landing.hero.benefits.support')}
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Right Visual */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src="/preview.png"
              alt="Dashboard Preview"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider',
                transform: { md: 'perspective(1000px) rotateY(-5deg)' },
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg)' // Interactive effect
                }
              }}
            />
          </Grid>
        </Grid>
      </Container>


      {/* 2. FEATURES SECTION (Unified) */}
      <Box id="features" sx={{ bgcolor: 'white', py: 10, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" gutterBottom>
            {t('landing.features.title')}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            {t('landing.features.subtitle')}
          </Typography>

          <Grid container spacing={3}>
            {featuresList.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', '&:hover': { boxShadow: '0px 10px 30px rgba(0,0,0,0.05)', borderColor: 'transparent' }, transition: 'all 0.3s' }}>
                  <CardContent sx={{ p: 4 }}>
                    <FeatureIcon color={feature.color}>
                      {feature.icon}
                    </FeatureIcon>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.25rem' }}>
                      {t(`landing.features.items.${feature.key}.title`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {t(`landing.features.items.${feature.key}.desc`)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 4. PRICING SECTION */}
      <Box id="pricing" sx={{ bgcolor: '#F9FAFB', py: 10, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>{t('landing.pricing.title')}</Typography>

          {/* Toggle Switch */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 8 }}>
            <Typography variant="body1" sx={{ color: !annual ? 'text.primary' : 'text.secondary', fontWeight: !annual ? 600 : 400 }}>
              {t('landing.pricing.monthly')}
            </Typography>
            <AntSwitch checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: annual ? 'text.primary' : 'text.secondary', fontWeight: annual ? 600 : 400 }}>
                {t('landing.pricing.annual')}
              </Typography>
              <Chip label={t('landing.pricing.discount')} color="primary" size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: '#E3F2FD', color: 'primary.main' }} />
            </Box>
          </Stack>

          <Grid container spacing={3} alignItems="flex-start">
            {plans.map((plan, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 4,
                    boxShadow: plan.popular ? '0px 24px 48px rgba(0, 0, 0, 0.2)' : '0px 4px 20px rgba(0,0,0,0.05)',
                    border: plan.popular ? 'none' : '1px solid #E5E7EB',
                    bgcolor: plan.popular ? '#0B0F19' : 'white', // Dark background for Pro
                    color: plan.popular ? 'white' : 'text.primary',
                    transform: plan.popular ? 'scale(1.05)' : 'none',
                    zIndex: plan.popular ? 2 : 1,
                    transition: 'all 0.3s',
                    overflow: 'visible'
                  }}
                >
                  {plan.popular && (
                    <Box sx={{ position: 'absolute', top: -16, left: 0, right: 0, textAlign: 'center' }}>
                      <Chip
                        label={t('landing.pricing.popular')}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          background: 'linear-gradient(90deg, #D500F9 0%, #651FFF 100%)',
                          px: 1
                        }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ textAlign: 'center', p: 4, pt: plan.popular ? 5 : 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: plan.popular ? '#fff' : 'text.primary' }}>
                      {t(`landing.pricing.plans.${plan.key}.name`)}
                    </Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: plan.popular ? '#fff' : 'text.primary' }}>
                      {plan.currentPrice}€<Typography component="span" variant="body1" sx={{ color: plan.popular ? 'grey.500' : 'text.secondary' }}>{t('landing.pricing.perMonth')}</Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 3, color: plan.popular ? 'grey.500' : 'text.secondary' }}>
                      {t('landing.pricing.ttc')}
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mb: 4, color: 'primary.main', fontSize: '1.1rem' }}>
                      {t(`landing.pricing.plans.${plan.key}.sub`)}
                    </Typography>

                    <Box sx={{ mb: 4, minHeight: 60 }}>
                      <Typography variant="body2" sx={{ color: plan.popular ? 'grey.400' : 'text.secondary' }}>
                        {t('landing.pricing.allFeatures')}
                      </Typography>
                      {plan.key === 'trial' && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>{t('landing.pricing.trialIncentive')}</Typography>
                      )}
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. TESTIMONIALS SECTION */}
      <Container id="testimonials" maxWidth="lg" sx={{ py: 10, scrollMarginTop: '80px' }}>
        <Typography variant="h2" textAlign="center" gutterBottom>{t('landing.testimonials.title')}</Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
          {t('landing.testimonials.subtitle')}
        </Typography>

        <Grid container spacing={4}>
          {[
            { name: 'Marie Dupont', key: 1, img: '/femme1.jpeg' },
            { name: 'Jean Martin', key: 2, img: '/homme1.jpeg' },
            { name: 'Sophie Bernard', key: 3, img: '/femme2.jpeg' }
          ].map((review, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card sx={{ height: '100%', p: 2 }}>
                <CardContent>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography color="warning.main">★★★★★</Typography>
                  </Stack>
                  <Typography variant="body1" paragraph fontStyle="italic">
                    "{t(`landing.testimonials.reviews.${review.key}.text`)}"
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Avatar src={review.img} sx={{ bgcolor: 'secondary.main' }}>{review.name[0]}</Avatar>
                    <Box>
                      <Typography fontWeight="bold" variant="subtitle2">{review.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{t('landing.testimonials.role')}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 6. STATS SECTION */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {[1, 2, 3, 4].map((index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>
                  {t(`landing.stats.${index}.value`)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t(`landing.stats.${index}.label`)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 7. FINAL CTA SECTION */}
      <Box sx={{ bgcolor: 'black', color: 'white', py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
            {t('landing.cta.title')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, fontWeight: 400, color: 'grey.400' }}>
            {t('landing.cta.subtitle')}
          </Typography>
        </Container>
      </Box>

      {/* 8. FOOTER */}
      <Box component="footer" sx={{ bgcolor: '#0B0F19', color: 'grey.400', py: 8, borderTop: '1px solid #1F2937' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            {/* Brand Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    background: 'linear-gradient(to bottom right, #D500F9, #F50057)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  F
                </Box>
                <Typography variant="h6" color="white" fontWeight="bold">
                  FitDesk
                </Typography>
                <Typography variant="body2" sx={{ ml: -0.5, pt: 0.5 }}>
                  CRM
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ maxWidth: 300, mb: 4 }}>
                {t('landing.footer.brandDesc')}
              </Typography>
            </Grid>

            {/* Links Columns */}
            {[
              {
                title: t('landing.footer.product.title'),
                links: [
                  t('landing.footer.product.features'),
                  t('landing.footer.product.pricing')
                ]
              },
              {
                title: t('landing.footer.support.title'),
                links: [
                  t('landing.footer.support.contact'),
                  t('landing.footer.support.helpCenter'),
                  t('landing.footer.support.news')
                ]
              },
              {
                title: t('landing.footer.legal.title'),
                links: [
                  t('landing.footer.legal.mentions'),
                  t('landing.footer.legal.ems'),
                  t('landing.footer.legal.sales'),
                  t('landing.footer.legal.privacy')
                ]
              }
            ].map((col, index) => (
              <Grid size={{ xs: 6, md: 2 }} key={index}>
                <Typography variant="subtitle2" color="white" fontWeight="bold" sx={{ mb: 3 }}>
                  {col.title}
                </Typography>
                <Stack spacing={2}>
                  {col.links.map((link, i) => (
                    <Typography
                      key={i}
                      component="a"
                      href="#"
                      variant="body2"
                      sx={{
                        color: 'grey.400',
                        textDecoration: 'none',
                        '&:hover': { color: 'white' }
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #1F2937', textAlign: 'center' }}>
            <Typography variant="body2">
              {t('landing.footer.rights')}
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
