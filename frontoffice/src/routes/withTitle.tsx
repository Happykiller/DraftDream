// src/routes/withTitle.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function withTitle<T extends object>(
  Component: React.ComponentType<T>,
  titleKey: string,
): React.FC<T> {
  return function Wrapped(props: T) {
    const { t } = useTranslation();
    const pageTitle = t(titleKey);
    const fullTitle = t('app.title_template', { page: pageTitle });

    React.useEffect(() => {
      document.title = fullTitle;
    }, [fullTitle]);

    return <Component {...props} />;
  };
}
