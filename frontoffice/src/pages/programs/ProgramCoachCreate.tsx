// src/pages/ProgramCoachCreate.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';

/** Program creation flow dedicated to coaches. */
export function ProgramCoachCreate(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const builderCopy = React.useMemo(
    () =>
      t('programs-coatch.builder', {
        returnObjects: true,
      }) as unknown as BuilderCopy,
    [t],
  );

  React.useEffect(() => {
    document.title = t('programs-coatch.builder.header.page_title_create');
  }, [t]);

  const handleCancel = React.useCallback(() => {
    navigate('/programs-coach');
  }, [navigate]);

  return (
    <>
      {/* General information */}
      <ProgramBuilderPanel
        builderCopy={builderCopy}
        onCancel={handleCancel}
      />
    </>
  );
}
