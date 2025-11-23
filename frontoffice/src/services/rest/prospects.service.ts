// src/services/rest/prospects.service.ts
import { env } from '@src/config/env';
import { ProspectStatusEnum } from '@src/commons/prospects/status';
import type { Prospect } from '@app-types/prospects';
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

function buildUpdateBody(prospect: Prospect, status: ProspectStatusEnum) {
  return {
    id: prospect.id,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    email: prospect.email,
    phone: prospect.phone ?? undefined,
    status,
    levelId: prospect.levelId ?? prospect.level?.id ?? undefined,
    sourceId: prospect.sourceId ?? prospect.source?.id ?? undefined,
    objectiveIds: prospect.objectiveIds?.length ? prospect.objectiveIds : undefined,
    activityPreferenceIds: prospect.activityPreferenceIds?.length
      ? prospect.activityPreferenceIds
      : undefined,
    medicalConditions: prospect.medicalConditions ?? undefined,
    allergies: prospect.allergies ?? undefined,
    notes: prospect.notes ?? undefined,
    budget: prospect.budget ?? undefined,
    dealDescription: prospect.dealDescription ?? undefined,
    desiredStartDate: prospect.desiredStartDate ?? undefined,
  } satisfies Record<string, unknown>;
}

/** Update a prospect status through the REST API using the standard update payload. */
export async function updateProspectStatus(prospect: Prospect, status: ProspectStatusEnum): Promise<void> {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  const token = session.getState().access_token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(`/prospects/${encodeURIComponent(prospect.id)}`), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(buildUpdateBody(prospect, status)),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`[REST] Failed to update prospect status (${response.status})`);
  }
}
