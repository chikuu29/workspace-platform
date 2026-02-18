import { Steps, Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { Link, NavLink } from "react-router";
// import DashBoard from "@/features/dashboard/DashBoard";
import * as dynamicFunctions from "@/script/myAppsScript";
// import { IconType } from 'react-icons';
// import * as Icons from 'react-icons/fi';

// import DynamicIcon from "@/utils/app/renderDynamicIcons";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

interface actions {
  onClick?: any;
  onHover?: any;
}
interface Menu {
  key: string;
  label: string;
  icon: any;
  path: string;
  target?: string;
  actions?: actions;
  // component: any;
}

interface MenuLinkInterFace {
  menuConfig: Menu;
  showFullSideBarMenu: boolean;
}

import { Tooltip } from "@/components/ui/tooltip";
import { useRef, useState, useCallback, useMemo } from "react";

export default function MenuLink(props: MenuLinkInterFace) {
  const { menuConfig, showFullSideBarMenu } = props;
  const { colorMode } = useColorMode();
  const activeBg = useColorModeValue("#F4F7FE", "#171717");
  const hoverBg = useColorModeValue("secondaryGray.400", "whiteAlpha.200");
  const auth = useSelector((state: RootState) => state.auth);

  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, []);

  const tenant_name = auth?.loginInfo
    ? auth.loginInfo["tenant_name"]
    : "GHOST_TENANT";
  // console.log("===TENANT NAME===", tenant_name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (menuConfig?.actions?.onClick && menuConfig?.actions?.onClick !== "") {
        if (typeof menuConfig.actions["onClick"] == "function") {
          menuConfig.actions["onClick"]();
        } else {
          const actionName = menuConfig.actions["onClick"];
          if (actionName in dynamicFunctions) {
            // Call the dynamic function
            (dynamicFunctions as any)[actionName](e, menuConfig); // Cast to any to access the function
          } else {
            console.log(
              `%c===CHECK YOUR METHOD ${menuConfig.actions["onClick"]}() NOT FOUND IN 'script/myAppsScript'===`,
              "color:red"
            );
          }
        }
      }
    } catch (error) {
      console.log("%c===ERROR===", error);
    }
  };

  const commonProps = {
    align: "center",
    justify: showFullSideBarMenu ? "flex-start" : "center",
    cursor: "pointer",
    w: "full",
    minH: showFullSideBarMenu ? "45px" : "70px",
    px: showFullSideBarMenu ? 4 : 0,
    py: showFullSideBarMenu ? 2 : 2,
    borderRadius: "12px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: {
      bg: hoverBg,
      transform: "translateX(4px)",
    },
    _active: {
      transform: "scale(0.98)",
    },
    onMouseEnter: checkTruncation,
  };

  const content = showFullSideBarMenu ? (
    <HStack {...commonProps} gap={3}>
      <Box flexShrink={0} display="flex" alignItems="center" justifyContent="center">
        <AsyncLoadIcon iconName={menuConfig.icon} />
      </Box>
      <Text
        ref={textRef}
        // fontSize="0.9rem"
        fontWeight="500"
        color="text.default"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        w="full"
      >
        {menuConfig.label}
      </Text>
    </HStack>
  ) : (
    <VStack
      {...commonProps}
      _hover={{ ...commonProps._hover, transform: "none" }}
      gap={1}
      w="64px"
      h="64px"
      px={2}
      mx="auto"
    >
      <Box display="flex" alignItems="center" justifyContent="center" h="24px">
        <AsyncLoadIcon iconName={menuConfig.icon} />
      </Box>
      <Text
        ref={textRef}
        fontSize="0.7rem"
        fontWeight="700"
        textAlign="center"
        color="text.default"
        w="full"
        px={1}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        lineHeight="1.2"
      >
        {menuConfig.label}
      </Text>
    </VStack>
  );

  const wrappedContent = (
    <Tooltip
      content={menuConfig.label}
      showArrow
      openDelay={500}
      positioning={{ placement: showFullSideBarMenu ? "bottom" : "right" }}
      disabled={!isTruncated}
    >
      {content}
    </Tooltip>
  );

  const navigationPath = useMemo(() => {
    if (!menuConfig.path) return "";
    // Remove leading slash from path if it exists to avoid double slashes when joining
    const cleanPath = menuConfig.path.startsWith("/") ? menuConfig.path.substring(1) : menuConfig.path;
    return `/${tenant_name}/workspace/${cleanPath}`;
  }, [tenant_name, menuConfig.path]);

  const targetUrl = useMemo(() => {
    if (!menuConfig.target) return "";
    const cleanTarget = menuConfig.target.startsWith("/") ? menuConfig.target.substring(1) : menuConfig.target;
    return `/${tenant_name}/workspace/${cleanTarget}`;
  }, [tenant_name, menuConfig.target]);

  return menuConfig.path ? (
    menuConfig.target && menuConfig.target !== "" ? (
      <a
        href={targetUrl}
        style={{ width: "100%", textDecoration: "none" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {wrappedContent}
      </a>
    ) : (
      <NavLink
        to={navigationPath}
        style={({ isActive }) => ({
          width: "100%",
          display: "block",
          background: isActive ? activeBg : "transparent",
          borderRadius: "12px",
          textDecoration: "none",
        })}
      >
        {wrappedContent}
      </NavLink>
    )
  ) : (
    <Box w="full" onClick={handleClick}>
      {wrappedContent}
    </Box>
  );
}
