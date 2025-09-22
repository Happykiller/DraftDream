// src/services/graphql/graphql.service.fetch.ts
import { env } from '@src/config/env';
import { session } from '@stores/session';

type GraphQLErrorExt = {
  code?: string;
  stacktrace?: string[];
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

  private handleUnauthorized(reason: string): void {
    try {
      session.getState().reset?.();
    } catch {
      // ignore reset failures
    }
    this.inversify?.loggerService?.error?.(`[GraphQL] Unauthorized → ${reason}`);
    window.location.replace('/login');
  }

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

    if (this.hasUnauthorizedError(json.errors)) {
      this.handleUnauthorized('GQL errors[].message/code');
      return { data: null as any, errors: json.errors };
    }

    if (!response.ok) {
      const msg = `[GraphQL] HTTP ${response.status}`;
      this.inversify?.loggerService?.error?.(msg);
      return json ?? ({ data: null as any, errors: [{ message: msg }] } as GraphQLResponse<TData>);
    }

    return json;
  }
}
