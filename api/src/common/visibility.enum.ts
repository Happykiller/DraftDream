// src/common/visibility.enum.ts
// Visibility enum shared across the application to signal public or private resources.
export enum Visibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export type VisibilityValue = `${Visibility}`;
