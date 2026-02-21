import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useScrollShadow
 * Returns a dynamic `boxShadow` string that intensifies as the user scrolls down.
 * Uses `requestAnimationFrame` for paint-efficient tracking with minimal re-renders.
 */
export const useScrollShadow = (
    /** Maximum shadow intensity pixels (default: 20) */
    maxShadow = 20,
    /** Scroll distance in px at which shadow reaches full intensity */
    scrollThreshold = 80
): string => {
    const [shadow, setShadow] = useState("none");
    const rafRef = useRef<number | null>(null);

    const handleScroll = useCallback(() => {
        if (rafRef.current) return; // Skip if a frame is already queued

        rafRef.current = requestAnimationFrame(() => {
            const scrollY = window.scrollY;
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
    }, [maxShadow, scrollThreshold]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        // Run once on mount to capture initial scroll position
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [handleScroll]);

    return shadow;
};

export default useScrollShadow;
