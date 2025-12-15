// src/pages/athletes/AthleteLinkDetails.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import type { CoachAthleteLink } from '@app-types/coachAthletes';
import { coachAthleteGet } from '@services/graphql/coachAthletes.service';

export type AthleteLinkDetailsLoaderStatus = 'success' | 'not_found' | 'error';

export interface AthleteLinkDetailsLoaderResult {
  link: CoachAthleteLink | null;
  status: AthleteLinkDetailsLoaderStatus;
}

/** Fetches the athlete link shown on the dedicated detail page. */
export async function athleteLinkDetailsLoader({
  params,
}: LoaderFunctionArgs): Promise<AthleteLinkDetailsLoaderResult> {
  const linkId = params.linkId;
  if (!linkId) {
    return { link: null, status: 'not_found' } satisfies AthleteLinkDetailsLoaderResult;
  }

  try {
    const link = await coachAthleteGet({ linkId });
    if (!link) {
      return { link: null, status: 'not_found' } satisfies AthleteLinkDetailsLoaderResult;
    }

    return { link, status: 'success' } satisfies AthleteLinkDetailsLoaderResult;
  } catch (caught: unknown) {
    console.error('[athleteLinkDetailsLoader] Failed to fetch athlete link', caught);
    return { link: null, status: 'error' } satisfies AthleteLinkDetailsLoaderResult;
  }
}
