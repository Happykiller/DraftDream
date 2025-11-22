// src/graphql/client/activity-preference/client-activity-preference.module.ts
import { Module } from '@nestjs/common';

import { ClientActivityPreferenceResolver } from './client-activity-preference.resolver';

@Module({
  imports: [],
  providers: [
    ClientActivityPreferenceResolver,
  ],
})
export class ClientActivityPreferenceModule {}
