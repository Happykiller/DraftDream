// src/pages/programs/ProgramCoachEdit.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import { programGet } from '@src/services/graphql/programs.service';
import type { Program } from '@src/hooks/programs/usePrograms';

export type ProgramCoachEditLoaderStatus = 'success' | 'not_found' | 'error';

export interface ProgramCoachEditLoaderData {
  program: Program | null;
  status: ProgramCoachEditLoaderStatus;
}

/** Ensures the target program is loaded before rendering the edit builder. */
export async function programCoachEditLoader({
  params,
}: LoaderFunctionArgs): Promise<ProgramCoachEditLoaderData> {
  const programId = params.programId;

  if (!programId) {
    return { program: null, status: 'not_found' } satisfies ProgramCoachEditLoaderData;
  }

  try {
    const program = await programGet({ programId });

    if (!program) {
      return { program: null, status: 'not_found' } satisfies ProgramCoachEditLoaderData;
    }

    return { program, status: 'success' } satisfies ProgramCoachEditLoaderData;
  } catch (error) {
    console.error('[ProgramCoachEditLoader] Failed to fetch program', error);
    return { program: null, status: 'error' } satisfies ProgramCoachEditLoaderData;
  }
}
