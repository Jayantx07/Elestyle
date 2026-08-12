import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { catalogSyncService } from '@/services/liveSyncService';
import { categoryKeys, subCategoryKeys, productKeys, landingBannerKeys, couponKeys, videoHighlightKeys, featureHighlightKeys } from '@/lib/queryKeys';
import { features } from '@/config/features';

export function useLiveSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!features.LIVE_SYNC_ENABLED) return;

    const connectIfVisible = () => {
      if (document.visibilityState === 'visible' && features.SSE_ENABLED) {
        catalogSyncService.connect();
        // Since we might have missed events while hidden, invalidate actively tracked catalog queries
        if (features.CACHE_ENABLED) {
          queryClient.invalidateQueries({ queryKey: categoryKeys.all });
          queryClient.invalidateQueries({ queryKey: subCategoryKeys.all });
          queryClient.invalidateQueries({ queryKey: productKeys.all });
          queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
          queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
          queryClient.invalidateQueries({ queryKey: featureHighlightKeys.all });
        }
      } else {
        catalogSyncService.close();
      }
    };

    // Initial connection
    connectIfVisible();

    // Subscribe to catalog invalidation events
    const unsubscribe = catalogSyncService.subscribe((event) => {
      if (!features.CACHE_ENABLED) return; // If cache is disabled, we don't need to invalidate it
      
      console.log('[LiveSync] Invalidating cache for:', event.entity, event.entityId || 'bulk');

      if (event.entity === 'category') {
        // Idempotently invalidates any active category queries to trigger a background refetch
        queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      } else if (event.entity === 'subcategory') {
        queryClient.invalidateQueries({ queryKey: subCategoryKeys.all });
      } else if (event.entity === 'product') {
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      } else if (event.entity === 'landingBanner') {
        queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
      } else if (event.entity === 'videoHighlight') {
        queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
      } else if (event.entity === 'featureHighlight') {
        queryClient.invalidateQueries({ queryKey: featureHighlightKeys.all });
      } else if (event.entity === 'coupon') {
        queryClient.invalidateQueries({ queryKey: couponKeys.all });
      } else if (event.entity === 'orders' || event.entity === 'order') {
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        queryClient.invalidateQueries({ queryKey: ['customerOrder'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] }); // for admin
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      } else if (event.entity === 'catalog') {
        // Fallback for global catalog bulk invalidations
        queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        queryClient.invalidateQueries({ queryKey: subCategoryKeys.all });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
        queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
        queryClient.invalidateQueries({ queryKey: featureHighlightKeys.all });
        queryClient.invalidateQueries({ queryKey: couponKeys.all });
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        queryClient.invalidateQueries({ queryKey: ['customerOrder'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      }
    });

    const handleVisibilityChange = () => {
      connectIfVisible();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Only close if this is the absolute last unmount, otherwise it stays persistent.
      catalogSyncService.close();
    };
  }, [queryClient]);
}
