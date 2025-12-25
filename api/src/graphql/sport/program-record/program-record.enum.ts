import { registerEnumType } from '@nestjs/graphql';

import { ProgramRecordState as ProgramRecordStateEnum } from '@src/common/program-record-state.enum';

export { ProgramRecordStateEnum };

registerEnumType(ProgramRecordStateEnum, { name: 'ProgramRecordStateEnum' });
