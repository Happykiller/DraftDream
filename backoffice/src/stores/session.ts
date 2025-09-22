// src/stores/session.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SessionStoreModel {
  id: string | null;
  access_token: string | null;
  name_first: string | null;
  name_last: string | null;
  role: string | null;
  reset: () => void;
}

const initialState: Omit<SessionStoreModel, 'reset'> = {
  id: null,
  access_token: null,
  name_first: null,
  name_last: null,
  role: null,
};

const contextPersist = persist<SessionStoreModel>(
  (set) => ({
    ...initialState,
    reset: () => set({ ...initialState }),
  }),
  {
    name: 'fitdesk-session-bo',
    storage: createJSONStorage(() => localStorage),
  }
);

export const session = create<SessionStoreModel>()(contextPersist);