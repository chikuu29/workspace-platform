import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink } from "react-router";
import * as dynamicFunctions from "@/script/myAppsScript";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Tooltip } from "@/components/ui/tooltip";
import { useRef, useState, useCallback, useMemo, memo } from "react";

interface Actions {
  onClick?: any;
  onHover?: any;
}

interface MenuConfig {
  key: string;
  label: string;
  icon: any;
  path: string;
  target?: string;
  actions?: Actions;
}

interface MenuLinkProps {
  menuConfig: MenuConfig;
  showFullSideBarMenu: boolean;
}

/**
 * MenuLink
 * Individual navigation menu item with active route indicator (left accent bar),
 * tooltip on truncation/collapse, and smooth hover transitions.
 */
const MenuLink = memo(({ menuConfig, showFullSideBarMenu }: MenuLinkProps) => {
  const activeBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const activeAccent = useColorModeValue("blue.500", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        if (
          menuConfig?.actions?.onClick &&
          menuConfig?.actions?.onClick !== ""
        ) {
          if (typeof menuConfig.actions["onClick"] === "function") {
            menuConfig.actions["onClick"]();
          } else {
            const actionName = menuConfig.actions["onClick"];
            if (actionName in dynamicFunctions) {
              (dynamicFunctions as any)[actionName](e, menuConfig);
            }
          }
        }
      } catch (error) {
        // Silently handle action errors in production
      }
    },
    [menuConfig]
  );

  const navigationPath = useMemo(() => {
    if (!menuConfig.path) return "";
    const cleanPath = menuConfig.path.startsWith("/")
      ? menuConfig.path.substring(1)
      : menuConfig.path;
    return `/${tenant_name}/workspace/${cleanPath}`;
  }, [tenant_name, menuConfig.path]);

  const targetUrl = useMemo(() => {
    if (!menuConfig.target) return "";
    const cleanTarget = menuConfig.target.startsWith("/")
      ? menuConfig.target.substring(1)
      : menuConfig.target;
    return `/${tenant_name}/workspace/${cleanTarget}`;
  }, [tenant_name, menuConfig.target]);

  // ─── Expanded mode (icon + label) ───────────────────────────────
  const expandedContent = (
    <HStack
      align="center"
      justify="flex-start"
      cursor="pointer"
      w="full"
      minH="42px"
      px={3}
      py={2}
      borderRadius="xl"
      gap={3}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: hoverBg,
        transform: "translateX(2px)",
      }}
      _active={{ transform: "scale(0.98)" }}
      onMouseEnter={checkTruncation}
    >
      <Box
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <AsyncLoadIcon iconName={menuConfig.icon} />
      </Box>
      <Text
        ref={textRef}
        fontSize="sm"
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
  );

  // ─── Collapsed mode (icon only, centered) ──────────────────────
  const collapsedContent = (
    <VStack
      align="center"
      justify="center"
      cursor="pointer"
      w="56px"
      h="56px"
      mx="auto"
      borderRadius="xl"
      gap={1}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ bg: hoverBg }}
      _active={{ transform: "scale(0.95)" }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" h="24px">
        <AsyncLoadIcon iconName={menuConfig.icon} />
      </Box>
      <Text
        fontSize="0.6rem"
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

  const content = showFullSideBarMenu ? expandedContent : collapsedContent;

  // Tooltip: show on collapsed mode OR when text is truncated in expanded mode
  const wrappedContent = (
    <Tooltip
      content={menuConfig.label}
      showArrow
      openDelay={400}
      positioning={{
        placement: showFullSideBarMenu ? "bottom" : "right",
      }}
      disabled={showFullSideBarMenu && !isTruncated}
    >
      {content}
    </Tooltip>
  );

  // ─── Render with active route indicator ────────────────────────
  if (!menuConfig.path) {
    return (
      <Box w="full" onClick={handleClick}>
        {wrappedContent}
      </Box>
    );
  }

  if (menuConfig.target && menuConfig.target !== "") {
    return (
      <a
        href={targetUrl}
        style={{ width: "100%", textDecoration: "none" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {wrappedContent}
      </a>
    );
  }

  return (
    <NavLink
      to={navigationPath}
      style={({ isActive }) => ({
        width: "100%",
        display: "block",
        background: isActive ? activeBg : "transparent",
        borderRadius: "12px",
        textDecoration: "none",
        // Left accent bar for active route
        borderLeft: isActive ? `3px solid ${activeAccent}` : "3px solid transparent",
        transition: "all 0.2s ease",
      })}
    >
      {wrappedContent}
    </NavLink>
  );
});

export default MenuLink;
