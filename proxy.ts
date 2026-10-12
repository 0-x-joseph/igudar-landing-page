import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Locale detection and prefixing (`/` → `/fr` for a French browser on first visit). API routes and assets are left alone. */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|images|.*\\..*).*)"],
};
