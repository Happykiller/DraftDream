// src\hooks\useAsyncTask.ts
import * as React from 'react';

import { useLoaderStore } from '@stores/loader';

export const useAsyncTask = () => {
  const startTask = useLoaderStore((state) => state.startTask);
  const finishTask = useLoaderStore((state) => state.finishTask);

  const execute = React.useCallback(
    async <T>(task: () => Promise<T>): Promise<T> => {
      startTask();
      try {
        const result = await task();
        return result;
      } catch (error) {
        console.error('[AsyncTask] Error:', error);
        throw error;
      } finally {
        finishTask();
      }
    },
    [finishTask, startTask],
  );

  return { execute };
};
