import { kv } from '@vercel/kv';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class KVRateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowHours: number = 24) {
    this.maxRequests = maxRequests;
    this.windowMs = windowHours * 60 * 60 * 1000;
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    
    try {
      const entry = await kv.get<RateLimitEntry>(key);

      if (!entry || now > entry.resetTime) {
        // New window
        const resetTime = now + this.windowMs;
        const newEntry: RateLimitEntry = { count: 1, resetTime };
        
        // Set with TTL (expires when window resets)
        await kv.set(key, newEntry, { pxat: resetTime });
        
        return { allowed: true, remaining: this.maxRequests - 1, resetTime };
      }

      if (entry.count >= this.maxRequests) {
        return { allowed: false, remaining: 0, resetTime: entry.resetTime };
      }

      // Increment count
      const updatedEntry: RateLimitEntry = { 
        count: entry.count + 1, 
        resetTime: entry.resetTime 
      };
      
      // Update with same TTL
      await kv.set(key, updatedEntry, { pxat: entry.resetTime });
      
      return { 
        allowed: true, 
        remaining: this.maxRequests - updatedEntry.count, 
        resetTime: entry.resetTime 
      };
    } catch (error) {
      console.error('KV rate limiter error:', error);
      // Fallback: allow request if KV fails
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }
  }
}

// Fallback in-memory rate limiter for development
class MemoryRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(maxRequests: number = 10, windowHours: number = 24) {
    this.maxRequests = maxRequests;
    this.windowMs = windowHours * 60 * 60 * 1000;
    
    // Clean up old entries every hour
    this.cleanupTimer = setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
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

// Create appropriate rate limiter based on environment
const rateLimiter = process.env.NODE_ENV === 'production' && process.env.KV_URL
  ? new KVRateLimiter(10, 24)
  : new MemoryRateLimiter(10, 24);

export async function checkRateLimit(req: Request): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  identifier: string;
}> {
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