import * as React from 'react';
import type {
  BoxProps,
  DialogActionsProps,
  DialogContentProps,
  DialogProps,
} from '@mui/material';

import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

export interface StandardDialogProps {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  actions: React.ReactNode;
  children: React.ReactNode;
  onClose?: DialogProps['onClose'];
  dialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'children'>;
  contentProps?: DialogContentProps;
  actionsProps?: DialogActionsProps;
  formComponent?: BoxProps['component'];
  formProps?: Omit<Omit<BoxProps, 'component'>, 'onSubmit'> & React.ComponentPropsWithoutRef<'form'>;
}

/**
 * StandardDialog keeps consistent dialog layout for common confirmation flows.
 */
export function StandardDialog({
  open,
  title,
  description,
  icon,
  tone = 'success',
  actions,
  children,
  onClose,
  dialogProps,
  contentProps,
  actionsProps,
  formComponent,
  formProps,
}: StandardDialogProps): React.JSX.Element {
  return (
    <ProgramDialogLayout
      open={open}
      title={title}
      description={description}
      icon={icon}
      tone={tone}
      actions={actions}
      onClose={onClose}
      dialogProps={dialogProps}
      contentProps={contentProps}
      actionsProps={actionsProps}
      formComponent={formComponent}
      formProps={formProps}
    >
      {/* General information */}
      {children}
    </ProgramDialogLayout>
  );
}
