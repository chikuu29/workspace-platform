import { Steps, Box, Flex, Text, Link, Stack, Button } from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import LoadIcon from "../../../utils/hooks/LoadIcon";
import MenuLink from "../sidebar/components/MenuLink";
import React from "react";

const AppFooter=()=> {
  console.log("===CALLING APP FOOTER===");

  let navbarShadow =
    "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;";
  let navbarBg = useColorModeValue("white", "gray.950");
  const compyany_name=new Date().getFullYear() +" Your Company"
  return (
    <Box
      minH="60px"
      w="100%"
    >
      <Flex
        w="100%"
        position="fixed"
        minH="60px"
        alignItems={'center'}
        bottom="0"
        bg={navbarBg} // Replace with navbarBg
        boxShadow={navbarShadow} // Replace with navbarShadow
        justifyContent={'center'}
      >
        <Flex
          justifyContent="center" // Center items
          alignItems="center"
        >
          {/* Team Menu Link */}
          <Box flex="1" textAlign="start">
            <MenuLink
              menuConfig={{
                key: "Fedback",
                label: "Fedback",
                icon: "FcFaq",
                path: "/fedback",
              }}
              showFullSideBarMenu={true}
            />
          </Box>

          <Box flex="1" textAlign="start">
            <Stack>
              <MenuLink
                menuConfig={{
                  key: "copyright",
                  label:compyany_name,
                  icon: "FcCopyright",
                  path: "",
                }}
                showFullSideBarMenu={true}
              />
            </Stack>
          </Box>

          {/* Privacy Menu Link */}
          <Box flex="1" textAlign="start">
            <Stack>
              <MenuLink
                menuConfig={{
                  key: "privacy",
                  label: "Privacy",
                  icon: "FcPrivacy",
                  path: "/privacy",
                }}
                showFullSideBarMenu={true}
              />
            </Stack>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default React.memo(AppFooter);
