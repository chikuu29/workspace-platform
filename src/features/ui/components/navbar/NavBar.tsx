import { Box, Flex, Icon, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

import PanelNavBarAction from "./NavbarActions";
import { MdMenu } from "react-icons/md";
import { SidebarResponsive } from "../sidebar/PanelSideBar";
import Brand from "../Brand/Brand";
import TopNavMenuBuilder from "./TopNavMenuBuilder";
import { memo } from "react";
import Appbreadcurmb from "./Appbreadcurmb";
import { AiOutlineMenuUnfold } from "react-icons/ai";
interface AppNavType {
  DISPLAY_TYPE: any;
  FEATURE: any[];
  requiredSideBar: boolean;
  togglesidebar: () => void;
}

const Navbar = ({
  DISPLAY_TYPE,
  FEATURE,
  requiredSideBar = true,
  togglesidebar,
  ...rest
}: AppNavType & any) => {

  const bgColor = useColorModeValue("white", 'gray.950');
  return (
    <Box minH="5.5rem" bg={bgColor}>
      <Box
        w="100%"
        boxShadow="md"
        position="fixed"

        zIndex={999}

        top="0"
        left="0"
        bg={bgColor}>
        <Flex
          w="100%"

          p={2}
          align={"center"}
          justify={"space-between"}

          {...rest}
        >

          <Flex alignItems="center" gap={4}>
            {/* Sidebar Toggle & Mobile Menu */}
            <Box>
              {DISPLAY_TYPE.SHOW_SIDE_NAV_MENU && (
                <IconButton
                  aria-label="Menu"
                  display={{ base: "none", xl: "flex" }}
                  onClick={togglesidebar}
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                  borderRadius="full"
                >
                  <Icon as={AiOutlineMenuUnfold} boxSize={6} />
                </IconButton>
              )}
              {FEATURE.length > 0 && <SidebarResponsive FEATURE_LIST={FEATURE} />}
            </Box>

            <Brand />
          </Flex>

          {/* Dynamic Top Navigation (if enabled) */}
          <Box display={{ base: "none", lg: "block" }}>
            <TopNavMenuBuilder
              FEATURE_LIST={FEATURE}
              SHOW_TOP_NAV_MENU={DISPLAY_TYPE.SHOW_TOP_NAV_MENU}
            />
          </Box>

          {/* Right Side Actions */}
          <PanelNavBarAction />
        </Flex>


      </Box>
    </Box>
  );
};

export default memo(Navbar);
