import { useState, useEffect, useCallback, RefObject } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";

export interface UseMaximizeOptions {
  controlledIsMaximized?: boolean;
  onToggle?: (maximized: boolean) => void;
  maxW?: string | number;
  centerContent?: boolean;
}

/**
 * useMaximize
 * A React hook that enables maximizing/fullscreen on any target DOM element.
 * Supports HTML5 Fullscreen API with graceful fallback to CSS fixed overlay mode if blocked/unsupported.
 */
export const useMaximize = (
  targetRef: RefObject<HTMLElement | null>,
  options: UseMaximizeOptions = {}
) => {
  const { controlledIsMaximized, onToggle, maxW = "none", centerContent = true } = options;
  const [internalIsMaximized, setInternalIsMaximized] = useState(false);

  const isMaximized = controlledIsMaximized !== undefined ? controlledIsMaximized : internalIsMaximized;

  // Determine if the element is currently in native fullscreen
  const isFullscreen =
    isMaximized &&
    typeof document !== "undefined" &&
    document.fullscreenElement === targetRef.current;

  // Inject fullscreen style layout rules once on mount.
  // Utilizes distinct styling classes for robust cross-browser vertical alignment.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const styleId = "use-maximize-global-styles";
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.innerHTML = `
      .maximize-container-el:fullscreen,
      .maximize-container-el:-webkit-full-screen,
      .maximize-container-el:-moz-full-screen,
      .maximize-container-el:-ms-fullscreen {
        background-color: var(--fullscreen-bg, #0b1437) !important;
        display: flex !important;
        box-sizing: border-box !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow-y: auto !important;
        padding: 24px !important;
      }
      /* Center alignment rules */
      .maximize-container-el.maximize-center:fullscreen,
      .maximize-container-el.maximize-center:-webkit-full-screen,
      .maximize-container-el.maximize-center:-moz-full-screen,
      .maximize-container-el.maximize-center:-ms-fullscreen {
        align-items: center !important;
        justify-content: center !important;
      }
      /* Top alignment rules (horizontally centered) */
      .maximize-container-el.maximize-top:fullscreen,
      .maximize-container-el.maximize-top:-webkit-full-screen,
      .maximize-container-el.maximize-top:-moz-full-screen,
      .maximize-container-el.maximize-top:-ms-fullscreen {
        align-items: flex-start !important;
        justify-content: center !important;
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  const toggle = useCallback(async () => {
    const element = targetRef.current;
    if (!element) return;

    const nextState = !isMaximized;

    try {
      if (nextState) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        } else {
          // Fallback to CSS overlay
          if (controlledIsMaximized === undefined) {
            setInternalIsMaximized(true);
          }
          onToggle?.(true);
        }
      } else {
        if (document.fullscreenElement === element) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        } else {
          // Exit CSS fallback overlay mode
          if (controlledIsMaximized === undefined) {
            setInternalIsMaximized(false);
          }
          onToggle?.(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed, falling back to CSS overlay:", err);
      if (controlledIsMaximized === undefined) {
        setInternalIsMaximized(nextState);
      }
      onToggle?.(nextState);
    }
  }, [isMaximized, controlledIsMaximized, onToggle, targetRef]);

  // Sync internal state with HTML5 fullscreen change events (e.g. user presses Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = document.fullscreenElement === targetRef.current;
      if (controlledIsMaximized === undefined) {
        setInternalIsMaximized(isNowFullscreen);
      }
      onToggle?.(isNowFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [controlledIsMaximized, onToggle, targetRef]);

  // Handle body overflow lock when maximized in CSS fallback mode
  useEffect(() => {
    const isCSSFallbackActive = isMaximized && document.fullscreenElement !== targetRef.current;
    if (isCSSFallbackActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMaximized, targetRef]);

  // Handle Escape key listener for CSS fallback mode
  useEffect(() => {
    const isCSSFallbackActive = isMaximized && document.fullscreenElement !== targetRef.current;
    if (!isCSSFallbackActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMaximized, targetRef, toggle]);

  // Dispatch window resize event to let nested responsive nodes recalculate layout
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    return () => clearTimeout(timer);
  }, [isMaximized]);

  const fallbackBg = useColorModeValue("rgba(244, 246, 250, 1)", "rgba(10, 15, 30, 1)");
  const computedBg = isMaximized ? fallbackBg : "transparent";

  const isDark = useColorModeValue(false, true);
  const fullscreenBgColor = isDark ? "#0b1437" : "#f5f5f5";

  // Pre-calculated container styling props
  const fullscreenProps = {
    className: `maximize-container-el ${centerContent ? "maximize-center" : "maximize-top"}`,
    style: {
      "--fullscreen-bg": fullscreenBgColor,
    } as any,
    position: (isMaximized && !isFullscreen ? "fixed" : "relative") as "fixed" | "relative",
    inset: isMaximized && !isFullscreen ? 0 : undefined,
    w: isMaximized && !isFullscreen ? "100vw" : "full",
    h: isMaximized && !isFullscreen ? "100vh" : "full",
    zIndex: isMaximized ? 1400 : "auto",
    bg: computedBg,
    backdropFilter: isMaximized && !isFullscreen ? "blur(20px)" : undefined,
    overflowY: (isMaximized ? "auto" : "visible") as "auto" | "visible",
    p: isMaximized ? { base: 4, md: 8 } : 0,
    display: isMaximized ? "flex" : "block",
    alignItems: isMaximized ? (centerContent ? "center" : "flex-start") : "stretch",
    justifyContent: isMaximized ? "center" : "stretch",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  // Pre-calculated inner content styling props
  const contentWrapperProps = {
    w: "full",
    maxW: isMaximized ? maxW : "none",
    h: isMaximized ? "auto" : "full",
    mx: isMaximized ? "auto" : undefined,
    my: isMaximized ? (centerContent ? "auto" : undefined) : undefined,
  };

  return {
    isMaximized,
    isFullscreen,
    toggle,
    fullscreenProps,
    contentWrapperProps,
  };
};
