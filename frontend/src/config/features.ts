/**
 * Enterprise Runtime Feature Flags
 * 
 * Centralized configuration allowing zero-downtime toggles of major architectural features.
 * Sourced from Vite environment variables.
 */
export const features = {
  // Master toggle for all live synchronization capabilities (SSE + Caching invalidations)
  LIVE_SYNC_ENABLED: import.meta.env.VITE_LIVE_SYNC_ENABLED !== 'false',
  
  // Specific toggle just for the Server-Sent Events transport layer
  SSE_ENABLED: import.meta.env.VITE_SSE_ENABLED !== 'false',
  
  // Master toggle for React Query caching. If false, everything falls back to network-only.
  CACHE_ENABLED: import.meta.env.VITE_CACHE_ENABLED !== 'false',
};
