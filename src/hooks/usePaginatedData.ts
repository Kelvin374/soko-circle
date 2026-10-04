import { useEffect, useRef, useState } from 'react';
import type { AsyncState } from './useAsyncData';

/**
 * `useAsyncData` plus `loadMore` for range-paginated lists.
 *
 * Failures are surfaced, never replaced with placeholder data. `loadMore` keeps
 * the pages already on screen if the next page fails so the user is not dumped
 * back to an error screen.
 */
export type PaginatedState<T> = AsyncState<T[]> & {
  loadMore: () => void;
  loadingMore: boolean;
  loadMoreError: Error | null;
  hasMore: boolean;
  /** Replaces the list without refetching (used after optimistic mutations). */
  setItems: (updater: (current: T[]) => T[]) => void;
};

type Page<T> = { items: T[]; nextOffset: number | null };

type Snapshot<T> = {
  deps: readonly unknown[];
  items: T[];
  nextOffset: number | null;
  error: Error | null;
};

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function usePaginatedData<T>(opts: {
  fetchPage: (cursor: number) => Promise<Page<T>>;
  /** Stable identity of the query, e.g. `category`. Changing it resets the list. */
  deps?: readonly unknown[];
}): PaginatedState<T> {
  const { fetchPage, deps = [] } = opts;

  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const id = ++requestIdRef.current;
    let cancelled = false;

    fetchPage(0)
      .then((page) => {
        if (cancelled || id !== requestIdRef.current) return;
        setSnapshot({ deps, items: page.items, nextOffset: page.nextOffset, error: null });
        setLoadMoreError(null);
      })
      .catch((value: unknown) => {
        if (cancelled || id !== requestIdRef.current) return;
        setSnapshot({ deps, items: [], nextOffset: null, error: toError(value) });
        setLoadMoreError(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const current = snapshot && sameDeps(snapshot.deps, deps) ? snapshot : null;
  const nextOffset = current?.nextOffset ?? null;

  const loadMore = () => {
    if (nextOffset === null) return;
    const id = requestIdRef.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    fetchPage(nextOffset)
      .then((page) => {
        if (id !== requestIdRef.current) return;
        setSnapshot((prev) =>
          prev && sameDeps(prev.deps, deps)
            ? { ...prev, items: [...prev.items, ...page.items], nextOffset: page.nextOffset }
            : prev,
        );
      })
      .catch((value: unknown) => {
        if (id !== requestIdRef.current) return;
        setLoadMoreError(toError(value));
      })
      .finally(() => {
        if (id === requestIdRef.current) setLoadingMore(false);
      });
  };

  const setItems = (updater: (currentItems: T[]) => T[]) => {
    setSnapshot((prev) =>
      prev && sameDeps(prev.deps, deps) ? { ...prev, items: updater(prev.items) } : prev,
    );
  };

  return {
    data: current?.items ?? [],
    loading: current === null,
    error: current?.error ?? null,
    reload: () => setTick((value) => value + 1),
    loadMore,
    loadingMore,
    loadMoreError,
    hasMore: nextOffset !== null,
    setItems,
  };
}