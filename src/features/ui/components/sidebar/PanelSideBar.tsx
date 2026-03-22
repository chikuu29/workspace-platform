import {
  Box,
  Flex,
  Drawer,
  IconButton,
  VStack,
  Separator,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import SideNavMenuBuilder from "./SideNavMenuBuilder";
import Brand from "../Brand/Brand";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { useSidebar } from "@/contexts/SidebarContext";
import React, { useCallback } from "react";
import { useLocation } from "react-router";
import { useEffect } from "react";

/**
 * PanelSideBar
 * Desktop sidebar with smooth collapse animation and icon-only mode.
 * Consumes SidebarContext — no props needed.
 */
const PanelSideBar = () => {
  const { isCollapsed } = useSidebar();

  const shadow = useColorModeValue(
    "rgba(60, 64, 67, 0.15) 1px 0px 3px 0px",
    "none"
  );

  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );

  const borderColor = useColorModeValue("gray.100", "whiteAlpha.50");

  // Don't render if no sidebar menu should be shown
  if (!DISPLAY_TYPE?.SHOW_SIDE_NAV_MENU || FEATURE.length === 0) return null;
  const navBg = useColorModeValue(
    "#ffff",
    "rgba(15, 23, 42, 0.88)"
  );
  return (
    <Box
      as="nav"
      role="navigation"
      aria-label="Sidebar navigation"
      display={{ base: "none", xl: "block" }}
      minH="100%"
      boxShadow={shadow}
      transition="width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      w={isCollapsed ? "78px" : "260px"}
      // bg="bg.default"
      bg={"app.card.bg"}
      borderRight="1px solid"
      borderColor={borderColor}
      flexShrink={0}
    >
      <Box
        h="100%"
        p="6px"
        overflowX="hidden"
        overflowY="auto"
      >
        <Flex direction="column" height="100%" borderRadius="20px">
          <SideNavMenuBuilder showFullSideBarMenu={!isCollapsed} />
        </Flex>
      </Box>
    </Box>
  );
};

export default React.memo(PanelSideBar);

/**
 * SidebarResponsive
 * Mobile drawer version of the sidebar. Opens/closes via SidebarContext.
 * Auto-closes on route change for seamless navigation.
 */
export function SidebarResponsive() {
  const { isMobileOpen, openMobile, closeMobile } = useSidebar();
  const location = useLocation();

  // Auto-close drawer on route change
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  const handleOpenChange = useCallback(
    (e: { open: boolean }) => {
      if (e.open) {
        openMobile();
      } else {
        closeMobile();
      }
    },
    [openMobile, closeMobile]
  );

  return (
    <Flex
      display={{ base: "flex", md: "flex", xl: "none" }}
      alignItems="center"
      justifyContent="center"
    >
      <IconButton
        aria-label="Open menu"
        cursor="pointer"
        variant="ghost"
        size="sm"
        borderRadius="xl"
        onClick={openMobile}
      >
        <AiOutlineMenuUnfold size={20} />
      </IconButton>

      <Drawer.Root
        open={isMobileOpen}
        placement="start"
        onOpenChange={handleOpenChange}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW="280px" h="100dvh" bg="bg.default">
              <Flex
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                p={4}
              >
                <Brand />
                <IconButton
                  aria-label="Close Menu"
                  variant="ghost"
                  size="sm"
                  borderRadius="xl"
                  onClick={closeMobile}
                >
                  <AiOutlineMenuFold size={20} />
                </IconButton>
              </Flex>
              <Separator />
              <Drawer.Body
                px="0"
                pb="0"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                <Flex direction="column" pt="10px" px="16px">
                  <VStack gap={2} align="stretch">
                    <SideNavMenuBuilder showFullSideBarMenu />
                  </VStack>
                </Flex>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  );
}
