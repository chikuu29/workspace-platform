import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavActionStore, type NavActionConfig } from "@/core/store/useNavActionStore";
import { Box, Breadcrumb, Button, Circle, Flex, HStack, Text, IconButton, Icon } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, isValidElement } from "react";
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
 * Helper to render context action buttons.
 * Supports legacy JSX elements or standard configuration objects.
 */
const renderNavActions = (actionsData: React.ReactNode | NavActionConfig[] | null) => {
  if (!actionsData) return null;

  if (isValidElement(actionsData)) {
    return actionsData;
  }

  if (Array.isArray(actionsData)) {
    return (
      <HStack gap={2} w={{ base: "full", md: "auto" }}>
        {actionsData.map((action, index) => {
          const {
            id,
            label,
            icon: IconComponent,
            onClick,
            type = "button",
            flexMobile = true,
            ...rest
          } = action;

          const key = id || `nav-action-${index}`;
          const isIconButton = type === "icon-button";

          const baseHoverStyles = rest._hover || {
            transform: "translateY(-1px)",
            boxShadow: rest.boxShadow || (rest.colorPalette === "blue" || rest.bg === "g_blue" ? "0 10px 24px -8px var(--chakra-colors-blue-500)" : "sm"),
          };

          const baseActiveStyles = rest._active || {
            transform: "translateY(0)",
          };

          if (isIconButton) {
            return (
              <IconButton
                key={key}
                borderRadius="sm"
                size="sm"
                onClick={onClick}
                aria-label={rest["aria-label"] || rest.ariaLabel || label || id || "action"}
                _hover={baseHoverStyles}
                _active={baseActiveStyles}
                transition="all 0.2s ease"
                type="button"
                {...rest}
              >
                {IconComponent && (
                  isValidElement(IconComponent) ? (
                    IconComponent
                  ) : (
                    <IconComponent size={16} />
                  )
                )}
              </IconButton>
            );
          }

          return (
            <Button
              key={key}
              borderRadius="sm"
              fontWeight="800"
              size="sm"
              flex={flexMobile ? { base: "1", md: "none" } : undefined}
              transition="all 0.2s ease"
              onClick={onClick}
              _hover={baseHoverStyles}
              _active={baseActiveStyles}
              type={type === "submit" ? "submit" : "button"}
              {...rest}
            >
              {IconComponent && (
                isValidElement(IconComponent) ? (
                  IconComponent
                ) : (
                  <Icon as={IconComponent} />
                )
              )}
              {label && (
                <Text fontSize={{ base: "10px", sm: "xs", md: "sm" }} ml={IconComponent ? 1 : 0}>
                  {label}
                </Text>
              )}
            </Button>
          );
        })}
      </HStack>
    );
  }

  return null;
};

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
      px={2}
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

            <Button
              variant="outline"

              borderRadius="md"
              onClick={goBack}
              fontWeight="700"
              fontSize="sm"

              borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)")}
              color="app.text.primary"
              _hover={{ bg: useColorModeValue("gray.50", "rgba(255,255,255,0.04)") }}
              _active={{ transform: "scale(0.97)" }}
            >
              <HStack gap={3}>
                <ArrowLeft size={14} />
                <Text>Back</Text>
              </HStack>
            </Button>
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
            {renderNavActions(breadcrumbActions)}
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
          {renderNavActions(breadcrumbActions)}
        </Box>
      )}
    </Box>
  );
});

AppBreadcrumb.displayName = "AppBreadcrumb";

export default AppBreadcrumb;
