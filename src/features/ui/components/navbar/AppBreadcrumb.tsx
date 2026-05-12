import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavActionStore } from "@/core/store/useNavActionStore";

import { Box, Breadcrumb, Flex, HStack, Text } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, useMemo } from "react";
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
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

interface ConfigItem {
  path: string;
  label: string;
  icon?: React.ReactElement;
}

const AppBreadcrumb = forwardRef((props, ref) => {
  const { view, secondaryView } = useParams();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { appName, appCode, workspacePrefix, buildPath, goBack } = useWorkspaceRouter();
  const breadcrumbActions = useNavActionStore((state) => state.actions);

  const [config, setConfig] = useState<ConfigItem[]>([
    {
      path: "/myApps",
      label: "Home",
      icon: <Home size="14" />
    },
  ]);

  useEffect(() => {
    const newConfig: ConfigItem[] = [
      { path: "/myApps", label: "Home", icon: <Home size="14" /> }
    ];

    if (pathname.toLowerCase().includes("/profile")) {
      newConfig.push({ path: pathname, label: "Profile", icon: <User size="14" /> });
    } else if (pathname.toLowerCase().includes("/settings")) {
      newConfig.push({ path: pathname, label: "Settings", icon: <Settings size="14" /> });
    } else if (pathname.toLowerCase().includes("/helpcenter")) {
      newConfig.push({ path: pathname, label: "Help Center", icon: <HelpCircle size="14" /> });
    } else if (!view && !appCode) {
      newConfig.push({ path: "#", label: "MyApps", icon: <Layers size="14" /> });
    } else {
      // App root path — delegated to shared buildPath utility
      newConfig.push({
        path: buildPath("home"),
        label: appName,
        icon: <BoxIcon size="14" />
      });

      if (view && view !== "home") {
        newConfig.push({
          path: buildPath(view),
          label: view,
          icon: <LayoutDashboard size="14" />
        });
      }

      if (secondaryView) {
        newConfig.push({
          path: buildPath(view || "", secondaryView),
          label: secondaryView,
          icon: <Layers size="14" />
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


  return (
    <Box
      w="100%"
      px={{ base: "3", sm: "4", md: "6" }}
      borderBottom="1px solid"
      borderColor={borderColorValue}
      bg={"app.card.bg"}
      backdropFilter="blur(12px)"
      position="sticky"
      top="0"
      zIndex="sticky"
      borderBottomRadius="20px"
    >
      <Flex
        minH={{ base: "auto", md: "56px" }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={{ base: "3", md: "4" }}
      >
        <HStack gap="0" flex="1" minW="0" overflow="hidden">
          {config.length > 1 && (
            <HStack gap="2" align="center">
              <HStack
                gap={{ base: "1.5", md: "2" }}
                px={{ base: "2.5", md: "3" }}
                py="1.5"
                rounded="lg"
                transition="all 0.2s"
                cursor="pointer"
                onClick={goBack}
                _hover={{ bg: hoverBg, transform: "translateY(-1px)" }}
                color={inactiveColor}
                minW="fit-content"
              >
                <ArrowLeft size="14" />
                <Text
                  fontWeight="600"
                  fontSize={{ base: "11px", md: "xs" }}
                  letterSpacing="tight"
                >
                  Back
                </Text>
              </HStack>
              <ChevronRight size="12" color={inactiveColor} />
            </HStack>
          )}

          <Box
            flex="1"
            minW="0"
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            css={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            _webkit-scrollbar={{ display: "none" }}
          >
            <Breadcrumb.Root variant="plain" size="sm">
              <Breadcrumb.List flexWrap="nowrap" minW="max-content">
                {config.map((c: ConfigItem, index) => {
                  const isLast = index === config.length - 1;
                  return (
                    <React.Fragment key={index}>
                      <Breadcrumb.Item>
                        <HStack
                          gap={{ base: "1.5", md: "2" }}
                          // px={{ base: "1.5", md: "3" }}
                          p="1.5"
                          rounded="lg"
                          transition="all 0.2s"
                          cursor={isLast ? "default" : "pointer"}
                          onClick={() => handleNavigate(c, isLast)}
                          _hover={!isLast ? { bg: hoverBg, transform: "translateY(-1px)" } : {}}
                          color={isLast ? activeColor : inactiveColor}
                          minW="fit-content"
                        >
                          {c.icon && <Box color={isLast ? activeColor : "inherit"}>{c.icon}</Box>}
                          <Text
                            fontWeight={isLast ? "bold" : "600"}
                            fontSize={{ base: "11px", md: "xs" }}
                            textTransform="capitalize"
                            letterSpacing="tight"
                            maxW={{ base: "112px", sm: "160px", md: "220px" }}
                            truncate
                          >
                            {c.label}
                          </Text>
                        </HStack>
                      </Breadcrumb.Item>
                      {!isLast && (
                        <Breadcrumb.Separator>
                          <Box color={inactiveColor} display="flex" alignItems="center">
                            <Slash size={12} color="currentColor" strokeWidth={2} />
                          </Box>
                        </Breadcrumb.Separator>
                      )}
                    </React.Fragment>
                  );
                })}
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </Box>
        </HStack>

        {breadcrumbActions && (
          <Box
            flexShrink={0}
            alignSelf={{ base: "stretch", md: "center" }}
            maxW={{ base: "full", md: "50%" }}
          >
            {breadcrumbActions}
          </Box>
        )}
      </Flex>
    </Box>
  );
});

export default AppBreadcrumb;
