// src/graphql/common/visibility.enum.ts
// GraphQL registration helper for the shared visibility enum.
import { registerEnumType } from '@nestjs/graphql';

import { Visibility } from '@src/common/visibility.enum';

const registeredNames = new Set<string>();

export const registerVisibilityEnum = (name: string): void => {
  if (registeredNames.has(name)) {
    return;
  }

  registerEnumType(Visibility, { name });
  registeredNames.add(name);
};

registerVisibilityEnum('Visibility');

export { Visibility };
