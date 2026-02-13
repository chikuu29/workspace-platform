import {
  Steps,
  Box,
  Flex,
  Drawer,
  Icon,
  useDisclosure,
  IconButton,
  VStack,
  Separator,
  Portal,
} from "@chakra-ui/react";

import { useColorModeValue } from "../../../components/ui/color-mode";

import SideNavMenuBuilder from "./SideNavMenuBuilder";
import { MdMenu } from "react-icons/md";
import Brand from "../Brand/Brand";
// import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { APP_CONFIG_STATE } from "../../../types/appConfigInterface";

export default function PanelSideBar(props: any) {
  const { showSidebar, togglesidebar, SHOW_SIDEBAR, ...rest } = props;

  console.log("showSidebar", showSidebar);

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue(
    "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;",
    "unset"
  );
  let sidebarBg = useColorModeValue("white", "gray.950");

  let sidebarMargins = "0px";
  const { DISPLAY_TYPE, FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );

  if (!DISPLAY_TYPE?.SHOW_SIDE_NAV_MENU || FEATURE.length == 0) return null;
  return (
    <Box
      display={{ base: "none", sm: "none", xl: "block" }}
      minH="100%"
      p={"0px"}
      boxShadow={shadow}
    >
      <Box
        {...rest}
        bg={sidebarBg}
        transition={variantChange}
        p={"0px"}
  
        h="100vh"
        m={sidebarMargins}
        minH="100%"
        overflowX="hidden"
      >
        <Flex
          direction="column"
          height="100%"
          pt="25px"
          px="16px"
          borderRadius="30px"
        >
          <SideNavMenuBuilder showFullSideBarMenu={showSidebar} />
        </Flex>
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props: any) {
  const { DISPLAY_TYPE, FEATURE, ...rest } = props;
  let sidebarBg = useColorModeValue("white", "gray.950");
  let subbg = useColorModeValue("secondaryGray.100", "gray.800");
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <Flex
      display={{ base: "flex", md: "flex", xl: "none" }}
      alignItems="center"
      justifyContent={"center"}
      
    >
      <Flex w="max-content" h="max-content" onClick={onOpen}>
        <IconButton aria-label="Menu" cursor="pointer" variant='outline'><Icon h="20px" w="20px" asChild><MdMenu /></Icon></IconButton>
      </Flex>
      <Drawer.Root open={isOpen} placement={"left"} onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <Drawer.Positioner>
            <Drawer.Content maxW="200px" bg={subbg}>
              <Flex alignItems={"center"} justifyContent={"start"} gap={2} p={3} >
                <Box paddingStart={3}>
                  <IconButton
                    // mb={2}
                    aria-label="Menu"
                    // variant="ghost"
                    cursor="pointer"
                    onClick={onClose}><Icon h="20px" w="20px" asChild><MdMenu /></Icon></IconButton>
                </Box>
                <Box>
                  <Brand />
                </Box>
              </Flex>
              <Separator />
              <Drawer.Body maxW="200px" px="0rem" pb="0">
                <Flex
                  direction="column"
                  pt="25px"
                  px="16px"
                  borderRadius="30px"
                  // p={{ pt: "0", px: "16px" }}
                  bg={sidebarBg}
                >
                  <VStack gap={4} align="stretch" >
                    <SideNavMenuBuilder showFullSideBarMenu={true} />
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
