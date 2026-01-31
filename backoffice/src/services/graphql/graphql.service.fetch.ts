// src/services/graphql/graphql.service.fetch.ts
import { env } from '@src/config/env';
import { router } from '@src/routes/router';
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

export interface GraphqlServiceDependencies {
  loggerService?: { error: (msg: string) => void };
}

export class GraphqlServiceFetch {
  private inversify: GraphqlServiceDependencies;

  constructor(inversify: GraphqlServiceDependencies) {
    this.inversify = inversify ?? {};
  }

  /**
   * Clear the session and redirect to login while keeping the unauthorized reason for diagnostics.
   */
  private handleUnauthorized(reason: string): void {
    const message = `[GraphQL] Unauthorized → ${reason}`;
    this.inversify?.loggerService?.error?.(message);

    try {
      sessionStorage.setItem('dd:last-unauthorized', message);
    } catch {
      // ignore storage failures
    }

    try {
      session.getState().reset?.();
    } catch {
      // ignore reset failures
    }

    const search = new URLSearchParams({ reason: 'unauthorized' }).toString();
    router.navigate(`/login?${search}`, { replace: true }).catch(() => {
      window.location.replace(`/login?${search}`);
    });
  }

  /** Normalize strings for comparison */
  private norm(v?: string): string {
    return (v ?? '').trim().toUpperCase();
  }

  /**
   * Detect "unauthorized" from GraphQL errors array.
   * We check both error.message and error.extensions.code.
   */
  private hasUnauthorizedError(errors?: GraphQLErrorItem[]): boolean {
    if (!errors || errors.length === 0) return false;

    // Whitelist of tokens-related or auth-related error markers
    const AUTH_MARKERS = new Set([
      'UNAUTHORIZED',
      'UNAUTHENTICATED',
      'INVALID_TOKEN',
      'EXPIRED_TOKEN',
      'FORBIDDEN',
      'TOKEN_EXPIRED',
      'INVALID_JWT',
    ]);

    return errors.some((e) => {
      const msg = this.norm(e?.message);
      const code = this.norm(e?.extensions?.code);
      // Consider unauthorized if either matches a known marker
      return AUTH_MARKERS.has(msg) || AUTH_MARKERS.has(code);
    });
  }

  async send<TData = unknown, TVars = unknown>(
    payload: {
      query: string;
      variables?: TVars;
      operationName?: string;
    },
    options?: {
      accessToken?: string;
    },
  ): Promise<GraphQLResponse<TData>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = options?.accessToken ?? session.getState().access_token;
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
      return { data: null, errors: [{ message: msg }] };
    }

    // HTTP-level 401 first
    if (response.status === 401) {
      this.handleUnauthorized('HTTP 401');
      return { data: null, errors: [{ message: 'UNAUTHORIZED' }] };
    }

    // HTTP-level 403 (Forbidden) - often used for expired sessions or invalid permissions
    if (response.status === 403) {
      this.handleUnauthorized('HTTP 403');
      return { data: null, errors: [{ message: 'FORBIDDEN' }] };
    }

    let json: GraphQLResponse<TData>;
    try {
      json = (await response.json()) as GraphQLResponse<TData>;
    } catch {
      const msg = `[GraphQL] Invalid JSON (status ${response.status})`;
      this.inversify?.loggerService?.error?.(msg);
      return { data: null, errors: [{ message: msg }] };
    }

    if (this.hasUnauthorizedError(json.errors)) {
      this.handleUnauthorized('GQL errors[].message/code');
      return { data: null, errors: json.errors };
    }

    if (!response.ok) {
      const msg = `[GraphQL] HTTP ${response.status}`;
      this.inversify?.loggerService?.error?.(msg);
      return json ?? ({ data: null, errors: [{ message: msg }] } as GraphQLResponse<TData>);
    }

    return json;
  }
}
