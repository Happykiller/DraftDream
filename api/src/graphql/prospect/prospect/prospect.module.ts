import { Module } from '@nestjs/common';

import { ProspectResolver } from './prospect.resolver';

@Module({
  imports: [],
  providers: [ProspectResolver],
})
export class ProspectModule { }
