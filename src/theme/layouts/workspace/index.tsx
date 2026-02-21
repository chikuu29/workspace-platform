import { Flex, VStack, Box } from "@chakra-ui/react";
import Navbar from "@/features/ui/components/navbar/NavBar";
import PanelSideBar from "@/features/ui/components/sidebar/PanelSideBar";
import { memo } from "react";
import { Outlet } from "react-router";
import AppFooter from "@/features/ui/components/footer/AppFooter";
import Appbreadcurmb from "@/features/ui/components/navbar/Appbreadcurmb";
import { SidebarProvider } from "@/contexts/SidebarContext";
import DialogRenderer from "@/core/renderer/DialogRenderer";

/**
 * WorkspaceLayout
 * Root shell for the authenticated workspace. Provides sidebar context to all
 * children, eliminating prop drilling for sidebar collapsed/expanded state.
 */
const WorkspaceLayout = () => {
  return (
    <SidebarProvider>
      <Flex h="100vh" flexDirection="column">
        <Navbar />
        <Flex flex="1" overflow="hidden">
          <PanelSideBar />
          {/* Main Content */}
          <Box flex="1" overflowY="auto" position="relative" zIndex={0} p={2}>
            <Flex flexDirection="column" minH="100%">
              <VStack align="stretch" flex="1" gap={4}>
                <Appbreadcurmb />
                <Outlet />
              </VStack>
              <AppFooter />
            </Flex>
          </Box>
        </Flex>
      </Flex>
      {/* Global template dialog — Zustand-driven, no provider needed */}
      <DialogRenderer />
    </SidebarProvider>
  );
};

export default memo(WorkspaceLayout);
