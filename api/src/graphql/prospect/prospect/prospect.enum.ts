import { registerEnumType } from '@nestjs/graphql';

import { ProspectStatus } from '@src/common/prospect-status.enum';

export const ProspectStatusEnum = ProspectStatus;

registerEnumType(ProspectStatusEnum, { name: 'ProspectStatusEnum' });
