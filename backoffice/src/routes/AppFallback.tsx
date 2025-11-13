// src/routes/AppFallback.tsx
import * as React from 'react';

import LoaderOverlay from '@components/layout/LoaderOverlay';

export function AppFallback(): React.JSX.Element {
  return <LoaderOverlay forceVisible />;
}
