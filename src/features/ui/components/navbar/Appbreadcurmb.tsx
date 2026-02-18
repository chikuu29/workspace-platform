import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode";
import { FullscreenButton } from "@/components/ui/fullscreen-button";
import { Box, Breadcrumb, Flex } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState, useMemo } from "react";
import { LuHouse, LuShirt } from "react-icons/lu";
import { RiHome9Line } from "react-icons/ri";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { last } from "rxjs";
interface ConfigItem {
  path: string;
  label: string;
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
    },
  ]);
  useEffect(() => {
    const newConfig: ConfigItem[] = [{ path: "/myApps", label: "Home" }];

    if (!view && !appCode) {
      newConfig.push({ path: "#", label: "MyApps" });
    } else {
      // Base App Breadcrumb
      const appBasePath = appCode ? `/app/${appCode}/home` : `/?app=${appName}`;
      newConfig.push({
        path: `${pathname.split("/workspace")[0]}/workspace${appBasePath}`,
        label: appName,
      });

      if (view && view !== "home") {
        if (secondaryView) {
          const viewPath = appCode ? `/app/${appCode}/${view}` : `/${view}?app=${appName}`;
          newConfig.push({
            path: `${pathname.split("/workspace")[0]}/workspace${viewPath}`,
            label: view,
          });
        } else {
          const viewPath = appCode ? `/app/${appCode}/${view}` : `/${view}?app=${appName}`;
          newConfig.push({
            path: `${pathname.split("/workspace")[0]}/workspace${viewPath}`,
            label: view
          });
        }
      }

      if (secondaryView) {
        const secondaryPath = appCode ? `/app/${appCode}/${view}/${secondaryView}` : `/${view}/${secondaryView}?app=${appName}`;
        newConfig.push({
          path: `${pathname.split("/workspace")[0]}/workspace${secondaryPath}`,
          label: secondaryView,
        });
      }
    }

    setConfig(newConfig);
  }, [pathname, view, secondaryView, appName, appCode]);

  const handleNavigate = (c: ConfigItem, isLast: boolean) => {
    if (!isLast) navigate(c.path);
  };

  console.log("config", config);

  // const bgColor = useColorModeValue("white", "dark.100");
  return (
    <Box minH={"40px"} w="100%" >
      <Flex
        p={2}
        // bg={bgColor}
        zIndex={999}
        // px={2}
        // py={2}
        w="100%"
        alignItems="center"
        justifyContent="space-between"
        // borderTop="1px solid"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
      >
        <Breadcrumb.Root variant="plain" size="sm">
          <Breadcrumb.List>
            {config.map((c: ConfigItem, index) => {
              const isLast = index === config.length - 1;
              return (
                <React.Fragment key={index}>
                  <Breadcrumb.Item
                    gap={1}
                    onClick={() => handleNavigate(c, isLast)}
                    fontWeight={isLast ? "bold" : "medium"}
                    cursor={isLast ? "default" : "pointer"}
                    _hover={!isLast ? { textDecoration: "underline" } : {}}
                    color={isLast ? "teal.500" : "fg.muted"}
                  >
                    {c.label}
                  </Breadcrumb.Item>
                  {!isLast && <Breadcrumb.Separator />}
                </React.Fragment>
              );
            })}
          </Breadcrumb.List>
        </Breadcrumb.Root>

        <Flex gap={4} alignItems="center" >
          <ColorModeButton variant="brand" />
          <FullscreenButton variant="brand" />
        </Flex>
      </Flex>
    </Box>
  );
});

export default Appbreadcurmb;
