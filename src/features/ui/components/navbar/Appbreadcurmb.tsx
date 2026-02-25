import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode";
import { FullscreenButton } from "@/components/ui/fullscreen-button";
import { Box, Breadcrumb, Flex, HStack, Text } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, useMemo } from "react";
import {
  LuHouse,
  LuBox,
  LuLayers,
  LuLayoutDashboard,
  LuChevronRight
} from "react-icons/lu";
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

const Appbreadcurmb = forwardRef((props, ref) => {
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

    if (!view && !appCode) {
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
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const borderColorValue = useColorModeValue("gray.100", "whiteAlpha.100");
  const bgValue = useColorModeValue("white/90", "rgba(15, 23, 42, 0.9)");
  const controlsBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const controlsBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Box
      h="56px"
      w="100%"
      px="6"
      borderBottom="1px solid"
      borderColor={borderColorValue}
      bg={bgValue}
      backdropFilter="blur(12px)"
      position="sticky"
      top="0"
      zIndex="sticky"
      borderBottomRadius="20px"
    >
      <Flex h="full" alignItems="center" justifyContent="space-between">
        <Breadcrumb.Root variant="plain" size="sm">
          <Breadcrumb.List>
            {config.map((c: ConfigItem, index) => {
              const isLast = index === config.length - 1;
              return (
                <React.Fragment key={index}>
                  <Breadcrumb.Item>
                    <HStack
                      gap="2"
                      px="3"
                      py="1.5"
                      rounded="lg"
                      transition="all 0.2s"
                      cursor={isLast ? "default" : "pointer"}
                      onClick={() => handleNavigate(c, isLast)}
                      _hover={!isLast ? { bg: hoverBg, transform: "translateY(-1px)" } : {}}
                      color={isLast ? activeColor : inactiveColor}
                    >
                      {c.icon && <Box color={isLast ? activeColor : "inherit"}>{c.icon}</Box>}
                      <Text
                        fontWeight={isLast ? "bold" : "600"}
                        fontSize="xs"
                        textTransform="capitalize"
                        letterSpacing="tight"
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

        <HStack gap="3">
          <Flex
            p="1"
            bg={controlsBg}
            rounded="xl"
            border="1px solid"
            borderColor={controlsBorder}
          >
            <ColorModeButton variant="ghost" size="sm" rounded="lg" />
            <FullscreenButton variant="ghost" size="sm" rounded="lg" />
          </Flex>

        </HStack>
      </Flex>
    </Box>
  );
});

export default Appbreadcurmb;
