import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Stack,
    Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface PasswordDialogProps {
    open: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
}

export function PasswordDialog({ open, loading, onClose, onSubmit }: PasswordDialogProps): React.JSX.Element {
    const { t } = useTranslation();
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = React.useCallback(async () => {
        if (password !== confirmPassword) {
            setError(t('profile.password_dialog.error_mismatch'));
            return;
        }
        setError(null);
        try {
            await onSubmit(password);
            onClose();
            setPassword('');
            setConfirmPassword(''); // Reset on success
        } catch {
            // Error handled by parent/hook flash message usually, but we keep dialog open
        }
    }, [confirmPassword, onClose, onSubmit, password, t]);

    const handleClose = React.useCallback(() => {
        onClose();
        setPassword('');
        setConfirmPassword('');
        setError(null);
    }, [onClose]);

    return (
        <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('profile.password_dialog.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        autoFocus
                        label={t('profile.password_dialog.new_password')}
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label={t('profile.password_dialog.confirm_password')}
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    {t('common.actions.cancel')}
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || !password}>
                    {t('common.actions.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
