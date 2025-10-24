import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { BoxProps } from '@mui/material/Box';
import type { DialogContentProps } from '@mui/material/DialogContent';
import type { DialogProps } from '@mui/material/Dialog';
import type { DialogActionsProps } from '@mui/material/DialogActions';

interface ProgramDialogLayoutProps {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  actions: React.ReactNode;
  children: React.ReactNode;
  onClose?: DialogProps['onClose'];
  dialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'children'>;
  contentProps?: DialogContentProps;
  actionsProps?: DialogActionsProps;
  formComponent?: BoxProps['component'];
  formProps?: Omit<BoxProps, 'component'>;
}

/**
 * ProgramDialogLayout centralizes the visual structure shared by program dialogs
 * so that new dialogs remain consistent and accessible by default.
 */
export function ProgramDialogLayout({
  open,
  title,
  description,
  icon,
  actions,
  children,
  onClose,
  dialogProps,
  contentProps,
  actionsProps,
  formComponent = 'div',
  formProps,
}: ProgramDialogLayoutProps): React.JSX.Element {
  const theme = useTheme();
  const { fullWidth = true, ...restDialogProps } = dialogProps ?? {};
  const { dividers = true, ...restContentProps } = contentProps ?? {};
  const { sx: actionsSx, ...restActionsProps } = actionsProps ?? {};
  const headerBackground = alpha(theme.palette.success.main, 0.2);

  const mergedActionsSx = !actionsSx
    ? { backgroundColor: '#e0dcdce0' }
    : Array.isArray(actionsSx)
      ? [{ backgroundColor: '#e0dcdce0' }, ...actionsSx]
      : [{ backgroundColor: '#e0dcdce0' }, actionsSx];

  return (
    <Dialog open={open} onClose={onClose} fullWidth={fullWidth} {...restDialogProps}>
      <Box component={formComponent} {...formProps}>
        <DialogTitle
          sx={{
            backgroundColor: headerBackground,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'success.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers={dividers} {...restContentProps}>
          {children}
        </DialogContent>
        <DialogActions sx={mergedActionsSx} {...restActionsProps}>
          {actions}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
