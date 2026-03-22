import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import PanelNavBarAction from "./NavbarActions";
import { SidebarResponsive } from "../sidebar/PanelSideBar";
import Brand from "../Brand/Brand";
import TopNavMenuBuilder from "./TopNavMenuBuilder";
import { memo, useMemo, useCallback } from "react";
import { AiOutlineMenuUnfold, AiOutlineMenuFold } from "react-icons/ai";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import useScrollShadow from "@/utils/hooks/useScrollShadow";

// Centralized hover border — same token used across nav / sidebar / menu items
const HOVER_BORDER_COLOR = "app.btn.border";

const TRANSITION = "all 0.2s ease";

/**
 * Navbar
 * Modern sticky header with glassmorphism, scroll-shadow, and integrated actions.
 * Consumes SidebarContext — no prop drilling required.
 */
const Navbar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );
  console.log("Navbar", DISPLAY_TYPE, FEATURE);

  // Scroll-aware shadow for depth perception
  const scrollShadow = useScrollShadow();

  // Theme-aware colors
  // Match project bg.default (gray.50 / dark slate) with slight transparency for blur
  const navBg = useColorModeValue(
    "#ffff",
    "rgba(15, 23, 42, 0.88)"
  );
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const iconHoverBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  // Stable hover object — not re-created every render
  const iconBtnHover = useMemo(
    () => ({ bg: iconHoverBg, border: "1px solid", borderColor: HOVER_BORDER_COLOR }),
    [iconHoverBg]
  );

  // Memoize the sidebar toggle icon to prevent re-creation
  const ToggleIcon = useMemo(
    () => (isCollapsed ? AiOutlineMenuUnfold : AiOutlineMenuFold),
    [isCollapsed]
  );

  return (
    <Box minH="5.5rem">
      <Box
        as="header"
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
          h="5.5rem"
          px={4}
          align="center"
          justify="space-between"
        >
          {/* Left: Toggle + Brand */}
          <Flex alignItems="center" gap={3}>
            <Box>
              {DISPLAY_TYPE.SHOW_SIDE_NAV_MENU && (
                <IconButton
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  display={{ base: "none", xl: "flex" }}
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="md"
                  borderRadius="xl"
                  _hover={iconBtnHover}
                  transition={TRANSITION}
                >
                  <ToggleIcon size={20} />
                </IconButton>
              )}
              {FEATURE.length > 0 && <SidebarResponsive />}
            </Box>
            <Brand />
          </Flex>

          {/* Center: Dynamic Top Navigation (desktop only) */}
          <Box display={{ base: "none", lg: "block" }}>
            <TopNavMenuBuilder
              FEATURE_LIST={FEATURE}
              SHOW_TOP_NAV_MENU={DISPLAY_TYPE.SHOW_TOP_NAV_MENU ?? false}
            />
          </Box>

          {/* Right: Actions (search, notifications, profile) */}
          <PanelNavBarAction />
        </Flex>
      </Box>
    </Box>
  );
};

export default memo(Navbar);
