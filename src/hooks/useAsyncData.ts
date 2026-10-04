import { useEffect, useState } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

type Result<T> = {
  deps: readonly unknown[];
  data: T | null;
  error: Error | null;
};

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * Runs `fetcher` whenever `deps` change and whenever `reload()` is called.
 *
 * `loading` is derived during render by comparing the deps of the stored result with
 * the current deps, so no state is written synchronously inside the effect. Failures
 * are surfaced through `error` - never replaced with placeholder data.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ deps, data, error: null });
      })
      .catch((value: unknown) => {
        if (!cancelled) setResult({ deps, data: null, error: toError(value) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const current = result && sameDeps(result.deps, deps) ? result : null;

  return {
    data: current?.data ?? null,
    loading: current === null,
    error: current?.error ?? null,
    reload: () => setTick((value) => value + 1),
  };
}