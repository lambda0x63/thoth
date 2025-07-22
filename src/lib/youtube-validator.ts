export interface YouTubeValidationResult {
  valid: boolean;
  videoId?: string;
  error?: string;
}

export function validateYouTubeUrl(url: string): YouTubeValidationResult {
  try {
    // Remove whitespace
    const cleanUrl = url.trim();
    
    if (!cleanUrl) {
      return { valid: false, error: 'URL is required' };
    }

    // YouTube URL patterns
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(&.*)?$/,
      /^(https?:\/\/)?(www\.)?(youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(\?.*)?$/,
      /^(https?:\/\/)?(www\.)?(youtu\.be\/)([a-zA-Z0-9_-]{11})(\?.*)?$/,
      /^(https?:\/\/)?(m\.)?(youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(&.*)?$/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const videoId = match[4];
        return { valid: true, videoId };
      }
    }

    // Check if it's just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return { valid: true, videoId: cleanUrl };
    }

    return { valid: false, error: 'Invalid YouTube URL format' };
  } catch (error) {
    return { valid: false, error: 'Error validating URL' };
  }
}

export function extractVideoId(url: string): string | null {
  const result = validateYouTubeUrl(url);
  return result.valid ? result.videoId || null : null;
}