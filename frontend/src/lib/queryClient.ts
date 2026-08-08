import { QueryClient } from '@tanstack/react-query';
import { features } from '@/config/features';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // If cache is disabled via feature flag, staleTime is 0 (always fetch).
      // Otherwise, hold data for 5 minutes, relying on SSE for invalidation.
      // TanStack Query inherently deduplicates identical concurrent requests automatically.
      staleTime: features.CACHE_ENABLED ? 1000 * 60 * 5 : 0,
      gcTime: features.CACHE_ENABLED ? 1000 * 60 * 10 : 0, // 10 mins garbage collection
      retry: false, // Retry logic is natively handled by our apiClient for targeted transient errors
      refetchOnWindowFocus: features.CACHE_ENABLED,
      refetchOnReconnect: features.CACHE_ENABLED,
    },
  },
});

// Native BroadcastChannel for strict cross-tab synchronization of queries
// When an optimistic update or manual invalidation happens in Tab A, it broadcasts to Tab B.
const syncChannel = new BroadcastChannel('elestyle_query_sync');

syncChannel.onmessage = (event) => {
  if (event.data?.type === 'INVALIDATE_QUERIES' && event.data?.queryKey) {
    queryClient.invalidateQueries({ queryKey: event.data.queryKey });
  }
};

/**
 * Broadcasts query invalidation to all other open tabs in the browser.
 */
export const broadcastInvalidation = (queryKey: any[]) => {
  syncChannel.postMessage({ type: 'INVALIDATE_QUERIES', queryKey });
};
