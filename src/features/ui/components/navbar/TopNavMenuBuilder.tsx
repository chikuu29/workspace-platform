import {
  Box,
  Text,
  Flex,
  Popover,
  Stack,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import MenuLink from "@/core/components/MenuLink";
import React, { memo, useMemo } from "react";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Shared border color — change once, applies to every hover surface in this file */
const HOVER_BORDER_COLOR = "app.btn.border";

const TRANSITION = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopNavPropsType {
  FEATURE_LIST: any[];
  SHOW_TOP_NAV_MENU: boolean;
}

interface NavItemProps {
  menuConfig: any;
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

/**
 * NavItem
 * Top-nav menu item. Renders a Popover for groups with children, or a
 * plain MenuLink for leaf nodes. Hover border colour is centralised via
 * HOVER_BORDER_COLOR so it changes in one place.
 */
const NavItem = memo(({ menuConfig }: NavItemProps) => {
  const hoverBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  // Stable object — matches MenuLink's border-left convention
  const triggerHover = useMemo(
    () => ({
      bg: hoverBg,
      borderLeftColor: HOVER_BORDER_COLOR,
    }),
    [hoverBg]
  );

  const hasChildren = Array.isArray(menuConfig.menu) && menuConfig.menu.length > 0;

  return (
    <Flex
      align="center"
      p="2"
      mx="2"
      borderRadius="5px"
      role="group"
      cursor="pointer"
    >
      <Popover.Root positioning={{ placement: "bottom-start" }}>
        {hasChildren ? (
          <>
            {/* Group trigger — shows icon + label, opens popover */}
            <Popover.Trigger asChild>
              <HStack
                align="center"
                cursor="pointer"
                w="full"
                p={2}
                borderRadius="5px"
                transition={TRANSITION}
                // Reserve space for the left-border to prevent layout shift on hover
                borderLeft="2px solid"
                borderLeftColor="transparent"
                _hover={triggerHover}
              >
                <AsyncLoadIcon iconName={menuConfig.icon} />
                <Text fontSize="0.8rem" fontWeight="600" truncate w="full">
                  {menuConfig.label}
                </Text>
              </HStack>
            </Popover.Trigger>

            {/* Dropdown panel */}
            <Popover.Positioner>
              <Popover.Content
                border={0}
                boxShadow="xl"
                p={4}
                rounded="xl"
                minW="sm"
                bg="bg.default"
              >
                <Stack>
                  {menuConfig.menu.map((child: any, index: number) => (
                    <React.Fragment key={index}>
                      <MenuLink menuConfig={child} showFullSideBarMenu={true} />
                    </React.Fragment>
                  ))}
                </Stack>
              </Popover.Content>
            </Popover.Positioner>
          </>
        ) : (
          /* Leaf node — delegate entirely to MenuLink */
          <MenuLink menuConfig={menuConfig} showFullSideBarMenu={true} />
        )}
      </Popover.Root>
    </Flex>
  );
});

// ─── TopNavMenuBuilder ────────────────────────────────────────────────────────

/**
 * TopNavMenuBuilder
 * Horizontal navigation bar rendered inside the global Navbar (desktop only).
 * Hidden on mobile via responsive display.
 */
const TopNavMenuBuilder = memo(({ FEATURE_LIST, SHOW_TOP_NAV_MENU }: TopNavPropsType) => {
  const scrollbarThumbBg = useColorModeValue("secondaryGray.400", "whiteAlpha.200");
  const isPhoneScreen = useBreakpointValue({ base: true, md: false });

  // Stable CSS object for the scrollbar styling
  const scrollbarCss = useMemo(
    () => ({
      "& &::-webkit-scrollbar": { height: "6px" },
      "& &::-webkit-scrollbar-track": { height: "6px" },
      "& &::-webkit-scrollbar-thumb": { background: scrollbarThumbBg, borderRadius: "24px" },
      "& &::-webkit-scrollbar-thumb:hover": { background: "gray.500" },
    }),
    [scrollbarThumbBg]
  );

  if (!SHOW_TOP_NAV_MENU || FEATURE_LIST.length === 0) return null;

  return (
    <Box display={{ base: "none", md: "block" }} px="4" py="2" overflowX="auto" css={scrollbarCss}>
      {!isPhoneScreen && (
        <Flex alignItems="center">
          <Flex>
            {FEATURE_LIST.map((navItem: any) => (
              <NavItem key={navItem.label} menuConfig={navItem} />
            ))}
          </Flex>
        </Flex>
      )}
    </Box>
  );
});

export default TopNavMenuBuilder;
