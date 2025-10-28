// frontend/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/sign-in', '/sign-up'],

  // Routes that can always be accessed (e.g., API routes)
  // We MUST make our share-target public so the OS can hit it
  ignoredRoutes: ['/share-target'], 
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};