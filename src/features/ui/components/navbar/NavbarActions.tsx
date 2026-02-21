import {
  Avatar,
  Box,
  Flex,
  Icon,
  IconButton,
  Menu,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode";
import { useAuth } from "@/contexts/AuthProvider";
import { useSelector } from "react-redux";
import {
  FiLogOut,
  FiSettings,
  FiUser,
  FiHelpCircle,
  FiRefreshCw,
} from "react-icons/fi";
import React, { useCallback } from "react";
import NotificationMenu from "./NotificationMenu";

/**
 * NavbarActions
 * Right-side actions: refresh, theme toggle, notifications, profile dropdown.
 * Wrapped with React.memo to prevent unnecessary re-renders from parent.
 */
const NavbarActions = () => {
  const auth = useSelector((state: any) => state.auth);
  const { logoutUser } = useAuth();

  // Memoize logout handler to maintain stable reference
  const handleLogout = useCallback(() => {
    logoutUser?.();
  }, [logoutUser]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Color Modes
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.200");
  const iconColor = useColorModeValue("gray.500", "gray.400");
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
    <Flex alignItems="center" flexDirection="row" gap={2}>
      {/* Refresh */}
      <IconButton
        aria-label="Refresh Page"
        variant="ghost"
        size="sm"
        borderRadius="xl"
        onClick={handleRefresh}
        _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
      >
        <Icon as={FiRefreshCw} boxSize={4} />
      </IconButton>

      {/* Theme Toggle */}
      <ColorModeButton
        variant="ghost"
        size="sm"
        borderRadius="xl"
        _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
      />

      {/* Notifications */}
      <NotificationMenu />

      {/* Profile Dropdown */}
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="User Profile"
            variant="ghost"
            size="sm"
            borderRadius="xl"
            _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
          >
            <Avatar.Root size="sm">
              <Avatar.Fallback
                name={userName}
                colorPalette="yellow"
                fontWeight="bold"
              />
              <Avatar.Image src={userImage} />
            </Avatar.Root>
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              minW="240px"
              backdropFilter="blur(16px)"
              borderRadius="2xl"
              boxShadow={shadow}
              border="1px solid"
              borderColor={borderColor}
              p={2}
              zIndex={1500}
              css={{
                transformOrigin: "top right",
                animation: "fadeInScale 0.15s ease-out",
              }}
            >
              {/* User Info Header */}
              <Box px={4} py={3.5} mb={1}>
                <Text
                  fontSize="xs"
                  color={subTextColor}
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  mb={1}
                >
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

              {/* Menu Items */}
              <VStack gap={1} align="stretch">
                <Menu.Item
                  value="profile"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.15s"
                >
                  <Icon as={FiUser} boxSize={4} color={iconColor} />
                  <Text fontSize="sm" fontWeight="600">
                    Profile
                  </Text>
                </Menu.Item>

                <Menu.Item
                  value="settings"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.15s"
                >
                  <Icon as={FiSettings} boxSize={4} color={iconColor} />
                  <Text fontSize="sm" fontWeight="600">
                    Settings
                  </Text>
                </Menu.Item>

                <Menu.Item
                  value="help"
                  gap={3}
                  p={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ bg: itemHoverBg, color: itemHoverColor }}
                  transition="all 0.15s"
                >
                  <Icon as={FiHelpCircle} boxSize={4} color={iconColor} />
                  <Text fontSize="sm" fontWeight="600">
                    Help Center
                  </Text>
                </Menu.Item>
              </VStack>

              <Menu.Separator my={2} borderColor={borderColor} />

              {/* Logout */}
              <Menu.Item
                value="logout"
                gap={3}
                p={2.5}
                borderRadius="lg"
                color="red.500"
                _hover={{ bg: "red.50", color: "red.600" }}
                cursor="pointer"
                onClick={handleLogout}
                transition="all 0.15s"
              >
                <Icon as={FiLogOut} boxSize={4} />
                <Text fontSize="sm" fontWeight="700">
                  Log Out
                </Text>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  );
};

export default React.memo(NavbarActions);
