"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const MIN_OVERLAY_MS = 400;

const SectionNavigationContext = createContext(null);

export function SectionNavigationProvider({ children }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAtRef = useRef(0);

  const startSectionTransition = useCallback(
    (href) => {
      if (href === pathname) return;
      startedAtRef.current = Date.now();
      setIsNavigating(true);
    },
    [pathname]
  );

  useEffect(() => {
    if (!isNavigating) return undefined;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_OVERLAY_MS - elapsed);

    const timer = window.setTimeout(() => {
      setIsNavigating(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pathname, isNavigating]);

  return (
    <SectionNavigationContext.Provider
      value={{ isNavigating, startSectionTransition }}
    >
      {children}
    </SectionNavigationContext.Provider>
  );
}

export function useSectionNavigation() {
  const context = useContext(SectionNavigationContext);
  if (!context) {
    throw new Error(
      "useSectionNavigation debe usarse dentro de SectionNavigationProvider"
    );
  }
  return context;
}
