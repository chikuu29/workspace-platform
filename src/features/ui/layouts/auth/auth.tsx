import { Steps, Box, Flex } from "@chakra-ui/react";
import {Outlet } from "react-router-dom";

import FixedPlugin from "../../components/fixedPlugin/FixedPlugin";

export default function Auth(props: any) {
  console.log("===== THIS IS AUTH VIEW =======");
  // console.log(props);
  const {  illustrationBackground } = props;
  return (
    <Flex position="relative" h="max-content">
      <Flex
        h={{
          sm: "initial",
          md: "unset",
          lg: "100vh",
          xl: "97vh",
        }}
        w="100%"
        maxW={{ md: "66%", lg: "1313px" }}
        mx="auto"
        pt={{ sm: "50px", md: "0px" }}
        px={{ lg: "30px", xl: "0px" }}
        ps={{ xl: "70px" }}
        justifyContent="start"
        direction="column"
      >
       

        <Outlet />

        <Box
          display={{ base: "none", md: "none" }}
          h="100%"
          minH="100vh"
          w={{ lg: "50vw", "2xl": "44vw" }}
          position="absolute"
          right="0px"
        >
          <Flex
            bg={`url(${illustrationBackground})`}
            justify="center"
            align="end"
            w="100%"
            h="100%"
            bgSize="cover"
            bgPosition="50%"
            position="absolute"
            borderBottomLeftRadius={{ lg: "120px", xl: "200px" }}
          ></Flex>
        </Box>
        {/* <Footer /> */}
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}
