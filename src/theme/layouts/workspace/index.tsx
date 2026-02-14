import { Steps, Container, Flex, VStack, Box } from "@chakra-ui/react";
import Navbar from "@/features/ui/components/navbar/NavBar";
import PanelSideBar from "@/features/ui/components/sidebar/PanelSideBar";
import { memo, useState } from "react";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { RootState } from "@/app/store";
import AppFooter from "@/features/ui/components/footer/AppFooter";
import { ColorModeButton } from "@/components/ui/color-mode";
import { FullscreenButton } from "@/components/ui/fullscreen-button";

const workspace = () => {
  console.log("%c====EXECUTE DASHBOARD LAYOUT=====", "color:white");
  const [showSidebar, setShowSidebar] = useState(true);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );
  console.log("features", FEATURE);

  return (
    <Flex h="100vh" flexDirection="column">
      <Navbar
        togglesidebar={toggleSidebar}
        FEATURE={FEATURE}
        DISPLAY_TYPE={DISPLAY_TYPE}
      />
      <Flex flex="1" overflow="hidden">
        <PanelSideBar showSidebar={showSidebar} togglesidebar={toggleSidebar} h="100%" />
        {/* Main Content */}
        <Box flex="1" overflowY="auto" position="relative" zIndex={0}>
          <VStack align="stretch" minH="calc(100vh - 150px)">
            <Box p={"1.7rem"}>
              <Outlet />
            </Box>
            <AppFooter />
          </VStack>

        </Box>
      </Flex>
    </Flex>
  );
}

export default memo(workspace);
