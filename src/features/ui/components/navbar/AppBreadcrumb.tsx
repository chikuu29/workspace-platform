import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { Box, Breadcrumb, Circle, Flex, HStack, Text } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState } from "react";
import {
  ArrowLeft,
  Home,
  Box as BoxIcon,
  Layers,
  LayoutDashboard,
  ChevronRight,
  Slash,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

interface ConfigItem {
  path: string;
  label: string;
  icon?: React.ReactElement;
}

/**
 * AppBreadcrumb
 * Sticky sub-header with breadcrumb navigation + optional page-level actions.
 *
 * Responsive layout:
 *  - base (mobile): breadcrumb trail row on top, action buttons in a
 *    dedicated full-width row below — prevents cramped side-by-side layout.
 *  - md+: breadcrumb trail on the left, actions on the right in one row.
 *
 * Sticky positioning uses top="0" because the component lives inside the
 * scrollable content Box that already starts below the fixed Navbar spacer.
 */
const AppBreadcrumb = forwardRef((_props, _ref) => {
  const { view, secondaryView } = useParams();
  const { pathname } = useLocation();
  const { appName, appCode, buildPath, goBack } = useWorkspaceRouter();
  const breadcrumbActions = useNavActionStore((state) => state.actions);

  const [config, setConfig] = useState<ConfigItem[]>([
    { path: "/myApps", label: "Home", icon: <Home size={14} /> },
  ]);

  useEffect(() => {
    const newConfig: ConfigItem[] = [
      { path: "/myApps", label: "Home", icon: <Home size={14} /> },
    ];

    if (pathname.toLowerCase().includes("/profile")) {
      newConfig.push({ path: pathname, label: "Profile", icon: <User size={14} /> });
    } else if (pathname.toLowerCase().includes("/settings")) {
      newConfig.push({ path: pathname, label: "Settings", icon: <Settings size={14} /> });
    } else if (pathname.toLowerCase().includes("/helpcenter")) {
      newConfig.push({ path: pathname, label: "Help Center", icon: <HelpCircle size={14} /> });
    } else if (!view && !appCode) {
      newConfig.push({ path: "#", label: "MyApps", icon: <Layers size={14} /> });
    } else {
      newConfig.push({
        path: buildPath("home"),
        label: appName,
        icon: <BoxIcon size={14} />,
      });
      if (view && view !== "home") {
        newConfig.push({
          path: buildPath(view),
          label: view,
          icon: <LayoutDashboard size={14} />,
        });
      }
      if (secondaryView) {
        newConfig.push({
          path: buildPath(view || "", secondaryView),
          label: secondaryView,
          icon: <Layers size={14} />,
        });
      }
    }

    setConfig(newConfig);
  }, [pathname, view, secondaryView, appName, appCode, buildPath]);

  const navigate = useNavigate();

  const handleNavigate = (c: ConfigItem, isLast: boolean) => {
    if (!isLast) navigate(c.path);
  };

  const activeColor = useColorModeValue("blue.600", "blue.400");
  const inactiveColor = useColorModeValue("gray.500", "whiteAlpha.500");
  const hoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const borderColorValue = useColorModeValue("gray.100", "whiteAlpha.100");

  // Hidden-scrollbar CSS — reused in both scroll boxes
  const noScrollbar = {
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
  };

  return (
    <Box
      w="100%"
      // py={{ base: "0.5rem", md: "0.65rem" }}
      px={{ base: "3", sm: "4", md: "6" }}
      // borderBottom="1px solid"
      // borderColor={borderColorValue}
      // bg="app.card.bg"
      backdropFilter="blur(12px)"
      position="sticky"
      top="0"
      zIndex={998}
    >
      {/* ── Top row: Back + breadcrumb trail (always) + actions on md+ ── */}
      <Flex
        align="center"
        justify="space-between"
        gap={{ base: 2, md: 4 }}
        minH={{ base: "36px", md: "44px" }}
      >
        {/* Left: Back button + horizontally scrollable trail */}
        <Flex align="center" gap={0} flex="1" minW={0} overflow="hidden">
          {config.length > 1 && (
            <HStack gap={2} align="center" flexShrink={0}>
              <HStack
                role="group"
                gap={1.5}
                pl="1.5"
                pr={{ base: "1.5", sm: "3.5" }}
                py="1"
                rounded="full"
                border="1px solid"
                borderColor={useColorModeValue("blue.600", "blue.500")}
                bg={useColorModeValue("blue.600", "blue.500")}
                boxShadow={useColorModeValue("0 2px 8px rgba(49, 130, 206, 0.25)", "none")}
                transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                cursor="pointer"
                onClick={goBack}
                _hover={{
                  bg: useColorModeValue("blue.700", "blue.600"),
                  borderColor: useColorModeValue("blue.700", "blue.600"),
                  boxShadow: useColorModeValue("0 4px 15px rgba(49, 130, 206, 0.45)", "0 4px 20px rgba(49, 130, 206, 0.35)"),
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "scale(0.97)" }}
                color="white"
              >
                <Circle
                  size={5}
                  bg={useColorModeValue("rgba(255, 255, 255, 0.18)", "rgba(255, 255, 255, 0.15)")}
                  color="white"
                  transition="transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  _groupHover={{ transform: "translateX(-2px)" }}
                >
                  <ArrowLeft size={10} strokeWidth={3} />
                </Circle>
                <Text
                  fontWeight="850"
                  fontSize={{ base: "9px", md: "10px" }}
                  letterSpacing="wider"
                  textTransform="uppercase"
                  display={{ base: "none", sm: "block" }}
                >
                  Back
                </Text>
              </HStack>
              <ChevronRight size={11} color={inactiveColor} />
            </HStack>
          )}

          {/* Horizontally scrollable breadcrumb trail */}
          <Box
            flex="1"
            minW={0}
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            css={noScrollbar}
          >
            <Breadcrumb.Root variant="plain" size="sm">
              <Breadcrumb.List flexWrap="nowrap" minW="max-content">
                {config.map((c: ConfigItem, index) => {
                  const isLast = index === config.length - 1;
                  return (
                    <React.Fragment key={index}>
                      <Breadcrumb.Item>
                        <HStack
                          gap={{ base: "1", md: "1.5" }}
                          p="1.5"
                          rounded="lg"
                          transition="all 0.2s"
                          cursor={isLast ? "default" : "pointer"}
                          onClick={() => handleNavigate(c, isLast)}
                          _hover={
                            !isLast
                              ? { bg: hoverBg, transform: "translateY(-1px)" }
                              : {}
                          }
                          color={isLast ? activeColor : inactiveColor}
                          minW="fit-content"
                        >
                          {c.icon && (
                            <Box color={isLast ? activeColor : "inherit"}>
                              {c.icon}
                            </Box>
                          )}
                          <Text
                            fontWeight={isLast ? "bold" : "600"}
                            fontSize={{ base: "11px", md: "xs" }}
                            textTransform="capitalize"
                            letterSpacing="tight"
                            maxW={{
                              base: "80px",
                              sm: "140px",
                              md: "200px",
                              lg: "260px",
                            }}
                            truncate
                          >
                            {c.label}
                          </Text>
                        </HStack>
                      </Breadcrumb.Item>
                      {!isLast && (
                        <Breadcrumb.Separator>
                          <Box color={inactiveColor} display="flex" alignItems="center">
                            <Slash size={11} color="currentColor" strokeWidth={2} />
                          </Box>
                        </Breadcrumb.Separator>
                      )}
                    </React.Fragment>
                  );
                })}
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </Box>
        </Flex>

        {/*
         * Desktop actions (md+) — sits to the right of the breadcrumb trail.
         * Hidden on mobile to prevent the cramped side-by-side squeeze.
         */}
        {breadcrumbActions && (
          <Box flexShrink={0} display={{ base: "none", md: "block" }}>
            {breadcrumbActions}
          </Box>
        )}
      </Flex>

      {/*
       * Mobile-only actions row (hidden on md+).
       * Renders full-width below the breadcrumb trail so buttons always have
       * enough room to be readable and comfortably tappable on small screens.
       * Scrolls horizontally if there are many buttons.
       */}
      {breadcrumbActions && (
        <Box
          display={{ base: "flex", md: "none" }}
          w="full"
          pt={2}
          overflowX="auto"
          css={noScrollbar}
        >
          {breadcrumbActions}
        </Box>
      )}
    </Box>
  );
});

AppBreadcrumb.displayName = "AppBreadcrumb";

export default AppBreadcrumb;
