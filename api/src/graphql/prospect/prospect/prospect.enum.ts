import { registerEnumType } from '@nestjs/graphql';

import { ProspectStatus as ProspectStatusEnum } from '@src/common/prospect-status.enum';
export { ProspectStatusEnum };

registerEnumType(ProspectStatusEnum, { name: 'ProspectStatusEnum' });
