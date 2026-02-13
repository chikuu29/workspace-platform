import { Steps, Container, Flex, VStack } from "@chakra-ui/react";
import Navbar from "../../components/navbar/AppNavBar";
import PanelSideBar from "../../components/sidebar/PanelSideBar";
import { memo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { APP_CONFIG_STATE } from "../../../types/appConfigInterface";
import { RootState } from "../../../app/store";
import AppFooter from "../../components/footer/AppFooter";

const dash=()=> {
  console.log("%c====EXECUTE DASHBOARD LAYOUT=====", "color:white");
  const [showSidebar, setShowSidebar] = useState(true);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );
console.log("features",FEATURE);

  return (
    <Flex h="100vh" flexDirection="column">
      <Navbar
        togglesidebar={toggleSidebar}
        FEATURE={FEATURE}
        DISPLAY_TYPE={DISPLAY_TYPE}
      />
      {/* Main Content */}
      <Flex flex="1" >
        <PanelSideBar showSidebar={showSidebar} togglesidebar={toggleSidebar} />
        {/* Main Content */}
        <VStack flex="1" gap={4} align="stretch">
          <Container maxW="100%">
            <Outlet></Outlet>
          </Container>
          <AppFooter />
        </VStack>
      </Flex>
    </Flex>
  );
}

export default memo(dash);
