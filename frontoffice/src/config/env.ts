// src/config/env.ts
/* Safe access to Vite env variables */

type Env = {
  VITE_GRAPHQL_ENDPOINT: string;
  VITE_ACCESS_TOKEN_STORAGE_KEY: string;
};

function requireEnv(name: keyof Env): string {
  const val = import.meta.env[name];
  if (!val) throw new Error(`Missing env: ${name}`);
  return val as string;
}

export const env = {
  graphqlEndpoint: requireEnv('VITE_GRAPHQL_ENDPOINT'),
  accessTokenStorageKey: requireEnv('VITE_ACCESS_TOKEN_STORAGE_KEY'),
};
