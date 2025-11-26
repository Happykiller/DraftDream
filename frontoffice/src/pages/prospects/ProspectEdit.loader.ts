// src/pages/prospects/ProspectEdit.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import { prospectGet } from '@services/graphql/prospects.service';
import type { Prospect } from '@app-types/prospects';

export type ProspectEditLoaderStatus = 'success' | 'not_found' | 'error';

export interface ProspectEditLoaderData {
  prospect: Prospect | null;
  status: ProspectEditLoaderStatus;
}

/** Loads the prospect being edited before rendering the form. */
export async function prospectEditLoader({ params }: LoaderFunctionArgs): Promise<ProspectEditLoaderData> {
  const prospectId = params.prospectId;

  if (!prospectId) {
    return { prospect: null, status: 'not_found' } satisfies ProspectEditLoaderData;
  }

  try {
    const prospect = await prospectGet(prospectId);
    if (!prospect) {
      return { prospect: null, status: 'not_found' } satisfies ProspectEditLoaderData;
    }

    return { prospect, status: 'success' } satisfies ProspectEditLoaderData;
  } catch (error) {
    console.error('[prospectEditLoader] Failed to fetch prospect', error);
    return { prospect: null, status: 'error' } satisfies ProspectEditLoaderData;
  }
}
