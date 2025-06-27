import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth, clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// Export auth function for API routes
export { getAuth } from "@clerk/nextjs/server";
