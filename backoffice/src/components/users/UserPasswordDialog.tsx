import * as React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { User } from '@src/hooks/useUsers';

export interface UserPasswordDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSubmit: (password: string, confirmPassword?: string) => Promise<void> | void;
}

export function UserPasswordDialog({ open, user, onClose, onSubmit }: UserPasswordDialogProps): React.JSX.Element {
    const { t } = useTranslation();
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setPassword('');
            setConfirmPassword('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(password, confirmPassword);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="user-password-dialog-title" fullWidth maxWidth="xs">
            <DialogTitle id="user-password-dialog-title">
                {t('users.dialog.change_password')}
            </DialogTitle>
            <DialogContent>
                <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ mt: 1 }}>
                    {user && (
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    )}
                    <TextField
                        label={t('common.labels.password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        label={t('common.labels.confirm_password')}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                    />
                    <DialogActions sx={{ px: 0 }}>
                        <Button onClick={onClose} color="inherit">{t('common.buttons.cancel')}</Button>
                        <Button type="submit" variant="contained">{t('common.buttons.save')}</Button>
                    </DialogActions>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
