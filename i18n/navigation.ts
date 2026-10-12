import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware drop-ins for next/link and next/navigation. Every internal link in the site goes
 * through these so `/pricing` becomes `/fr/pricing` when the visitor reads French.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
