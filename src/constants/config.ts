// Cache configuration
export const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Streaming configuration
export const STREAM_DEBOUNCE_MS = 100;

// Content limits
export const MAX_TRANSCRIPT_LENGTH = 8000;
export const MAX_VIDEO_DURATION_SECONDS = 3600; // 1 hour

// Rate limiting
export const RATE_LIMIT_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_HOURS = 24;

// Cleanup intervals
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour