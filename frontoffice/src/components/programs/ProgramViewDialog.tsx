import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';

import type { Program } from '@hooks/programs/usePrograms';

import { ProgramDialogLayout } from './ProgramDialogLayout';
import { formatProgramDate } from './programFormatting';
import { ProgramViewContent } from './ProgramViewContent';
import { getProgramAthleteLabel, type ProgramViewTab } from './programViewUtils';

export interface ProgramViewDialogProps {
  open: boolean;
  program: Program;
  onClose: () => void;
}

export function ProgramViewDialog({ open, program, onClose }: ProgramViewDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<ProgramViewTab>('overview');

  const athleteLabel = React.useMemo(() => getProgramAthleteLabel(program), [program]);

  const createdOn = React.useMemo(
    () => formatProgramDate(program.createdAt, i18n.language),
    [i18n.language, program.createdAt],
  );

  const updatedOn = React.useMemo(
    () => formatProgramDate(program.updatedAt, i18n.language),
    [i18n.language, program.updatedAt],
  );

  React.useEffect(() => {
    if (open) {
      return;
    }

    setActiveTab('overview');
  }, [open]);

  const dialogDescription = athleteLabel
    ? t('programs-coatch.view.dialog.subtitle_with_athlete', { athlete: athleteLabel, date: createdOn })
    : t('programs-coatch.view.dialog.subtitle_without_athlete', { date: createdOn });

  const handleTabChange = React.useCallback((value: ProgramViewTab) => {
    setActiveTab(value);
  }, []);

  return (
    <ProgramDialogLayout
      open={open}
      onClose={onClose}
      title={athleteLabel ? `${program.label} - ${athleteLabel}` : program.label}
      description={dialogDescription}
      icon={<VisibilityOutlined fontSize="small" />}
      actions={
        <Button onClick={onClose} variant="contained" color="primary">
          {t('programs-coatch.view.actions.close')}
        </Button>
      }
      actionsProps={{
        sx: {
          justifyContent: 'flex-end',
        },
      }}
    >
      {/* General information */}
      <ProgramViewContent
        program={program}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        updatedOnLabel={t('programs-coatch.list.updated_on', { date: updatedOn })}
      />
    </ProgramDialogLayout>
  );
}
