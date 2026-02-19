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

import { useColorModeValue } from "@/components/ui/color-mode";

import SideNavMenuBuilder from "./SideNavMenuBuilder";

import Brand from "../Brand/Brand";
// import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";

export default function PanelSideBar(props: any) {
  const { showSidebar, togglesidebar, SHOW_SIDEBAR, ...rest } = props;


  let shadow = useColorModeValue(
    "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;",
    "unset"
  );

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
      transition="width 0.3s ease-in-out"
      w={showSidebar ? "250px" : "80px"}
      pt={2}
      pb={2}
    >
      <Box
        {...rest}

        transition="all 0.3s ease-in-out"
        p={"5px"}
        h="100%"
        m={sidebarMargins}
        overflowX="hidden"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Flex
          direction="column"
          height="100%"
          borderRadius="20px"
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
        <IconButton aria-label="Menu" cursor="pointer" variant="brand">
          {/* <Icon h="24px" w="24px" asChild> */}
          <AiOutlineMenuUnfold />
          {/* </Icon> */}
        </IconButton>
      </Flex>
      <Drawer.Root
        open={open}
        placement={"start"}
        onOpenChange={(e) => (e.open ? onOpen() : onClose())}
      >
        <Portal>
          <Drawer.Positioner>
            <Drawer.Content maxW="280px" h="100dvh">
              <Flex alignItems={"center"} justifyContent={"space-between"} gap={2} p={4}>
                <Box>
                  <Brand />
                </Box>
                <IconButton
                  aria-label="Close Menu"

                  variant="brand"
                  onClick={onClose}
                >

                  <AiOutlineMenuFold />

                </IconButton>
              </Flex>
              <Separator />
              <Drawer.Body
                px="0"
                pb="0"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <Flex direction="column" pt="10px" px="16px">
                  <VStack gap={2} align="stretch">
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
