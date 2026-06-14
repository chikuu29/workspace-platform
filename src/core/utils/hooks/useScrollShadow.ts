import { useState, useEffect, useCallback, useRef, type RefObject } from "react";

/**
 * useScrollShadow
 * Returns a dynamic `boxShadow` string that intensifies as the user scrolls down.
 * Uses `requestAnimationFrame` for paint-efficient tracking with minimal re-renders.
 *
 * Supports two modes:
 *  1. **Window mode** (default) — listens to `window` scroll events.
 *  2. **Container mode** — when a `scrollRef` is provided, listens to that
 *     element's scroll events instead. This is essential when the layout uses
 *     `overflow: hidden` on a parent and delegates scrolling to a child
 *     container (e.g., the workspace main content area).
 */
export const useScrollShadow = (
    /** Maximum shadow intensity pixels (default: 20) */
    maxShadow = 20,
    /** Scroll distance in px at which shadow reaches full intensity */
    scrollThreshold = 80,
    /** Optional ref to the scrollable container. Falls back to window. */
    scrollRef?: RefObject<HTMLElement | null>
): string => {
    const [shadow, setShadow] = useState("none");
    const rafRef = useRef<number | null>(null);

    const handleScroll = useCallback(() => {
        if (rafRef.current) return; // Skip if a frame is already queued

        rafRef.current = requestAnimationFrame(() => {
            const scrollY = scrollRef?.current
                ? scrollRef.current.scrollTop
                : window.scrollY;

            if (scrollY <= 0) {
                setShadow("none");
            } else {
                // Clamp progress between 0 and 1
                const progress = Math.min(scrollY / scrollThreshold, 1);
                const blur = Math.round(progress * maxShadow);
                const opacity = (progress * 0.15).toFixed(3);
                setShadow(`0 4px ${blur}px rgba(0, 0, 0, ${opacity})`);
            }
            rafRef.current = null;
        });
    }, [maxShadow, scrollThreshold, scrollRef]);

    useEffect(() => {
        const target = scrollRef?.current ?? window;

        target.addEventListener("scroll", handleScroll, { passive: true });
        // Run once on mount to capture initial scroll position
        handleScroll();

        return () => {
            target.removeEventListener("scroll", handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [handleScroll, scrollRef]);

    return shadow;
};

export default useScrollShadow;
