import {
  fetchAnalytics,
  fetchCategories,
  fetchGapReports,
  fetchPosts,
  fetchProfile,
  fetchSuppliers,
} from '../lib/api';
import {
  mockCategories,
  mockFeaturedSupplier,
  mockGapReports,
  mockPosts,
  mockProfile,
  mockSuppliers,
} from '../lib/mockData';
import { useAsyncData } from './useAsyncData';

export function usePosts() {
  return useAsyncData(async () => {
    try {
      return await fetchPosts();
    } catch {
      return mockPosts;
    }
  });
}

export function useCategories() {
  return useAsyncData(async () => {
    try {
      return await fetchCategories();
    } catch {
      return mockCategories;
    }
  });
}

export function useSuppliers() {
  return useAsyncData(async () => {
    try {
      const all = await fetchSuppliers();
      const featured = all.find((s) => s.featured) ?? mockFeaturedSupplier;
      const list = all.filter((s) => !s.featured).length ? all.filter((s) => !s.featured) : mockSuppliers;
      return { featured, list };
    } catch {
      return { featured: mockFeaturedSupplier, list: mockSuppliers };
    }
  });
}

export function useGapReports() {
  return useAsyncData(async () => {
    try {
      return await fetchGapReports();
    } catch {
      return mockGapReports;
    }
  });
}

export function useAnalytics(category: string, location: string) {
  return useAsyncData(async () => {
    try {
      return await fetchAnalytics(category, location);
    } catch {
      return {
        category,
        location,
        consumerDemandPct: 84,
        marketSaturationPct: 32,
        demandLabel: '84% (High)',
        demandColor: '#001533',
        saturationLabel: '32% (Low)',
        saturationColor: '#815600',
      };
    }
  }, [category, location]);
}

export function useProfile() {
  return useAsyncData(async () => {
    try {
      return await fetchProfile();
    } catch {
      return mockProfile;
    }
  });
}