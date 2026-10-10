import { useCallback } from 'react';
import {
  fetchAnalytics,
  fetchCategories,
  fetchDataSources,
  fetchGapReports,
  fetchGeoLocations,
  fetchLikedPostIds,
  fetchMyMentorApplication,
  fetchPostCategories,
  fetchPostsPage,
  fetchProfile,
  fetchSuppliers,
  ProfileMissingError,
  SignInRequiredError,
} from '../lib/api';
import { useAsyncData } from './useAsyncData';
import { usePaginatedData } from './usePaginatedData';
import type { PaginatedState } from './usePaginatedData';
import type { FeedPost, Supplier } from '../types';

/**
 * Every hook here surfaces its error to the caller. There is no mock fallback:
 * a failed request must render `ErrorState`, not invented data.
 */

export function useFeed(category: string | null = null): PaginatedState<FeedPost> {
  const fetchPage = useCallback(
    (cursor: number) => fetchPostsPage({ offset: cursor, category }),
    [category],
  );

  return usePaginatedData<FeedPost>({ fetchPage, deps: [category] });
}

/** Distinct categories present in the feed, for the filter chips. */
export function usePostCategories() {
  return useAsyncData(() => fetchPostCategories(), []);
}

export function useCategories() {
  return useAsyncData(() => fetchCategories(), []);
}

/** Curated articles/sources shown on the home "Reads" strip. */
export function useDataSources(limit?: number) {
  return useAsyncData(() => fetchDataSources(limit), [limit]);
}

export function useSuppliers(opts?: { category?: string | null; county?: string | null }) {
  const category = opts?.category ?? null;
  const county = opts?.county ?? null;
  return useAsyncData(
    async () => {
      const list = await fetchSuppliers({ category, county });
      const featured = list.find((s) => s.featured) ?? null;
      const rest = list.filter((s) => s.id !== featured?.id);
      return { featured, list: rest satisfies Supplier[] };
    },
    [category, county],
  );
}

/**
 * Deep-dive reports for a category + location. County gap-signal reports are
 * included for the location as well as the category-specific ones.
 */
export function useGapReports(opts?: { category?: string | null; location?: string | null }) {
  const category = opts?.category ?? null;
  const location = opts?.location ?? null;
  return useAsyncData(() => fetchGapReports({ category, location }), [category, location]);
}

/** Selectable locations loaded from the geo reference tables. */
export function useGeoLocations() {
  return useAsyncData(() => fetchGeoLocations(), []);
}

/**
 * `null` analytics means "we hold no data for this category/location" — the UI
 * shows an explicit no-data state rather than placeholder percentages.
 */
export function useAnalytics(category: string, location: string) {
  return useAsyncData(() => fetchAnalytics(category, location), [category, location]);
}

export function useProfile() {
  return useAsyncData(() => fetchProfile(), []);
}

/** `null` when the user has never filed a mentor application. */
export function useMentorApplication() {
  return useAsyncData(async () => {
    try {
      return await fetchMyMentorApplication();
    } catch (e) {
      // A missing profile / revoked session should not break the Account tab.
      if (e instanceof ProfileMissingError || e instanceof SignInRequiredError) return null;
      throw e;
    }
  }, []);
}

/** Post ids the signed-in user liked. Empty set when not signed in. */
export function useLikedPostIds() {
  return useAsyncData(async () => new Set(await fetchLikedPostIds()), []);
}