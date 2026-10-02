"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toErrorMessage } from "@/lib/errors";
import { subscribe, type CollectionName } from "@/storage";

export interface StoreQuery<T> {
  data: T | undefined;
  isLoading: boolean;
  /** True while refetching after a sync event, with data already on screen. */
  isRefreshing: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * The one data-fetching primitive the app uses. Runs `loader`, tracks
 * loading/error, and re-runs automatically when any of `collections` is
 * written — including by another tab. That cross-tab re-read is what makes
 * the live order board and the customer tracking page update without a
 * refresh, and it replaces what React Query would otherwise do.
 */
export function useStoreQuery<T>(
  loader: () => Promise<T>,
  collections: readonly CollectionName[],
  deps: readonly unknown[] = [],
): StoreQuery<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the newest loader without making it a re-subscribe trigger.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  // Ignore results from a run that a newer run has superseded.
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  const run = useCallback(async (isInitial: boolean) => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const result = await loaderRef.current();
      if (!mountedRef.current || runIdRef.current !== runId) return;
      setData(result);
      setError(null);
    } catch (caught) {
      if (!mountedRef.current || runIdRef.current !== runId) return;
      setError(toErrorMessage(caught));
    } finally {
      if (mountedRef.current && runIdRef.current === runId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void run(true);
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (collections.length === 0) return;
    const unsubscribe = subscribe(() => void run(false), collections);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections.join(","), run]);

  const refetch = useCallback(() => void run(false), [run]);

  return { data, isLoading, isRefreshing, error, refetch };
}

/**
 * Wrapper for actions (create/update/delete). Tracks the in-flight state and
 * surfaces a typed error message instead of letting the promise reject into
 * the void.
 */
export function useStoreAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
): {
  run: (...args: TArgs) => Promise<TResult | undefined>;
  isPending: boolean;
  error: string | null;
  reset: () => void;
} {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args: TArgs) => {
    setIsPending(true);
    setError(null);
    try {
      return await actionRef.current(...args);
    } catch (caught) {
      setError(toErrorMessage(caught));
      return undefined;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { run, isPending, error, reset };
}
