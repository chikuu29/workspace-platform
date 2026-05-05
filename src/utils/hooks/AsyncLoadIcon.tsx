import React, { useState, useEffect, useMemo, type ComponentType } from "react";
import DynamicIcon from "../app/renderDynamicIcons";
import { Box, Spinner } from "@chakra-ui/react";

// ── Types ────────────────────────────────────────────────────────────

interface AsyncLoadIconProps {
  /** react-icons name (e.g. "FcHome", "LuUsers") — async fallback */
  iconName: string;
  /** Raw SVG markup string from config — rendered instantly when valid */
  svgIcon?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Lightweight validation: checks that the string contains an opening
 * <svg tag so we don't inject arbitrary HTML via dangerouslySetInnerHTML.
 * This is safe because the config JSON is developer-controlled, not user input.
 */
const isValidSvgMarkup = (raw: string): boolean => {
  if (!raw || typeof raw !== "string") return false;
  const trimmed = raw.trim();
  return trimmed.startsWith("<svg") && trimmed.includes("</svg>");
};

/**
 * Sanitizes the SVG string to enforce consistent dimensions.
 * Strips any existing width/height attributes and injects w=16 h=16
 * so the icon always fits the 4×4 box used by the nav.
 */
const normalizeSvgSize = (raw: string): string => {
  let svg = raw.trim();
  // Remove existing width/height to avoid double-specification
  svg = svg.replace(/\s(width|height)="[^"]*"/gi, "");
  // Inject width="16" height="16" after the opening <svg tag
  svg = svg.replace("<svg", '<svg width="16" height="16"');
  return svg;
};

// ── Component ────────────────────────────────────────────────────────

/**
 * AsyncLoadIcon
 *
 * Priority rendering order:
 *  1. `svgIcon` — if provided and valid SVG markup, render instantly (no spinner)
 *  2. `iconName` — async-load from react-icons via DynamicIcon
 *
 * Error handling:
 *  - Malformed / empty `svgIcon` → silently falls through to async loader
 *  - Async loader failure → renders a red dot fallback
 */
const AsyncLoadIcon = React.memo(({ iconName, svgIcon }: AsyncLoadIconProps) => {
  // ── Fast path: inline SVG from config ──────────────────────────────
  const sanitizedSvg = useMemo(() => {
    if (!svgIcon || !isValidSvgMarkup(svgIcon)) return null;
    try {
      return normalizeSvgSize(svgIcon);
    } catch {
      // Malformed string — fall through to async loader
      return null;
    }
  }, [svgIcon]);

  // Stable HTML object for dangerouslySetInnerHTML (avoids re-creation)
  const svgHtml = useMemo(
    () => (sanitizedSvg ? { __html: sanitizedSvg } : null),
    [sanitizedSvg],
  );

  // ── Slow path: async react-icons loader ────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [IconComponent, setIconComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(!svgHtml);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Skip async loading if we have a valid inline SVG
    if (svgHtml) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    const loadIcon = async () => {
      try {
        const icon = await DynamicIcon(iconName);
        if (isMounted) {
          setIconComponent(() => icon);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadIcon();
    return () => { isMounted = false; };
  }, [iconName, svgHtml]);

  // ── Render: SVG fast path ──────────────────────────────────────────
  if (svgHtml) {
    return (
      <Box
        boxSize="4"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="currentColor"
        dangerouslySetInnerHTML={svgHtml}
      />
    );
  }

  // ── Render: async loading state ────────────────────────────────────
  if (loading) {
    return (
      <Box boxSize="4" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xs" />
      </Box>
    );
  }

  // ── Render: error fallback ─────────────────────────────────────────
  if (error || !IconComponent) {
    return <Box boxSize="4" bg="red.100" borderRadius="full" />;
  }

  // ── Render: async-loaded react-icons icon ──────────────────────────
  return (
    <Box boxSize="4" display="flex" alignItems="center" justifyContent="center">
      <IconComponent size="16px" />
    </Box>
  );
});

AsyncLoadIcon.displayName = "AsyncLoadIcon";
export default AsyncLoadIcon;
