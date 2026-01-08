import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Box,
    Button,
    Tooltip,
    type ButtonProps,
} from '@mui/material';

export interface ResponsiveButtonProps extends ButtonProps {
    label?: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

const iconRules: Array<{ match: RegExp; icon: React.ReactNode }> = [
    { match: /(cancel|annuler|close)/i, icon: <CloseRoundedIcon fontSize="small" /> },
    { match: /(save|enregistrer)/i, icon: <SaveOutlinedIcon fontSize="small" /> },
    { match: /(delete|supprimer)/i, icon: <DeleteOutlineIcon fontSize="small" /> },
    { match: /(create|nouveau|ajouter|add)/i, icon: <AddIcon fontSize="small" /> },
    { match: /(edit|modifier)/i, icon: <EditOutlinedIcon fontSize="small" /> },
    { match: /(clone|dupliquer|copy|copier)/i, icon: <ContentCopyIcon fontSize="small" /> },
    { match: /(open|ouvrir)/i, icon: <OpenInNewIcon fontSize="small" /> },
    { match: /(view|voir|details)/i, icon: <VisibilityIcon fontSize="small" /> },
    { match: /(login|connexion)/i, icon: <LoginOutlinedIcon fontSize="small" /> },
    { match: /(logout|déconnexion|deconnexion)/i, icon: <LogoutOutlinedIcon fontSize="small" /> },
    { match: /(back|retour)/i, icon: <ArrowBackIcon fontSize="small" /> },
    { match: /(next|suivant)/i, icon: <ArrowForwardIcon fontSize="small" /> },
    { match: /(finish|complete|terminer|pris)/i, icon: <CheckCircleOutlineIcon fontSize="small" /> },
    { match: /(play|start|démarrer|demarrer)/i, icon: <PlayArrowIcon fontSize="small" /> },
    { match: /(pause)/i, icon: <PauseIcon fontSize="small" /> },
    { match: /(search|rechercher)/i, icon: <SearchIcon fontSize="small" /> },
    { match: /(refresh|reload|rafraîchir|rafraichir)/i, icon: <RefreshIcon fontSize="small" /> },
    { match: /(download|télécharger|telecharger)/i, icon: <DownloadIcon fontSize="small" /> },
    { match: /(upload|importer|import)/i, icon: <UploadIcon fontSize="small" /> },
];

function resolveLabel(
    label: ResponsiveButtonProps['label'],
    ariaLabel: ButtonProps['aria-label'],
    children: React.ReactNode,
): string {
    if (label) {
        return label;
    }
    if (typeof ariaLabel === 'string') {
        return ariaLabel;
    }
    if (typeof children === 'string' || typeof children === 'number') {
        return String(children);
    }
    return '';
}

function resolveIcon(label: string): React.ReactNode {
    const rule = iconRules.find(({ match }) => match.test(label));
    return rule?.icon ?? <ArrowForwardIcon fontSize="small" />;
}

export function ResponsiveButton({
    label,
    icon,
    tooltip,
    sx,
    children,
    ...buttonProps
}: ResponsiveButtonProps): React.JSX.Element {
    const resolvedLabel = resolveLabel(label, buttonProps['aria-label'], children);
    const tooltipTitle = tooltip ?? resolvedLabel;
    const resolvedIcon = icon ?? resolveIcon(resolvedLabel);

    return (
        <Tooltip title={tooltipTitle} arrow>
            <Box
                component="span"
                sx={{
                    display: buttonProps.fullWidth ? 'flex' : 'inline-flex',
                    width: buttonProps.fullWidth ? '100%' : 'auto',
                }}
            >
                <Button
                    {...buttonProps}
                    aria-label={tooltipTitle}
                    sx={{ gap: 1, flexGrow: buttonProps.fullWidth ? 1 : 0, ...sx }}
                >
                    <Box component="span" sx={{ display: { xs: 'inline-flex', sm: 'none', xl: 'inline-flex' } }}>
                        {resolvedIcon}
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline', xl: 'inline' } }}>
                        {resolvedLabel}
                    </Box>
                </Button>
            </Box>
        </Tooltip>
    );
}
