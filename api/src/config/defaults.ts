// src\config\defaults.ts
import { version } from '../../package.json';
import { loadEnv } from '@src/config/loadEnv';
import { Configuration } from '@src/config/configuration';

const env = loadEnv();

export const defaults: Configuration = {
  app_name: 'fitdesk_api',
  version,
  env: {
    mode: 'defaults',
    port: parseInt(env.APP_PORT ?? '3000'),
  },
  graphQL: {
    schemaFileName: true,
    playground: true,
    introspection: true,
    installSubscriptionHandlers: true,
  },
  jwt: {
    refreshTokenName: 'fitdesk-refresh-token',
    secret: env.JWT_SECRET ?? 'secretKey',
    signOptions: {
      expiresIn: '8h',
    },
  },
  mongo: {
    connection_string: env.DB_CONN_STRING ?? 'mongodb://draftdream:password@localhost:27017/draftdream?authSource=draftdream',
    name: env.DB_NAME ?? 'draftdream',
  },
  throttle: [
    {
      ttl: 60000,
      limit: 10,
    },
  ],
};
