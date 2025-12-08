"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "../actions";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid tracking admin pages to keep data clean
    if (!pathname.startsWith("/admin")) {
        trackVisit(pathname);
    }
  }, [pathname]);

  return null; // Invisible component
}