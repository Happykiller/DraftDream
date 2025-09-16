// src\hooks\useAsyncTask.ts
import { useLoaderStore } from '@stores/loader';

export const useAsyncTask = () => {
  const setLoading = useLoaderStore((s:any) => s.setLoading);

  const execute = async <T>(task: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    try {
      const result = await task();
      return result;
    } catch (err) {
      console.error('[AsyncTask] Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute };
};
