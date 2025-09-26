// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { EquipmentResolver } from '@graphql/equipment/equipment.resolver';

@Module({
  imports: [],
  providers: [
    EquipmentResolver,
  ],
})
export class EquipmentModule {}
