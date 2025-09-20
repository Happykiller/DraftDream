// src/services/graphql/graphql.service.fetch.ts
// ⚠️ Comment in English: GraphQL fetch with robust UNAUTHORIZED handling (HTTP 401 or GQL errors).

import { env } from '@src/config/env';
// NOTE: If your store path is '@stores/context', switch the import accordingly:
import { session } from '@stores/session';

type GraphQLErrorExt = {
  code?: string;
  stacktrace?: string[]; // shape as sent by Apollo/Nest (optional)
  [k: string]: unknown;
};

type GraphQLErrorItem = {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: GraphQLErrorExt;
};

export type GraphQLResponse<TData> = {
  data?: TData | null;
  errors?: GraphQLErrorItem[];
};

export class GraphqlServiceFetch {
  private inversify: { loggerService?: { error: (msg: string) => void } };

  constructor(inversify: any) {
    this.inversify = inversify ?? {};
  }

  // ⚠️ Comment in English: Centralized unauthorized handler.
  private handleUnauthorized(reason: string): void {
    try {
      session.getState().reset?.();
    } catch {
      // ignore reset failures
    }
    this.inversify?.loggerService?.error?.(`[GraphQL] Unauthorized → ${reason}`);
    // Hard redirect outside router to ensure clean app state
    window.location.replace('/login');
  }

  // ⚠️ Comment in English: Detect common UNAUTHORIZED patterns in GraphQL errors.
  private hasUnauthorizedError(errors?: GraphQLErrorItem[]): boolean {
    if (!errors || errors.length === 0) return false;
    return errors.some((e) => {
      const msg = (e?.message || '').toUpperCase();
      const code = (e?.extensions?.code || '').toUpperCase();
      return msg === 'UNAUTHORIZED' || code === 'UNAUTHORIZED';
    });
  }

  async send<TData = unknown, TVars = unknown>(payload: {
    query: string;
    variables?: TVars;
    operationName?: string;
  }): Promise<GraphQLResponse<TData>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = session.getState().access_token;
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(env.graphqlEndpoint, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.inversify?.loggerService?.error?.(`[GraphQL] Network error: ${msg}`);
      // Network errors are not auth-related; return a GQL-like error shape
      return { data: null as any, errors: [{ message: msg }] };
    }

    // HTTP-level 401 first
    if (response.status === 401) {
      this.handleUnauthorized('HTTP 401');
      return { data: null as any, errors: [{ message: 'UNAUTHORIZED' }] };
    }

    let json: GraphQLResponse<TData>;
    try {
      json = (await response.json()) as GraphQLResponse<TData>;
    } catch {
      const msg = `[GraphQL] Invalid JSON (status ${response.status})`;
      this.inversify?.loggerService?.error?.(msg);
      return { data: null as any, errors: [{ message: msg }] };
    }

    // GraphQL-level unauthorized
    if (this.hasUnauthorizedError(json.errors)) {
      this.handleUnauthorized('GQL errors[].message/code');
      return { data: null as any, errors: json.errors };
    }

    // Non-ok HTTP but not 401 → log and pass through
    if (!response.ok) {
      const msg = `[GraphQL] HTTP ${response.status}`;
      this.inversify?.loggerService?.error?.(msg);
      // Keep the payload so caller can decide
      return json ?? ({ data: null as any, errors: [{ message: msg }] } as GraphQLResponse<TData>);
    }

    return json;
  }
}
