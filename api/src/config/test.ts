// src\config\test.ts
import { DeepPartial } from '@src/types/deep-partial';
import { Configuration } from '@src/config/configuration';

export const conf: DeepPartial<Configuration> = {
  env: {
    mode: 'test',
  },
};
