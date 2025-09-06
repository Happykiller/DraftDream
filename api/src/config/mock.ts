// src\config\mock.ts
import { DeepPartial } from '@src/types/deep-partial';
import { Configuration } from '@src/config/configuration';

export const conf: DeepPartial<Configuration> = {
  env: {
    mode: 'mock',
  },
};
