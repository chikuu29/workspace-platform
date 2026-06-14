import { Flex, VStack, Box } from "@chakra-ui/react";
import Navbar from "@/features/ui/components/navbar/NavBar";
import PanelSideBar from "@/features/ui/components/sidebar/PanelSideBar";
import { memo } from "react";
import { Outlet } from "react-router";
import AppFooter from "@/features/ui/components/footer/AppFooter";
import AppBreadcrumb from "@/features/ui/components/navbar/AppBreadcrumb";
import { SidebarProvider } from "@/contexts/SidebarContext";
import DialogRenderer from "@/core/renderer/DialogRenderer";
import {
  ScrollContainerProvider,
  useScrollContainer,
} from "@/contexts/ScrollContainerContext";

/**
 * WorkspaceContent
 * Inner shell extracted so it can consume ScrollContainerContext.
 * Attaches the shared scroll ref to the scrollable content area so the
 * Navbar scroll-shadow hook can observe the correct element on all devices.
 */
const WorkspaceContent = memo(() => {
  const { scrollRef } = useScrollContainer();

  return (
    <Flex h="100dvh" flexDirection="column">
      <Navbar />
      <Flex flex="1" overflow="hidden">
        <PanelSideBar />
        {/* Main scrollable content area — ref shared via context */}
        <Box
          ref={scrollRef}
          flex="1"
          overflowY="auto"
          position="relative"
          zIndex={0}
          css={{
            /* iOS momentum scrolling */
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Flex flexDirection="column" minH="100%">
            <VStack align="stretch" flex="1" gap={2} mb={3}>
              <AppBreadcrumb />
              <Box px={3}>
                <Outlet />
              </Box>
            </VStack>
            <AppFooter />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
});

WorkspaceContent.displayName = "WorkspaceContent";

/**
 * WorkspaceLayout
 * Root shell for the authenticated workspace. Provides sidebar context and
 * scroll container context to all children, eliminating prop drilling for
 * sidebar collapsed/expanded state and scroll container ref.
 */
const WorkspaceLayout = () => {
  return (
    <SidebarProvider>
      <ScrollContainerProvider>
        <WorkspaceContent />
        {/* Global template dialog — Zustand-driven, no provider needed */}
        <DialogRenderer />
      </ScrollContainerProvider>
    </SidebarProvider>
  );
};

export default memo(WorkspaceLayout);
