// src\config\index.ts
import { merge } from 'lodash';

import { defaults } from '@src/config/defaults';
import type { Configuration } from '@src/config/configuration';

const nodeEnv = process.env.NODE_ENV ?? 'defaults';

let envOverrides: Partial<Configuration> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  envOverrides = require(`./${nodeEnv}`).conf;
} catch {
  console.warn(`⚠️ No override config found for environment: "${nodeEnv}"`);
}

const config: Configuration = merge({}, defaults, envOverrides);

console.log(config.mongo.connection_string);

export { config };
