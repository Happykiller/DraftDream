// src/hooks/useFlashStore.ts
import { create } from 'zustand';
import type { AlertColor } from '@mui/material';

export interface FlashQueueItem {
  id: number;
  msg: string;
  severity: AlertColor;
  timeout?: ReturnType<typeof setTimeout>;
}

export interface FlashStore {
  queue: FlashQueueItem[];
  open: (msg: string, severity?: AlertColor) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
  close: (id: number) => void;
}

let idCounter = 0;

export const useFlashStore = create<FlashStore>((set, get) => ({
  queue: [],
  open: (msg, severity = 'info') => {
    const id = ++idCounter;
    const timeout = setTimeout(() => get().close(id), 6000);
    set(state => ({
      queue: [...state.queue, { id, msg, severity, timeout }],
    }));
  },
  success: (msg) => get().open(msg, 'success'),
  error: (msg) => get().open(msg, 'error'),
  warning: (msg) => get().open(msg, 'warning'),
  info: (msg) => get().open(msg, 'info'),
  close: (id) => {
    const { queue } = get();
    const item = queue.find(i => i.id === id);
    if (item?.timeout) clearTimeout(item.timeout);
    set({ queue: queue.filter(i => i.id !== id) });
  },
}));
