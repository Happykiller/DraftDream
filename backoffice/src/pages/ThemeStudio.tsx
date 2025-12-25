// src/pages/ThemeStudio.tsx
import * as React from 'react';

import { ThemeStudioContent } from '@pages/theme-studio/ThemeStudioContent';

export function ThemeStudio(): React.JSX.Element {
  return (
    <React.Fragment>
      {/* General information */}
      <ThemeStudioContent />
    </React.Fragment>
  );
}

export default ThemeStudio;
