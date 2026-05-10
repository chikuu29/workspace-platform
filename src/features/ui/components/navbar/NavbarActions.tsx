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
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "@/app/store";
import { logout } from "@/app/slices/auth/authSlice";
import { POSTAPI } from "@/app/api";
import {
  LogOut,
  Settings,
  User,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import React, { useCallback } from "react";
import NotificationMenu from "./NotificationMenu";
import { FullscreenButton } from "@/components/ui/fullscreen-button";

/**
 * NavbarActions
 * Right-side actions: refresh, theme toggle, notifications, profile dropdown.
 * Wrapped with React.memo to prevent unnecessary re-renders from parent.
 */
const NavbarActions = () => {
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const orgName = useSelector((state: RootState) => state.organizations.organization?.name);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Memoize logout handler to maintain stable reference
  const handleLogout = useCallback(() => {
    POSTAPI({
      path: "/auth/logout",
      isPrivateApi: true,
    }).subscribe(
      () => {
        dispatch(logout());
        window.location.reload();
      },
      () => {
        dispatch(logout());
        window.location.reload();
      }
    );
  }, [dispatch]);

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
  const itemHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const itemHoverColor = "brand.500";
  const actionBg = useColorModeValue(
    "rgba(255, 255, 255, 0.74)",
    "rgba(15, 23, 42, 0.56)"
  );
  const actionBorder = useColorModeValue(
    "rgba(255, 255, 255, 0.82)",
    "rgba(255, 255, 255, 0.14)"
  );
  const actionShadow = useColorModeValue(
    "0 16px 34px -22px rgba(15, 23, 42, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.72)",
    "0 18px 38px -22px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
  );
  const actionHoverBg = useColorModeValue(
    "rgba(255, 255, 255, 0.92)",
    "rgba(30, 41, 59, 0.72)"
  );
  const actionHoverShadow = useColorModeValue(
    "0 22px 44px -24px rgba(79, 70, 229, 0.58), 0 0 0 1px rgba(99, 102, 241, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    "0 24px 48px -24px rgba(99, 102, 241, 0.42), 0 0 0 1px rgba(129, 140, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.14)"
  );
  const navActionButton = React.useMemo(
    () => ({
      h: { base: "8", sm: "9", md: "12" },
      minW: { base: "8", sm: "9", md: "12" },
      px: 0,
      borderRadius: { base: "lg", sm: "xl", md: "2xl" },
      color: "app.text.primary",
      bg: actionBg,
      border: "1px solid",
      borderColor: actionBorder,
      boxShadow: actionShadow,
      backdropFilter: "blur(18px) saturate(160%)",
      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        bg: actionHoverBg,
        borderColor: "brand.300",
        transform: "translateY(-2px) scale(1.02)",
        boxShadow: actionHoverShadow,
      },
      _active: {
        transform: "translateY(0) scale(0.98)",
        boxShadow: actionShadow,
      },
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "brand.300",
        outlineOffset: "3px",
      },
    }),
    [actionBg, actionBorder, actionHoverBg, actionHoverShadow, actionShadow]
  );

  const username = userProfile?.full_name || userProfile?.first_name || "Guest User";
  const userImage = userProfile?.profile?.avatar_url || "";

  return (
    <Flex alignItems="center" flexDirection="row" gap={{ base: 1, md: 2.5 }} flexShrink={0}>
      {/* Refresh */}
      <IconButton
        aria-label="Refresh Page"
        variant="ghost"
        onClick={handleRefresh}
        {...navActionButton}
      >
        <Icon as={RefreshCw} boxSize={{ base: 3.5, md: 5 }} />
      </IconButton>

      <FullscreenButton variant="ghost" size="md" display={{ base: "none", sm: "inline-flex" }} {...navActionButton} />

      {/* Theme Toggle */}
      <ColorModeButton
        variant="ghost"
        size="md"
        {...navActionButton}
      />

      {/* Notifications */}
      <NotificationMenu />

      {/* Profile Dropdown */}
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="User Profile"
            variant="ghost"
            {...navActionButton}
          >
            <Avatar.Root size={{ base: "xs", sm: "sm", md: "md" }}>
              <Avatar.Fallback
                name={username}
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
              bg={"app.card.bg"}
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
                  {username}
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
                  onClick={() => orgName && navigate(`/${orgName}/workspace/profile`)}
                >
                  <Icon as={User} boxSize={4} color={iconColor} />
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
                  onClick={() => orgName && navigate(`/${orgName}/workspace/settings`)}
                >
                  <Icon as={Settings} boxSize={4} color={iconColor} />
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
                  onClick={() => orgName && navigate(`/${orgName}/workspace/helpcenter`)}
                >
                  <Icon as={HelpCircle} boxSize={4} color={iconColor} />
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
                <Icon as={LogOut} boxSize={4} />
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
