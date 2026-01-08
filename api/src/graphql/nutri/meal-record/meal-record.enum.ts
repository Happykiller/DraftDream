// src/graphql/nutri/meal-record/meal-record.enum.ts
import { registerEnumType } from '@nestjs/graphql';

import { MealRecordState as MealRecordStateEnum } from '@src/common/meal-record-state.enum';

export { MealRecordStateEnum };

registerEnumType(MealRecordStateEnum, { name: 'MealRecordStateEnum' });
