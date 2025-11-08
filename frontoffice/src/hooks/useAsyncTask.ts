// src\hooks\useAsyncTask.ts
import * as React from 'react';

import { useLoaderStore } from '@stores/loader';

type AsyncTask = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Wraps asynchronous operations to keep the global loader overlay in sync.
 * Errors are re-thrown so the caller can surface them through flash messages
 * or local state while the loader is reliably reset.
 */
export const useAsyncTask = () => {
  const startTask = useLoaderStore((state) => state.startTask);
  const finishTask = useLoaderStore((state) => state.finishTask);

  const execute = React.useCallback<AsyncTask>(
    async (task) => {
      startTask();
      try {
        return await task();
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
