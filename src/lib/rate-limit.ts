// Simple in-memory rate limiting for production
// In a real production app, you'd want Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowHours: number = 24) {
    this.maxRequests = maxRequests;
    this.windowMs = windowHours * 60 * 60 * 1000;
    
    // Clean up old entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.limits.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter(10, 24); // 10 requests per 24 hours

export async function checkRateLimit(req: Request): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  identifier: string;
}> {
  // In production (Vercel), use IP address as identifier
  // In development, always allow
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: 999, resetTime: 0, identifier: 'dev' };
  }

  // Get IP from Vercel headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  const result = await rateLimiter.checkLimit(ip);
  return { ...result, identifier: ip };
}