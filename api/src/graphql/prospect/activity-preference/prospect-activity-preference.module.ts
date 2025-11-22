// src/graphql/prospect/activity-preference/prospect-activity-preference.module.ts
import { Module } from '@nestjs/common';

import { ProspectActivityPreferenceResolver } from './prospect-activity-preference.resolver';

@Module({
  imports: [],
  providers: [ProspectActivityPreferenceResolver],
})
export class ProspectActivityPreferenceModule { }
