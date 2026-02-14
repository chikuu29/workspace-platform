import { Steps, Container, Flex, VStack } from "@chakra-ui/react";
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
      {/* Main Content */}
      {/* <Flex flex="1" > */}
      <PanelSideBar showSidebar={showSidebar} togglesidebar={toggleSidebar} />
      {/* Main Content */}
      <VStack flex="1" align="stretch" m={"1.4rem"}>
        {/* <Container maxW="100%"> */}
        <Outlet></Outlet>
        {/* </Container> */}
        {/* <AppFooter /> */}
        <Flex position="fixed" flexDirection="column" bottom="30px" right="10" gap={3}>
          <ColorModeButton />
          <FullscreenButton />
        </Flex>
      </VStack>
      {/* </Flex> */}
    </Flex>
  );
}

export default memo(workspace);
