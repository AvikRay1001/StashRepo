// frontend/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server"; // <-- FIX 1: Renamed import

export default clerkMiddleware({ // <-- FIX 2: Use the new name
  // Routes that can be accessed while signed out
  publicRoutes: ['/sign-in', '/sign-up'],
  
  // Routes that can always be accessed
  // We MUST make our share-target public so the OS can hit it
  ignoredRoutes: ['/share-target'], 
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};