// src\stores\loader.ts
import { create } from 'zustand';

interface LoaderStore {
  /** Tracks the number of in-flight asynchronous tasks. */
  activeTasks: number;
  /** Reflects whether at least one task is active. */
  loading: boolean;
  /** Registers a new asynchronous task and enables the loader overlay. */
  startTask: () => void;
  /** Marks the completion of a task and disables the overlay when none remain. */
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
