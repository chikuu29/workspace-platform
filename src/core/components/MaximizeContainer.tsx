import { createContext, useContext, useState, useEffect, useCallback, ReactNode, forwardRef, useRef } from "react";
import { Box, BoxProps, IconButton } from "@chakra-ui/react";
import { Minimize2 } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

interface MaximizeContextType {
  isMaximized: boolean;
  toggle: () => void;
}

const MaximizeContext = createContext<MaximizeContextType | undefined>(undefined);

/**
 * useMaximize
 * Hook to retrieve maximization status and toggle function inside MaximizeContainer children.
 */
export const useMaximize = () => {
  const context = useContext(MaximizeContext);
  return context || { isMaximized: false, toggle: () => { } };
};

export interface MaximizeContainerProps extends Omit<BoxProps, "children"> {
  children: ReactNode | ((props: { isMaximized: boolean; toggle: () => void }) => ReactNode);
  isMaximized?: boolean;
  onToggle?: (maximized: boolean) => void;
  showCloseButton?: boolean;
  maxW?: string | number;
}

/**
 * MaximizeContainer
 * A layout wrapper that enables maximizing any wrapped card/element to full-viewport size.
 * Utilizes the HTML5 Fullscreen API (requestFullscreen) on its container element to prevent
 * unmounting/remounting child components, and falls back to a CSS-based fixed layout if blocked.
 */
export const MaximizeContainer = forwardRef<HTMLDivElement, MaximizeContainerProps>(({
  children,
  isMaximized: controlledIsMaximized,
  onToggle,
  showCloseButton = false,
  maxW = "900px",
  bg,
  ...props
}, ref) => {
  const [internalIsMaximized, setInternalIsMaximized] = useState(false);
  const isMaximized = controlledIsMaximized !== undefined ? controlledIsMaximized : internalIsMaximized;

  const localRef = useRef<HTMLDivElement>(null);

  // Combine forwarded ref and local ref
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (localRef as any).current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
  }, [ref]);

  // Request browser-level fullscreen
  const toggle = useCallback(async () => {
    const nextState = !isMaximized;

    try {
      if (nextState) {
        if (localRef.current) {
          if (localRef.current.requestFullscreen) {
            await localRef.current.requestFullscreen();
          } else if ((localRef.current as any).webkitRequestFullscreen) {
            await (localRef.current as any).webkitRequestFullscreen();
          } else if ((localRef.current as any).msRequestFullscreen) {
            await (localRef.current as any).msRequestFullscreen();
          } else {
            // No API support: Fallback to CSS overlay
            if (controlledIsMaximized === undefined) {
              setInternalIsMaximized(true);
            }
            onToggle?.(true);
          }
        }
      } else {
        if (document.fullscreenElement === localRef.current) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        } else {
          // If in CSS fallback overlay mode, exit it
          if (controlledIsMaximized === undefined) {
            setInternalIsMaximized(false);
          }
          onToggle?.(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed, falling back to CSS overlay:", err);
      // Graceful fallback to CSS overlay in case of browser/gesture restrictions
      if (controlledIsMaximized === undefined) {
        setInternalIsMaximized(nextState);
      }
      onToggle?.(nextState);
    }
  }, [isMaximized, controlledIsMaximized, onToggle]);

  // Sync state with HTML5 fullscreen change events (e.g. user presses Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = document.fullscreenElement === localRef.current;
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
  }, [controlledIsMaximized, onToggle]);

  // Handle body overflow lock when maximized in CSS fallback mode
  useEffect(() => {
    const isCSSFallbackActive = isMaximized && document.fullscreenElement !== localRef.current;
    if (isCSSFallbackActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMaximized]);

  // Handle Escape key listener for CSS fallback mode
  useEffect(() => {
    const isCSSFallbackActive = isMaximized && document.fullscreenElement !== localRef.current;
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
  }, [isMaximized, toggle]);

  // Dispatch window resize event to let nested responsive nodes (charts, scanners) recalculate layout
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    return () => clearTimeout(timer);
  }, [isMaximized]);

  const fallbackBg = useColorModeValue("rgba(244, 246, 250, 1)", "rgba(10, 15, 30, 1)");
  // Make sure bg is solid and opaque when fullscreen so the background black/empty screen isn't visible.
  const computedBg = isMaximized ? fallbackBg : "transparent";

  const content = typeof children === "function" ? children({ isMaximized, toggle }) : children;

  const isFullscreen = isMaximized && document.fullscreenElement === localRef.current;

  const isDark = useColorModeValue(false, true);
  const fullscreenBgColor = isDark ? "#0b1437" : "#f5f5f5";

  return (
    <MaximizeContext.Provider value={{ isMaximized, toggle }}>
      <style>{`
        .maximize-container-el:fullscreen {
          background-color: ${fullscreenBgColor} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          overflow-y: auto !important;
          width: 100vw !important;
          height: 100vh !important;
          box-sizing: border-box !important;
        }
        .maximize-container-el:-webkit-full-screen {
          background-color: ${fullscreenBgColor} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          overflow-y: auto !important;
          width: 100vw !important;
          height: 100vh !important;
          box-sizing: border-box !important;
        }
        .maximize-container-el:-moz-full-screen {
          background-color: ${fullscreenBgColor} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          overflow-y: auto !important;
          width: 100vw !important;
          height: 100vh !important;
          box-sizing: border-box !important;
        }
        .maximize-container-el:-ms-fullscreen {
          background-color: ${fullscreenBgColor} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          overflow-y: auto !important;
          width: 100vw !important;
          height: 100vh !important;
          box-sizing: border-box !important;
        }
      `}</style>
      <Box
        ref={setRefs}
        className="maximize-container-el"
        // Styles for CSS fallback overlay mode (used when requestFullscreen is blocked/unsupported)
        position={isMaximized && !isFullscreen ? "fixed" : "relative"}
        inset={isMaximized && !isFullscreen ? 0 : undefined}
        w={isMaximized && !isFullscreen ? "100vw" : "full"}
        h={isMaximized && !isFullscreen ? "100vh" : "full"}
        zIndex={isMaximized ? 1400 : "auto"}
        bg={computedBg}
        backdropFilter={isMaximized && !isFullscreen ? "blur(20px)" : undefined}
        overflowY={isMaximized ? "auto" : "visible"}
        p={isMaximized && !isFullscreen ? { base: 4, md: 8 } : 0}
        display={isMaximized && !isFullscreen ? "flex" : "block"}
        alignItems={isMaximized ? "center" : "stretch"}
        justifyContent={isMaximized ? "center" : "stretch"}
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        {...props}
      >
        {isMaximized && showCloseButton && (
          <IconButton
            position="absolute"
            top={4}
            right={4}
            onClick={toggle}
            variant="outline"
            size="sm"
            borderRadius="xl"
            aria-label="Exit fullscreen"
            zIndex={1410}
          >
            <Minimize2 size={16} />
          </IconButton>
        )}
        <Box
          w="full"
          maxW={isMaximized ? maxW : "none"}
          h={isMaximized ? "auto" : "full"}
          mx={isMaximized ? "auto" : undefined}
          my={isMaximized ? "auto" : undefined}
        >
          {content}
        </Box>
      </Box>
    </MaximizeContext.Provider>
  );
});

MaximizeContainer.displayName = "MaximizeContainer";
