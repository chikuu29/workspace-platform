import { Steps, Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";

import { FullscreenButton } from "@/components/ui/fullscreen-button";
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Auth(props: any) {
  console.log("===== THIS IS AUTH VIEW =======");


  return (
    <Flex position="relative" h="max-content">
      <Flex

        w="100%"

        justifyContent="start"
        direction="column"
      >


        <Outlet />



      </Flex>
      <Flex position="fixed" bottom="30px" right="10" gap={3}>
        <ColorModeButton />
        <FullscreenButton />
      </Flex>
      {/* <FixedPlugin /> */}
    </Flex>
  );
}
