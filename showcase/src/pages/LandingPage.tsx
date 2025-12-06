import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
  Avatar,
  Switch,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'Essai',
      price: 0,
      monthlyPrice: 0,
      sub: "Jusqu'à 5 clients",
      currentPrice: 0,
      annualPrice: 0,
      popular: false
    },
    {
      name: 'Starter',
      price: 25,
      monthlyPrice: 29,
      sub: "Jusqu'à 5 clients",
      currentPrice: annual ? 25 : 29,
      popular: false
    },
    {
      name: 'Pro',
      price: 50,
      monthlyPrice: 59,
      sub: "Jusqu'à 15 clients",
      currentPrice: annual ? 50 : 59,
      popular: true
    },
    {
      name: 'Premium',
      price: 84,
      monthlyPrice: 99,
      sub: "Clients illimités",
      currentPrice: annual ? 84 : 99,
      popular: false
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
                Le CRM <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #D500F9 0%, #651FFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>conçu pour les coachs sportifs</Box>
              </Typography>

              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                Gérez vos clients, créez des programmes personnalisés et développez votre activité
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
                Centralisez la gestion de votre clientèle fitness. Créez des programmes d'entraînement et de nutrition personnalisés. Automatisez vos tâches administratives avec notre solution CRM complète.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 4, color: 'text.secondary', fontSize: '0.95rem' }}
              >
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
            Fonctionnalités détaillées
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            Découvrez tous les outils dont vous avez besoin pour développer votre activité de coaching
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                title: 'Gestion complète des clients',
                desc: 'Centralisez clients et prospects : coordonnées, objectifs, niveau, conditions médicales. Gérez le parcours complet de la prise de contact à la fidélisation.',
                color: '#2962FF',
                icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
              },
              {
                title: 'Portail client dédié',
                desc: 'Chaque client dispose de son propre espace personnel pour consulter ses programmes, suivre sa progression, accéder à ses plans nutritionnels et communiquer avec son coach.',
                color: '#00C853',
                icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8" />
              },
              {
                title: 'Programmes personnalisés',
                desc: 'Créez des programmes sur mesure et adaptés à toutes les pratiques pour chacun de vos clients. Accédez à une bibliothèque d\'exercices et des templates pour gagner du temps.',
                color: '#D50000',
                icon: <path d="M6.5 6.5l11 11 M21 21l-1-1 M3 3l1 1 M18 22l-3-3 M3 6l3-3 M6 21l-3-3 M21 6l-3-3" />
              },
              {
                title: 'Messagerie intégrée',
                desc: 'Communication directe et sécurisée avec vos clients. Messages instantanés, partage de fichiers et suivi des échanges centralisé.',
                color: '#2E7D32',
                icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              },
              {
                title: 'Agenda intelligent',
                desc: 'Planification simplifiée avec synchronisation Google Calendar. Réservations en ligne, rappels automatiques et gestion des créneaux.',
                color: '#AA00FF',
                icon: <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18" />
              },
              {
                title: 'Suivi de progression',
                desc: 'Visualisez l\'évolution de vos clients : poids, mensurations, photos de progression. Graphiques détaillés et analyses pour un suivi professionnel.',
                color: '#304FFE',
                icon: <path d="M23 6l-9.5 9.5-5-5L1 18 M19 6h4v4" />
              },
              {
                title: 'Plans nutritionnels',
                desc: 'Plans alimentaires personnalisés avec calcul automatique des macros. Bibliothèque de recettes et templates nutritionnels intégrés.',
                color: '#E65100',
                icon: <path d="M12 2a10 10 0 1 0 10 10 M12 2v10l5 5" />
              },
              {
                title: 'Facturation simplifiée',
                desc: 'Créez et envoyez des factures en un clic. Paiements en ligne sécurisés via Stripe. Suivi automatique des revenus et relances.',
                color: '#00BFA5',
                icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              },
              {
                title: 'Rapports quotidiens',
                desc: 'Recevez des rapports détaillés de vos clients : entraînement, nutrition, sommeil, état mental. Adaptez le suivi de manière proactive.',
                color: '#00838F',
                icon: <path d="M12 20V10 M18 20V4 M6 20v-4" />
              },
              {
                title: 'Bibliothèques et automatisation',
                desc: 'Accédez à de riches bibliothèques de programmes et plans nutritionnels pré-conçus. Automatisez les tâches répétitives pour vous concentrer sur le coaching.',
                color: '#1565C0',
                icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              }
            ].map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: 'none', '&:hover': { boxShadow: '0px 10px 30px rgba(0,0,0,0.05)', borderColor: 'transparent' }, transition: 'all 0.3s' }}>
                  <CardContent sx={{ p: 4 }}>
                    <FeatureIcon color={feature.color}>
                      {feature.icon}
                    </FeatureIcon>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.25rem' }}>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.desc}
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
          <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>Choisissez votre plan</Typography>

          {/* Toggle Switch */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 8 }}>
            <Typography variant="body1" sx={{ color: !annual ? 'text.primary' : 'text.secondary', fontWeight: !annual ? 600 : 400 }}>
              Mensuel
            </Typography>
            <AntSwitch checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: annual ? 'text.primary' : 'text.secondary', fontWeight: annual ? 600 : 400 }}>
                Annuel
              </Typography>
              <Chip label="-15%" color="primary" size="small" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: '#E3F2FD', color: 'primary.main' }} />
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
                        label="Populaire"
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
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: plan.popular ? '#fff' : 'text.primary' }}>{plan.name}</Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: plan.popular ? '#fff' : 'text.primary' }}>
                      {plan.currentPrice}€<Typography component="span" variant="body1" sx={{ color: plan.popular ? 'grey.500' : 'text.secondary' }}>/mois</Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 3, color: plan.popular ? 'grey.500' : 'text.secondary' }}>
                      TTC
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mb: 4, color: 'primary.main', fontSize: '1.1rem' }}>
                      {plan.sub}
                    </Typography>

                    <Box sx={{ mb: 4, minHeight: 60 }}>
                      <Typography variant="body2" sx={{ color: plan.popular ? 'grey.400' : 'text.secondary' }}>
                        Toutes les fonctionnalités incluses
                      </Typography>
                      {plan.name === 'Essai' && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Essai de 14 jours offerts</Typography>
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

      {/* 6. STATS SECTION */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {[
              { value: '500+', label: 'Coachs actifs' },
              { value: '98%', label: 'Satisfaction client' },
              { value: '+40%', label: 'Revenus en moyenne' },
              { value: '1h30', label: 'Économisée par jour' },
            ].map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
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
            Prêt à transformer votre activité fitness ?
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, fontWeight: 400, color: 'grey.400' }}>
            Rejoignez des centaines de professionnels qui ont déjà fait le choix de FitDesk CRM
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
                La solution CRM dédiée aux professionnels du fitness.
              </Typography>
            </Grid>

            {/* Links Columns */}
            {[
              {
                title: 'Produit',
                links: ['Fonctionnalités', 'Tarifs']
              },
              {
                title: 'Support',
                links: ['Contact', 'Centre d\'aide', 'Nouveautés']
              },
              {
                title: 'Légal',
                links: ['Mentions légales', 'CGU', 'CGV', 'Politique de protection des données personnelles']
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
              © 2025 FitDesk CRM. Tous droits réservés
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
