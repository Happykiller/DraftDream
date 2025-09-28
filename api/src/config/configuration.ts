// src\config\configuration.ts
export class Configuration {
  app_name: string;
  version: string;
  env: {
    mode: string;
    port: number;
  };
  admin: {
    password: string;
  };
  graphQL: {
    schemaFileName: boolean | string;
    playground: boolean;
    introspection: boolean;
    installSubscriptionHandlers: boolean;
  };
  jwt: {
    refreshTokenName: string;
    secret: string;
    expire: number;
  };
  mongo: {
    connection_string: string;
    name: string;
  };
  throttle: Array<{
    ttl: number;
    limit: number;
  }>;
}