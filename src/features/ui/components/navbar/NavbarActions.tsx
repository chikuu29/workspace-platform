import { Avatar, Box, Flex, Icon, IconButton, Menu, Portal, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useAuth } from "@/contexts/AuthProvider";
import { useSelector } from "react-redux";
import { FiLogOut, FiSettings, FiUser, FiHelpCircle } from "react-icons/fi";
import React from "react";
import NotificationMenu from "./NotificationMenu";

export default function NavbarActions() {
  const auth = useSelector((state: any) => state.auth);
  const { logoutUser } = useAuth();

  // Color Modes
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.200");
  const iconColor = useColorModeValue("gray.500", "gray.400");

  // Premium Layout Styles
  const menuBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const menuBorder = useColorModeValue("white", "whiteAlpha.200");
  const shadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.2)",
    "0px 18px 40px rgba(0, 0, 0, 0.4)"
  );
  const itemHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const itemHoverColor = "brand.500";

  const user = auth.loginInfo || {};
  const userName = user.userFullName || "Guest User";
  const userImage = user.image;

  return (
    <Flex
      alignItems="center"
      flexDirection="row"
      gap={4}
    >
      <NotificationMenu />

      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            // variant="unstyled"
            aria-label="User Profile"
            w="40px"
            h="40px"
            rounded="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            outline="none"
            transition="transform 0.2s"
            _hover={{ transform: "scale(1.1)", cursor: "pointer" }}
            _active={{ transform: "scale(0.95)" }}
          >
            <Avatar.Root size="sm">
              <Avatar.Fallback name={userName} colorPalette={'yellow'} fontWeight="bold" />
              <Avatar.Image src={userImage} />
            </Avatar.Root>
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              minW="240px"
              bg={menuBg}
              backdropFilter="blur(16px)"
              borderRadius="2xl"
              boxShadow={shadow}
              border="1px solid"
              borderColor={menuBorder}
              p={2}
              zIndex={1500}
              css={{ transformOrigin: "top right" }}
            >
              <Box px={4} py={3.5} mb={1}>
                <Text fontSize="xs" color={subTextColor} fontWeight="700" textTransform="uppercase" letterSpacing="0.5px" mb={1}>
                  Signed in as
                </Text>
                <Text
                  fontWeight="800"
                  fontSize="lg"
                  bgGradient="to-r"
                  gradientFrom="brand.500"
                  gradientTo="blue.600"
                  bgClip="text"
                  lineClamp={1}
                >
                  {userName}
                </Text>
              </Box>

              <VStack gap={1} align="stretch">
                <Menu.Item
                  value="profile"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.1s"
                >
                  <Icon as={FiUser} boxSize={4} color={iconColor} _groupHover={{ color: itemHoverColor }} />
                  <Text fontSize="sm" fontWeight="600">Profile</Text>
                </Menu.Item>

                <Menu.Item
                  value="settings"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.1s"
                >
                  <Icon as={FiSettings} boxSize={4} color={iconColor} />
                  <Text fontSize="sm" fontWeight="600">Settings</Text>
                </Menu.Item>

                <Menu.Item
                  value="help"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.1s"
                >
                  <Icon as={FiHelpCircle} boxSize={4} color={iconColor} />
                  <Text fontSize="sm" fontWeight="600">Help Center</Text>
                </Menu.Item>
              </VStack>

              <Menu.Separator my={2} borderColor={borderColor} />

              <Menu.Item
                value="logout"
                gap={3}
                p={2.5}
                borderRadius="lg"
                color="red.500"
                _hover={{ bg: "red.50", color: "red.600" }}
                cursor="pointer"
                onClick={logoutUser}
                transition="all 0.1s"
              >
                <Icon as={FiLogOut} boxSize={4} />
                <Text fontSize="sm" fontWeight="700">Log Out</Text>
              </Menu.Item>

            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  );
}
