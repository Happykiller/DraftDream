// src/graphql/common/ROLE.ts
import { registerEnumType } from '@nestjs/graphql';

import { Role } from '@src/common/role.enum';

registerEnumType(Role, { name: 'Role' });

export { Role };
