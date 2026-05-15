import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import PanelNavBarAction from "./NavbarActions";
import { SidebarResponsive } from "../sidebar/PanelSideBar";
import Brand from "../Brand/Brand";
import TopNavMenuBuilder from "./TopNavMenuBuilder";
import { memo, useMemo, useRef, useEffect, useCallback } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import useScrollShadow from "@/utils/hooks/useScrollShadow";

// Centralized hover border — same token used across nav / sidebar / menu items
const HOVER_BORDER_COLOR = "app.btn.border";

const TRANSITION = "all 0.2s ease";

/**
 * CSS custom property key used to communicate the real navbar height to the
 * rest of the layout tree (spacer box, breadcrumb sticky offset, etc.).
 * Any child can read `var(--navbar-height)` without prop-drilling.
 */
const NAVBAR_HEIGHT_VAR = "--navbar-height";

/**
 * Navbar
 * Modern sticky header with glassmorphism, scroll-shadow, and integrated actions.
 * Consumes SidebarContext — no prop drilling required.
 *
 * Responsive strategy:
 *  - The header is `position: fixed` so it always sits on top.
 *  - A ResizeObserver measures the real header height and writes it to the
 *    CSS variable `--navbar-height` on <html>. The spacer <Box> below reads
 *    that variable so the content never overlaps the header regardless of
 *    which breakpoint is active.
 */
const Navbar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const headerRef = useRef<HTMLElement | null>(null);

  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );
  const showTopNavMenu = (DISPLAY_TYPE.SHOW_TOP_NAV_MENU ?? false) && FEATURE.length > 0;

  // Scroll-aware shadow for depth perception
  const scrollShadow = useScrollShadow();

  // Theme-aware colors
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const iconHoverBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const controlShellShadow = useColorModeValue(
    "0 16px 36px -24px rgba(15, 23, 42, 0.3)",
    "0 18px 36px -26px rgba(2, 6, 23, 0.8)"
  );

  // Stable hover object — not re-created every render
  const iconBtnHover = useMemo(
    () => ({
      bg: iconHoverBg,
      border: "1px solid",
      borderColor: HOVER_BORDER_COLOR,
      transform: "translateY(-1px)",
      boxShadow: controlShellShadow,
    }),
    [controlShellShadow, iconHoverBg]
  );

  // Memoize the sidebar toggle icon to prevent re-creation
  const ToggleIcon = useMemo(
    () => (isCollapsed ? PanelLeftOpen : PanelLeftClose),
    [isCollapsed]
  );

  /**
   * Measure real header height and expose it as a CSS variable on <html>.
   * This ensures the spacer box and any `top` sticky values stay in sync
   * automatically across breakpoints without any JS polling.
   */
  const updateHeightVar = useCallback((el: Element) => {
    const height = el.getBoundingClientRect().height;
    document.documentElement.style.setProperty(
      NAVBAR_HEIGHT_VAR,
      `${height}px`
    );
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // Initial measurement
    updateHeightVar(el);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) updateHeightVar(entry.target);
    });

    observer.observe(el);

    // Cleanup on unmount
    return () => {
      observer.disconnect();
      // Reset variable on unmount so no stale value persists
      document.documentElement.style.removeProperty(NAVBAR_HEIGHT_VAR);
    };
  }, [updateHeightVar]);

  return (
    <>
      <Box
        as="header"
        ref={headerRef as React.RefObject<HTMLDivElement>}
        role="banner"
        aria-label="Main navigation"
        w="100%"
        position="fixed"
        top="0"
        left="0"
        zIndex={999}
        bg={"app.card.bg"}
        backdropFilter="blur(16px)"
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow={scrollShadow}
        transition="box-shadow 0.25s ease"
      >
        <Flex
          w="100%"
          py={"0.7rem"}
          px={{ base: "2", sm: "3", md: "4" }}
          align="center"
          justify="space-between"
          gap={{ base: 1.5, md: 3 }}
        >
          {/* Left: Toggle + Brand */}
          <Flex
            alignItems="center"
            gap={{ base: 1, md: 3 }}
            minW={0}
            flex="0 1 auto"
            flexShrink={1}
          >
            {(DISPLAY_TYPE.SHOW_SIDE_NAV_MENU || FEATURE.length > 0) && (
              <Flex alignItems="center" gap={1} flexShrink={0}>
                {/*
                 * Desktop-only collapse/expand toggle (xl+).
                 * Below xl, PanelSideBar is hidden and SidebarResponsive
                 * owns the mobile drawer trigger — we must NOT render a
                 * second button here or it will appear twice on mobile.
                 */}
                {DISPLAY_TYPE.SHOW_SIDE_NAV_MENU && (
                  <IconButton
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Show sidebar" : "Hide sidebar"}
                    display={{ base: "none", xl: "inline-flex" }}
                    cursor="pointer"
                    h="10"
                    minW="10"
                    borderRadius="xl"
                    variant="outline"
                    color="app.text.primary"
                    border="1px solid"
                    borderColor="app.card.border"
                    transition={TRANSITION}
                    _hover={iconBtnHover}
                    onClick={toggleSidebar}
                  >
                    <ToggleIcon size={18} strokeWidth={2.4} />
                  </IconButton>
                )}

                {/* Mobile drawer trigger — visible only below xl */}
                {FEATURE.length > 0 && <SidebarResponsive />}
              </Flex>
            )}
            <Brand />
          </Flex>

          {/* Center: Dynamic Top Navigation (desktop only) */}
          {showTopNavMenu && (
            <Box
              display={{ base: "none", lg: "block" }}
              flex="1"
              minW={0}
              mx={{ lg: 2, xl: 4 }}
              overflow="hidden"
            >
              <TopNavMenuBuilder
                FEATURE_LIST={FEATURE}
                SHOW_TOP_NAV_MENU={showTopNavMenu}
              />
            </Box>
          )}

          {/* Right: Actions (refresh, fullscreen, theme, notifications, profile) */}
          <Box flexShrink={0}>
            <PanelNavBarAction />
          </Box>
        </Flex>
      </Box>

      {/*
       * Spacer: pushes page content below the fixed header.
       * Height is driven by the CSS variable set by the ResizeObserver above
       * so it ALWAYS matches the real rendered header height on every device.
       */}
      <Box
        aria-hidden="true"
        h={`var(${NAVBAR_HEIGHT_VAR}, 4rem)`}
        flexShrink={0}
        w="100%"
      />
    </>
  );
};

export default memo(Navbar);
