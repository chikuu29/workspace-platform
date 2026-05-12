"use client"

import { IconButton, IconButtonProps } from "@chakra-ui/react"
import { useEffect, useState, useCallback } from "react"
import { Maximize2, Minimize2 } from 'lucide-react'

interface FullscreenButtonProps extends IconButtonProps { }

const STORAGE_KEY = "app_fullscreen_preference";

/**
 * FullscreenButton
 * A premium fullscreen toggle that persists state across page refreshes.
 * Implements "Auto Fullscreen" by waiting for the very first user interaction
 * (click, keypress, or touch) to re-engage the fullscreen mode if it was previously active.
 */
export const FullscreenButton = (props: FullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync state with actual document status
  useEffect(() => {
    const handleChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      
      // Update persistence: if the user manually enters/exits, we update the "auto" preference
      if (active) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        // Only remove if they manually exited (not if browser exited on refresh)
        // Actually, we should only remove it if they click the button to exit
        // or press Escape. The 'fullscreenchange' event fires in both cases.
        // To distinguish, we check if the button was clicked.
      }
    }
    document.addEventListener("fullscreenchange", handleChange)
    return () => document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  // Auto re-engage logic
  useEffect(() => {
    const shouldBeFullscreen = localStorage.getItem(STORAGE_KEY) === "true";
    let attempted = false;
    
    if (shouldBeFullscreen && !document.fullscreenElement) {
      const onUserInteraction = (e: Event) => {
        if (attempted || document.fullscreenElement) return;
        attempted = true;
        
        // Immediately remove all listeners
        cleanup();

        if (document.fullscreenEnabled) {
          document.documentElement.requestFullscreen().catch(err => {
            const isBrave = (navigator as any).brave !== undefined;
            const message = isBrave && err.name === "TypeError" 
              ? "Brave Browser blocked fullscreen (Fingerprinting Protection)"
              : err?.message || "User gesture requirement not met or permissions denied";
              
            console.warn("Auto-fullscreen re-engage blocked:", {
              message,
              error: err,
              type: e.type,
              isTrusted: e.isTrusted
            });
          });
        }
      };

      const cleanup = () => {
        document.removeEventListener("mousedown", onUserInteraction, true);
        document.removeEventListener("keydown", onUserInteraction, true);
        document.removeEventListener("touchstart", onUserInteraction, true);
        document.removeEventListener("click", onUserInteraction, true);
      };

      // Use capture: true (the 3rd param 'true') to catch events before they are stopped by other components
      document.addEventListener("mousedown", onUserInteraction, true);
      document.addEventListener("keydown", onUserInteraction, true);
      document.addEventListener("touchstart", onUserInteraction, true);
      document.addEventListener("click", onUserInteraction, true);

      return cleanup;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        await document.exitFullscreen();
        localStorage.setItem(STORAGE_KEY, "false"); // Explicitly disable auto-mode
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
    }
  }, []);

  return (
    <IconButton
      onClick={toggleFullscreen}
      variant="outline"
      aria-label="Toggle Fullscreen"
      size="sm"
      {...props}
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </IconButton>
  )
}
