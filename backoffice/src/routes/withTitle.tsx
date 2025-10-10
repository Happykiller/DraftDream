// src/routes/withTitle.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function withTitle<T extends object>(
  Component: React.ComponentType<T>,
  titleKey: string,
): React.FC<T> {
  return function Wrapped(props: T) {
    const { t } = useTranslation();
    const title = t(titleKey);

    React.useEffect(() => {
      document.title = `${title} - ${t('common.brand.full')}`;
    }, [title, t]);

    return <Component {...props} />;
  };
}
