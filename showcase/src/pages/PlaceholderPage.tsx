import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                {title}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
                Cette page est en cours de construction. Revenez bientôt !
            </Typography>
            <Box
                component="img"
                src="/logo.png"
                alt="Logo"
                sx={{ width: 120, height: 'auto', mb: 6, opacity: 0.5 }}
            />
            <Box>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    size="large"
                    sx={{ borderRadius: 2 }}
                >
                    Retour à l'accueil
                </Button>
            </Box>
        </Container>
    );
};

export default PlaceholderPage;
