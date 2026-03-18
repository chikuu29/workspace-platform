import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode";
import { FullscreenButton } from "@/components/ui/fullscreen-button";
import { Box, Breadcrumb, Flex, HStack, Text } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, useMemo } from "react";
import {
  LuHouse,
  LuBox,
  LuLayers,
  LuLayoutDashboard,
  LuChevronRight,
  LuUser,
  LuSettings
} from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

interface ConfigItem {
  path: string;
  label: string;
  icon?: React.ReactElement;
}

const AppBreadcrumb = forwardRef((props, ref) => {
  const { appCode, view, secondaryView } = useParams();
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");
  const appName = useMemo(() => appCode || appParam || "Default", [appCode, appParam]);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [config, setConfig] = useState<ConfigItem[]>([
    {
      path: "/myApps",
      label: "Home",
      icon: <LuHouse size="14" />
    },
  ]);

  useEffect(() => {
    const newConfig: ConfigItem[] = [
      { path: "/myApps", label: "Home", icon: <LuHouse size="14" /> }
    ];

    if (pathname.toLowerCase().includes("/profile")) {
      newConfig.push({ path: pathname, label: "Profile", icon: <LuUser size="14" /> });
    } else if (pathname.toLowerCase().includes("/settings")) {
      newConfig.push({ path: pathname, label: "Settings", icon: <LuSettings size="14" /> });
    } else if (pathname.toLowerCase().includes("/helpcenter")) {
      newConfig.push({ path: pathname, label: "Help Center", icon: <FiHelpCircle size="14" /> });
    } else if (!view && !appCode) {
      newConfig.push({ path: "#", label: "MyApps", icon: <LuLayers size="14" /> });
    } else {
      const appBasePath = appCode ? `/app/${appCode}/home` : `/?app=${appName}`;
      newConfig.push({
        path: `${pathname.split("/workspace")[0]}/workspace${appBasePath}`,
        label: appName,
        icon: <LuBox size="14" />
      });

      if (view && view !== "home") {
        const viewPath = appCode ? `/app/${appCode}/${view}` : `/${view}?app=${appName}`;
        newConfig.push({
          path: `${pathname.split("/workspace")[0]}/workspace${viewPath}`,
          label: view,
          icon: <LuLayoutDashboard size="14" />
        });
      }

      if (secondaryView) {
        const secondaryPath = appCode ? `/app/${appCode}/${view}/${secondaryView}` : `/${view}/${secondaryView}?app=${appName}`;
        newConfig.push({
          path: `${pathname.split("/workspace")[0]}/workspace${secondaryPath}`,
          label: secondaryView,
          icon: <LuLayers size="14" />
        });
      }
    }

    setConfig(newConfig);
  }, [pathname, view, secondaryView, appName, appCode]);

  const handleNavigate = (c: ConfigItem, isLast: boolean) => {
    if (!isLast) navigate(c.path);
  };

  const activeColor = useColorModeValue("blue.600", "blue.400");
  const inactiveColor = useColorModeValue("gray.500", "whiteAlpha.500");
  const hoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const borderColorValue = useColorModeValue("gray.100", "whiteAlpha.100");
  const bgValue = useColorModeValue("white/90", "rgba(15, 23, 42, 0.9)");
  const controlsBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const controlsBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Box
      w="100%"
      px={{ base: "3", sm: "4", md: "6" }}
      // py={{ base: "2.5", md: "2" }}
      borderBottom="1px solid"
      borderColor={borderColorValue}
      bg={bgValue}
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
        <Box flex="1" minW="0" overflow="hidden">
          <Box
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
                          px={{ base: "2.5", md: "3" }}
                          py="1.5"
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
                          <LuChevronRight size="12" color={inactiveColor} />
                        </Breadcrumb.Separator>
                      )}
                    </React.Fragment>
                  );
                })}
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </Box>
        </Box>

        <HStack
          gap="3"
          justify={{ base: "flex-end", md: "flex-start" }}
          alignSelf={{ base: "stretch", md: "center" }}
          flexShrink={0}
        >
          <Flex
            p="1"
            bg={controlsBg}
            rounded="xl"
            border="1px solid"
            borderColor={controlsBorder}
            justify="center"
            align="center"
            w={{ base: "full", sm: "auto" }}
          >
            <ColorModeButton variant="ghost" size="sm" rounded="lg" />
            <FullscreenButton variant="ghost" size="sm" rounded="lg" />
          </Flex>

        </HStack>
      </Flex>
    </Box>
  );
});

export default AppBreadcrumb;
