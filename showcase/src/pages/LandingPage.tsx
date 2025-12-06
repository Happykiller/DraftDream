import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid, // Note: In MUI v5+, Grid is deprecated in favor of Grid2, but let's stick to Grid if simple, or Stack. package.json has v7, so use Grid2 if possible or standard Grid. Let's use Grid2 as 'Grid' if v7. Actually v7 might just use Grid. I'll check imports. Standard Grid is safest.
  Stack,
  Typography,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Simple SVG Icons to avoid missing dependencies
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00C853' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FeatureIcon = ({ color = '#6200EE' }) => (
  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  </Box>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" spacing={4} textAlign="center">
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h1" gutterBottom sx={{ mb: 2 }}>
              Gérez vos clients, créez des programmes personnalisés et développez votre activité
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
              Centralisez la gestion de votre clientèle fitness. Créez des programmes d'entraînement et de nutrition personnalisés. Automatisez vos tâches administratives.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              {/* As per instruction: No 'Essai gratuit'. Only 'Voir la démo' kept as a soft CTA */}
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/demo')}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'background.paper' }
                }}
              >
                Voir la démo
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 4, color: 'text.secondary', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon /> 14 jours gratuits
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon /> Sans engagement
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon /> Support inclus
              </Box>
            </Stack>
          </Box>

          {/* Hero Dashboard Visual - Simplified Representation */}
          <Paper
            elevation={6}
            sx={{
              mt: 6,
              p: 2,
              width: '100%',
              maxWidth: 1000,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
              border: '1px solid',
              borderColor: 'divider',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Abstract UI representation */}
            <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, bgcolor: '#F3F4F6', borderRadius: 2, border: '1px dashed #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">Interface Visual Preview</Typography>
            </Box>
            {/* Floating badge example */}
            <Paper sx={{ position: 'absolute', top: 40, right: -20, p: 2, borderRadius: 2, boxShadow: 3, transform: 'rotate(6deg)' }}>
              <Typography variant="subtitle2" color="success.main" fontWeight="bold">+40% revenus</Typography>
            </Paper>
          </Paper>
        </Stack>
      </Container>


      {/* 2. MAIN FEATURES SECTION */}
      <Box id="features" sx={{ bgcolor: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" gutterBottom>
            Fonctionnalités détaillées
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            Découvrez tous les outils dont vous avez besoin pour développer votre activité de coaching
          </Typography>

          <Grid container spacing={6}>
            {[
              { title: 'Gestion complète des clients', desc: 'Centralisez clients et prospects : coordonnées, objectifs, niveau, conditions médicales.' },
              { title: 'Portail client dédié', desc: 'Chaque client dispose de son propre espace personnel pour consulter ses programmes et suivre sa progression.' },
              { title: 'Programmes personnalisés', desc: 'Créez des programmes sur mesure et adaptés à toutes les pratiques pour chacun de vos clients.' },
              { title: 'Messagerie intégrée', desc: 'Communication directe et sécurisée avec vos clients. Messages instantanés et partage de fichiers.' }
            ].map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                  <Typography color="text.secondary">{feature.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. SECONDARY FEATURES GRID */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          {[
            { title: 'Agenda intelligent', desc: 'Planification simplifiée avec synchronisation Google Calendar.' },
            { title: 'Plans nutritionnels', desc: 'Plans alimentaires personnalisés avec calcul automatique des macros.' },
            { title: 'Rapports quotidiens', desc: 'Recevez des rapports détaillés de vos clients : entraînement, nutrition, sommeil.' },
            { title: 'Suivi de progression', desc: 'Visualisez l\'évolution de vos clients : poids, mensurations, photos.' },
            { title: 'Facturation simplifiée', desc: 'Créez et envoyez des factures en un clic. Paiements sécurisés.' },
            { title: 'Bibliothèques et automatisation', desc: 'Accédez à de riches bibliothèques de programmes et plans nutritionnels pré-conçus.' }
          ].map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>


      {/* 4. PRICING SECTION */}
      <Box id="pricing" sx={{ bgcolor: '#F9FAFB', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" sx={{ mb: 1 }}>Choisissez votre plan</Typography>
          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 6 }}>
            <Typography color="text.secondary">Mensuel</Typography>
            <Typography color="primary" fontWeight="bold">Annuel -15%</Typography>
          </Stack>

          <Grid container spacing={3}>
            {[
              { name: 'Essai', price: '0€', sub: 'Jusqu\'à 5 clients', btn: 'Choisir ce plan' },
              { name: 'Starter', price: '29€', sub: 'Jusqu\'à 5 clients', btn: 'Choisir ce plan' },
              { name: 'Pro', price: '59€', sub: 'Jusqu\'à 15 clients', btn: 'Choisir ce plan', popular: true },
              { name: 'Premium', price: '99€', sub: 'Clients illimités', btn: 'Choisir ce plan' }
            ].map((plan, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 3,
                    boxShadow: plan.popular ? '0px 12px 32px rgba(98, 0, 238, 0.15)' : undefined,
                    border: plan.popular ? '2px solid #6200EE' : '1px solid #E5E7EB',
                    transform: plan.popular ? 'scale(1.05)' : 'none',
                    zIndex: plan.popular ? 2 : 1
                  }}
                >
                  {plan.popular && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>
                      <Chip label="Populaire" color="primary" size="small" sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }} />
                    </Box>
                  )}
                  <CardContent sx={{ textAlign: 'center', p: 4, pt: plan.popular ? 5 : 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{plan.name}</Typography>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                      {plan.price}<Typography component="span" variant="body1" color="text.secondary">/mois</Typography>
                    </Typography>
                    <Typography color="primary" fontWeight="medium" sx={{ mb: 3 }}>
                      {plan.sub}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Toutes les fonctionnalités incluses
                    </Typography>

                    <Button
                      fullWidth
                      variant={plan.popular ? 'contained' : 'outlined'}
                      color={plan.popular ? 'primary' : 'inherit'}
                      sx={{ borderRadius: 2 }}
                    >
                      {plan.btn}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. TESTIMONIALS SECTION */}
      <Container id="testimonials" maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h2" textAlign="center" gutterBottom>Ils nous font confiance</Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8 }}>
          Découvrez comment FitDesk CRM a transformé l'activité de nos professionnels partenaires
        </Typography>

        <Grid container spacing={4}>
          {[
            { name: 'Marie Dupont', text: 'FitDesk CRM a révolutionné ma façon de travailler. Je peux maintenant suivre mes 25 clients facilement.', img: '/femme1.jpeg' },
            { name: 'Jean Martin', text: 'L\'interface est intuitive et les fonctionnalités sont exactement ce dont j\'avais besoin. Mes clients adorent.', img: '/homme1.jpeg' },
            { name: 'Sophie Bernard', text: 'Depuis que j\'utilise FitDesk, je gagne 2h par jour sur ma gestion administrative. Je peux me concentrer sur le coaching.', img: '/femme2.jpeg' }
          ].map((review, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card sx={{ height: '100%', p: 2 }}>
                <CardContent>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography color="warning.main">★★★★★</Typography>
                  </Stack>
                  <Typography variant="body1" paragraph fontStyle="italic">
                    "{review.text}"
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Avatar src={review.img} sx={{ bgcolor: 'secondary.main' }}>{review.name[0]}</Avatar>
                    <Box>
                      <Typography fontWeight="bold" variant="subtitle2">{review.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Coach Sportif</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

    </Box>
  );
};

export default LandingPage;
