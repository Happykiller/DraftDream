// src/config/env.ts
/* Safe access to Vite env variables */

type Env = {
  VITE_GRAPHQL_ENDPOINT: string;
  VITE_ACCESS_TOKEN_STORAGE_KEY: string;
  VITE_API_ENDPOINT?: string;
};

function requireEnv(name: keyof Env): string {
  const val = import.meta.env[name];
  if (!val) throw new Error(`Missing env: ${name}`);
  return val as string;
}

function optionalEnv(name: keyof Env): string | undefined {
  const val = import.meta.env[name];
  if (!val) return undefined;
  return val as string;
}

function deriveRestEndpoint(graphqlEndpoint: string): string {
  return graphqlEndpoint.replace(/\/graphql\/?$/, '');
}

const graphqlEndpoint = requireEnv('VITE_GRAPHQL_ENDPOINT');

export const env = {
  graphqlEndpoint,
  apiEndpoint: optionalEnv('VITE_API_ENDPOINT') ?? deriveRestEndpoint(graphqlEndpoint),
  accessTokenStorageKey: requireEnv('VITE_ACCESS_TOKEN_STORAGE_KEY'),
};
