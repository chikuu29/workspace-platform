import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavActionStore, type NavActionConfig } from "@/core/store/useNavActionStore";
import { Box, Breadcrumb, Button, Flex, HStack, Text, IconButton, Icon } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, useMemo, useCallback, isValidElement } from "react";
import {
  ArrowLeft,
  Home,
  Box as BoxIcon,
  Layers,
  LayoutDashboard,
  ChevronRight,
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
 * Unified chip height across breakpoints — ensures the Back button and
 * every breadcrumb item render at exactly the same height on every device.
 */
const CHIP_H = { base: "32px", sm: "34px", md: "36px" };

/** Icon size that scales with the chip */
const ICON_SIZE = { base: 12, md: 14 };

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
 * Design:
 *  - Every element in the bar — Back button, breadcrumb chips, separators —
 *    shares the same height token (CHIP_H) for perfect vertical alignment.
 *  - Pill-shaped chips with subtle borders and hover lift for a premium feel.
 *  - ChevronRight separators keep the trail scannable.
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

  const handleNavigate = useCallback(
    (c: ConfigItem, isLast: boolean) => {
      if (!isLast) navigate(c.path);
    },
    [navigate]
  );

  // ── Theme tokens ──
  const activeColor = useColorModeValue("blue.600", "blue.400");
  const inactiveColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const separatorColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const chipBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const activeBg = useColorModeValue("blue.50", "blue.500/10");
  const borderBottom = useColorModeValue("gray.100", "whiteAlpha.50");
  const backBtnBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const backBtnHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");

  // Stable hover styles — not re-created every render
  const chipHoverInactive = useMemo(
    () => ({
      bg: hoverBg,
      borderColor: chipBorder,
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08)",
    }),
    [hoverBg, chipBorder]
  );

  // Hidden-scrollbar CSS — reused in both scroll boxes
  const noScrollbar = useMemo(
    () => ({
      scrollbarWidth: "none" as const,
      msOverflowStyle: "none" as const,
      "&::-webkit-scrollbar": { display: "none" },
    }),
    []
  );

  return (
    <Box
      w="100%"
      px={{ base: 1, sm: 2, md: 3 }}
      py={{ base: 1, md: "6px" }}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={borderBottom}
      position="sticky"
      top="0"
      zIndex={998}
      css={{
        /**
         * iOS Safari needs -webkit-backdrop-filter for the glassmorphism blur.
         * translate3d forces a compositing layer to prevent flicker.
         */
        WebkitBackdropFilter: "blur(12px)",
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* ── Main row: Back + breadcrumb trail + actions ── */}
      <Flex
        align="center"
        justify="space-between"
        gap={{ base: 1, md: 3 }}
        minH={CHIP_H}
      >
        {/* Left: Back button + horizontally scrollable trail */}
        <Flex align="center" gap={{ base: 1, md: 2 }} flex="1" minW={0} overflow="hidden">
          {/* ── Back Button ── */}
          {config.length > 1 && (
            <Button
              aria-label="Go back"
              variant="outline"
              h={CHIP_H}
              px={{ base: 2, md: 3 }}
              borderRadius="lg"
              onClick={goBack}
              fontWeight="700"
              fontSize={{ base: "xs", md: "sm" }}
              flexShrink={0}
              border="1px solid"
              borderColor={backBtnBorder}
              color="app.text.primary"
              transition="all 0.2s ease"
              _hover={{
                bg: backBtnHoverBg,
                borderColor: chipBorder,
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08)",
              }}
              _active={{ transform: "scale(0.97)" }}
            >
              <HStack gap={{ base: 1, md: 2 }}>
                <ArrowLeft size={14} />
                <Text display={{ base: "none", sm: "inline" }}>Back</Text>
              </HStack>
            </Button>
          )}

          {/* ── Breadcrumb Trail ── */}
          <Box
            flex="1"
            minW={0}
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            css={noScrollbar}
          >
            <Breadcrumb.Root variant="plain" size="sm">
              <Breadcrumb.List flexWrap="nowrap" minW="max-content" gap={0}>
                {config.map((c: ConfigItem, index) => {
                  const isLast = index === config.length - 1;
                  return (
                    <React.Fragment key={c.path + c.label}>
                      <Breadcrumb.Item>
                        <HStack
                          gap={{ base: "1", md: "1.5" }}
                          h={CHIP_H}
                          px={{ base: "1.5", md: "2.5" }}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={isLast ? activeColor : "transparent"}
                          bg={isLast ? activeBg : "transparent"}
                          transition="all 0.2s ease"
                          cursor={isLast ? "default" : "pointer"}
                          onClick={() => handleNavigate(c, isLast)}
                          _hover={!isLast ? chipHoverInactive : {}}
                          _active={!isLast ? { transform: "scale(0.97)" } : {}}
                          color={isLast ? activeColor : inactiveColor}
                          minW="fit-content"
                        >
                          {c.icon && (
                            <Box
                              color={isLast ? activeColor : "inherit"}
                              flexShrink={0}
                              display="flex"
                              alignItems="center"
                            >
                              {c.icon}
                            </Box>
                          )}
                          <Text
                            fontWeight={isLast ? "700" : "600"}
                            fontSize={{ base: "11px", sm: "xs", md: "xs" }}
                            textTransform="capitalize"
                            letterSpacing="tight"
                            lineHeight="1"
                            maxW={{
                              base: "72px",
                              sm: "120px",
                              md: "180px",
                              lg: "260px",
                            }}
                            truncate
                          >
                            {c.label}
                          </Text>
                        </HStack>
                      </Breadcrumb.Item>

                      {/* Chevron separator — visually centered to the chip height */}
                      {!isLast && (
                        <Breadcrumb.Separator>
                          <Box
                            color={separatorColor}
                            display="flex"
                            alignItems="center"
                            h={CHIP_H}
                            px={{ base: 0, md: "2px" }}
                          >
                            <ChevronRight size={14} strokeWidth={2} />
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
          pt={1.5}
          pb={1}
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
