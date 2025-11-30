// src/common/visibility.enum.ts
// Visibility enum shared across the application to signal public or private resources.
export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  HYBRID = 'hybrid',
}

export type VisibilityValue = `${Visibility}`;
