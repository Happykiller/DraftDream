// src/hooks/useTabParams.ts
// ⚠️ Comment in English: Namespaced URLSearchParams (page, limit, q) per panel.
// It avoids mutating the same instance; uses functional updates for Router v6+.

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

export interface TabParams {
  page: number;
  limit: number;
  q: string;
  type?: string;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  setQ: (val: string) => void;
  setType: (val: string) => void;
}

export function useTabParams(prefix: string, defaults = { page: 1, limit: 10 }): TabParams {
  const [params, setParams] = useSearchParams();

  const page = Number.parseInt(params.get(`${prefix}_page`) || String(defaults.page), 10);
  const limit = Number.parseInt(params.get(`${prefix}_limit`) || String(defaults.limit), 10);
  const q = params.get(`${prefix}_q`) || '';
  const type = params.get(`${prefix}_type`) || '';

  const setPage = React.useCallback(
    (p: number) =>
      setParams(prev => {
        const sp = new URLSearchParams(prev);
        sp.set(`${prefix}_page`, String(p));
        return sp;
      }, { replace: true }),
    [setParams, prefix]
  );

  const setLimit = React.useCallback(
    (l: number) =>
      setParams(prev => {
        const sp = new URLSearchParams(prev);
        sp.set(`${prefix}_limit`, String(l));
        sp.set(`${prefix}_page`, '1');
        return sp;
      }, { replace: true }),
    [setParams, prefix]
  );

  const setQ = React.useCallback(
    (val: string) =>
      setParams(prev => {
        const sp = new URLSearchParams(prev);
        if (val) sp.set(`${prefix}_q`, val);
        else sp.delete(`${prefix}_q`);
        sp.set(`${prefix}_page`, '1');
        return sp;
      }, { replace: true }),
    [setParams, prefix]
  );

  const setType = React.useCallback(
    (val: string) =>
      setParams(prev => {
        const sp = new URLSearchParams(prev);
        if (val) sp.set(`${prefix}_type`, val);
        else sp.delete(`${prefix}_type`);
        sp.set(`${prefix}_page`, '1');
        return sp;
      }, { replace: true }),
    [setParams, prefix]
  );

  return { page, limit, q, type, setPage, setLimit, setQ, setType };
}
