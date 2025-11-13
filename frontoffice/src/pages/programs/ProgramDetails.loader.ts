// src/pages/programs/ProgramDetails.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import { programGet } from '@src/services/graphql/programs.service';
import type { Program } from '@src/hooks/programs/usePrograms';

export type ProgramDetailsLoaderStatus = 'success' | 'not_found' | 'error';

export interface ProgramDetailsLoaderData {
  program: Program | null;
  status: ProgramDetailsLoaderStatus;
}

/** Loader ensuring program details are fetched before rendering the detail page. */
export async function programDetailsLoader({
  params,
}: LoaderFunctionArgs): Promise<ProgramDetailsLoaderData> {
  const programId = params.programId;

  if (!programId) {
    return { program: null, status: 'not_found' } satisfies ProgramDetailsLoaderData;
  }

  try {
    const program = await programGet({ programId });

    if (!program) {
      return { program: null, status: 'not_found' } satisfies ProgramDetailsLoaderData;
    }

    return { program, status: 'success' } satisfies ProgramDetailsLoaderData;
  } catch (error) {
    console.error('[ProgramDetailsLoader] Failed to fetch program', error);
    return { program: null, status: 'error' } satisfies ProgramDetailsLoaderData;
  }
}
