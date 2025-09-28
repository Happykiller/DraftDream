// src\config\defaults.ts
import { version } from '../../package.json';
import { Configuration } from '@src/config/configuration';

export const defaults: Configuration = {
  app_name: 'fitdesk_api',
  version,
  env: {
    mode: 'defaults',
    port: parseInt(process.env.APP_PORT ?? '3000'),
  },
  admin: {
    password: process.env.APP_ADMIN_PASSWORD ?? 'change-me',
  },
  graphQL: {
    schemaFileName: true,
    playground: true,
    introspection: true,
    installSubscriptionHandlers: true,
  },
  jwt: {
    refreshTokenName: 'fitdesk-refresh-token',
    secret: process.env.JWT_SECRET ?? 'secretKey',
    expire: 480, //8h
  },
  mongo: {
    connection_string: process.env.DB_CONN_STRING ?? 'mongodb://fitdesk:password@localhost:27017/fitdesk?authSource=fitdesk',
    name: process.env.DB_NAME ?? 'fitdesk',
  },
  throttle: [
    {
      ttl: 60000,
      limit: 10,
    },
  ],
};
