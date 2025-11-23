// src/services/rest/prospects.service.ts
import { env } from '@src/config/env';
import { ProspectStatusEnum } from '@src/commons/prospects/status';
import { session } from '@stores/session';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

function buildApiUrl(path: string): string {
  const base = env.apiEndpoint.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function handleUnauthorized(): void {
  try {
    session.getState().reset?.();
  } catch {
    // ignore reset failures
  }
  window.location.replace('/login');
}

/** Update a prospect status through the REST API. */
export async function updateProspectStatus(
  prospectId: string,
  status: ProspectStatusEnum,
): Promise<void> {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  const token = session.getState().access_token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(`/prospects/${encodeURIComponent(prospectId)}`), {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`[REST] Failed to update prospect status (${response.status})`);
  }
}
