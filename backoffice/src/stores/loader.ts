// src\stores\loader.ts
import { create } from 'zustand';

interface LoaderStore {
  /** Number of async tasks currently tracked by the global loader. */
  activeTasks: number;
  /** Indicates whether at least one task is still pending. */
  loading: boolean;
  /** Increments the active task counter and shows the overlay. */
  startTask: () => void;
  /** Decrements the counter and hides the overlay when no tasks remain. */
  finishTask: () => void;
}

export const useLoaderStore = create<LoaderStore>((set) => ({
  activeTasks: 0,
  loading: false,
  startTask: () =>
    set((state) => {
      const nextCount = state.activeTasks + 1;
      return {
        activeTasks: nextCount,
        loading: true,
      };
    }),
  finishTask: () =>
    set((state) => {
      const nextCount = Math.max(0, state.activeTasks - 1);
      return {
        activeTasks: nextCount,
        loading: nextCount > 0,
      };
    }),
}));
