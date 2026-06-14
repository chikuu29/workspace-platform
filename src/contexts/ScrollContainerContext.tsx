import { createContext, useContext, useRef, type RefObject, type ReactNode } from "react";

/**
 * ScrollContainerContext
 *
 * Shares a ref to the main scrollable content area so that components like
 * the Navbar scroll-shadow hook can track scroll position from the correct
 * element instead of relying on `window.scrollY` (which is always 0 when
 * the layout delegates scrolling to an inner container).
 */

interface ScrollContainerContextValue {
  /** Ref to the scrollable content Box in the workspace layout */
  scrollRef: RefObject<HTMLDivElement | null>;
}

const ScrollContainerContext = createContext<ScrollContainerContextValue | null>(null);

/** Provider that creates and holds the scroll container ref */
export function ScrollContainerProvider({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <ScrollContainerContext.Provider value={{ scrollRef }}>
      {children}
    </ScrollContainerContext.Provider>
  );
}

/** Hook to consume the scroll container ref */
export function useScrollContainer(): ScrollContainerContextValue {
  const ctx = useContext(ScrollContainerContext);
  if (!ctx) {
    throw new Error(
      "useScrollContainer must be used within a <ScrollContainerProvider>"
    );
  }
  return ctx;
}
