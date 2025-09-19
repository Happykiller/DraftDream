// src/routes/withTitle.tsx
import * as React from 'react';

export function withTitle<T extends object>(
  Component: React.ComponentType<T>,
  title: string,
): React.FC<T> {
  return function Wrapped(props: T) {
    React.useEffect(() => {
      document.title = `${title} – FitDesk BO`;
    }, []);
    return <Component {...props} />;
  };
}
