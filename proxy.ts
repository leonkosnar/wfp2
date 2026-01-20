// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting
// In production with multiple instances, use Redis (e.g., Upstash)
const rateLimitMap = new Map();

export function proxy(request: NextRequest) {
  // 1. Only apply to API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    
    // 2. Identify User (IP based for now, or Session Token if available)
    const ip = request.ip || "127.0.0.1";
    const limit = 100; // Limit: 100 requests
    const windowMs = 60 * 1000; // Window: 1 minute

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 0, startTime: Date.now() });
    }

    const data = rateLimitMap.get(ip);

    // 3. Reset window if expired
    if (Date.now() - data.startTime > windowMs) {
      data.count = 0;
      data.startTime = Date.now();
    }

    // 4. Check Limit
    data.count++;
    if (data.count > limit) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: "/api/:path*",
};