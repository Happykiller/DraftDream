// src\stores\loader.ts
import { create } from 'zustand';

interface LoaderStore {
  loading: boolean;
  setLoading: (val: boolean) => void;
}

export const useLoaderStore = create<LoaderStore>((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
}));