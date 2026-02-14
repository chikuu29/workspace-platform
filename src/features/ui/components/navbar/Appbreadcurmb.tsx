import { useColorModeValue } from "@/components/ui/color-mode";
import { Box, Breadcrumb } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useState } from "react";
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
  console.log("===CALLING Appbreadcurmb===");
  const { view, secondaryView } = useParams(); // Access the `view` and `params` from the URL
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Default";
  const { pathname } = useLocation();
  console.log("pathname", pathname);

  const navigate = useNavigate();

  const [config, setConfig] = useState<ConfigItem[]>([
    {
      path: "/myApps",
      label: "Home",
    },
  ]);
  useEffect(() => {
    const newConfig: ConfigItem[] = [{ path: "/myApps", label: "Home" }];

    if (!view) {
      newConfig.push({ path: "#", label: "MyApps" });
    } else {
      newConfig.push({
        path: `${pathname}?app=${appName}`.replace(view, "home"),
        label: appName,
      });
      if (view != "home") {
        if (secondaryView) {
          // console.log(pathname.split("/").slice(0, 3).join("/"));
          newConfig.push({
            path: `${pathname.split("/").slice(0, 3).join("/")}?app=${appName}`,
            label: view,
          });
        } else {
          newConfig.push({ path: `${pathname}?app=${appName}`, label: view });
        }
      }
      if (secondaryView) {
        newConfig.push({
          path: `${pathname}?app=${appName}`,
          label: secondaryView,
        });
      }
    }

    setConfig(newConfig);
  }, [pathname, view, appName]);

  const handleNavigate = (c: ConfigItem, isLast: boolean) => {
    if (!isLast) navigate(c.path);
  };

  console.log("config", config);

  const bgColor = useColorModeValue("white", "dark.100");
  return (
    <Box minH={"40px"}>
      <Box
        // top={"3.1rem"}
        // top={"9%"}
        // position={"fixed"}
        // w={"30%"}
        bg={bgColor}
        zIndex={999}
        p={"2"}
        boxShadow={"md"}
        // border={'black'}
        // borderRadius={'4xl'}
        // display="inline-block"
        borderTopRightRadius="sm"
        borderBottomRightRadius="sm"
        width="fit-content"
        maxW="100%" // optional: prevents overflow
      >
        <Breadcrumb.Root ms={2} variant={"plain"} size={"sm"}>
          <Breadcrumb.List>
            {config.map((c: ConfigItem, index) => {
              const isLast = index === config.length - 1;
              return (
                <React.Fragment key={index}>
                  <Breadcrumb.Item
                    gap={1}
                    onClick={() => handleNavigate(c, isLast)}
                    fontWeight="bold"
                    cursor={isLast ? "default" : "pointer"}
                    _hover={!isLast ? { textDecoration: "underline" } : {}}
                    color={isLast ? "teal.500" : "fg.muted"}
                  >
                    {index === 0 && <RiHome9Line color="teal.500" />} {c.label}
                  </Breadcrumb.Item>
                  {!isLast && <Breadcrumb.Separator />}
                </React.Fragment>
              );
            })}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Box>
    </Box>
  );
});

export default Appbreadcurmb;
