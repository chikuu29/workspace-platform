import { VStack, Text, Box, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { memo, useState, useCallback, useMemo } from "react";
import MenuLink from "@/core/components/MenuLink";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { ChevronDown } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Shared hover border colour — change once, applies to every interactive
 *  surface in this file including the CollapsibleGroup header. */
const HOVER_BORDER_COLOR = "app.btn.border";

const TRANSITION_FAST = "all 0.15s ease";
const TRANSITION_PANEL = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SideNavPropsType {
  showFullSideBarMenu: boolean;
}

// ─── CollapsibleGroup ─────────────────────────────────────────────────────────

/**
 * CollapsibleGroup
 * Accordion-style menu group with smooth chevron rotation and height animation.
 * The group header follows the same hover border convention as MenuLink items.
 */
const CollapsibleGroup = memo(
  ({
    label,
    children,
    showFull,
  }: {
    label: string;
    children: React.ReactNode;
    showFull: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(true);

    const textColor = useColorModeValue("gray.500", "whiteAlpha.500");
    const hoverBg = useColorModeValue("blue.50", "whiteAlpha.50");

    // Stable hover object — same border-left convention as MenuLink
    const groupHeaderHover = useMemo(
      () => ({
        bg: hoverBg,
        borderLeftColor: HOVER_BORDER_COLOR,
      }),
      [hoverBg]
    );

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

    // Collapsed sidebar — render children (icon-only) without group labels
    if (!showFull) return <>{children}</>;

    return (
      <Box w="full">
        <Flex
          align="center"
          justify="space-between"
          px={3}
          py={2}
          cursor="pointer"
          borderRadius="5px"
          onClick={handleToggle}
          transition={TRANSITION_FAST}
          // Reserve space for the left-border to prevent layout shift on hover
          borderLeft="2px solid transparent"
          _hover={groupHeaderHover}
          role="button"
          aria-expanded={isOpen}
        >
          <Text
            fontSize="0.7rem"
            fontWeight="700"
            color={textColor}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          {/* Chevron rotates smoothly on open/close */}
          <Box
            transition="transform 0.2s ease"
            transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
            color={textColor}
          >
            <ChevronDown size={14} />
          </Box>
        </Flex>

        {/* Animated content panel */}
        <Box
          overflow="hidden"
          transition={TRANSITION_PANEL}
          maxH={isOpen ? "1000px" : "0px"}
          opacity={isOpen ? 1 : 0}
        >
          <VStack gap={1} align="stretch" pl={0} pt={1}>
            {children}
          </VStack>
        </Box>
      </Box>
    );
  }
);

// ─── SideNavMenuBuilder ───────────────────────────────────────────────────────

/**
 * SideNavMenuBuilder
 * Renders the sidebar navigation tree from Redux state.
 * Supports collapsible sub-menu groups with animated expand/collapse.
 * Memoized to prevent re-renders when unrelated Redux state changes.
 */
const SideNavMenuBuilder = memo(({ showFullSideBarMenu }: SideNavPropsType) => {
  const { FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );

  if (FEATURE.length === 0) return null;

  return (
    <VStack gap={2} w="full" align={showFullSideBarMenu ? "stretch" : "center"}>
      {FEATURE.map((menu: any, index: number) => (
        <React.Fragment key={`menu-${index}`}>
          {menu.isMaster ? (
            /* Top-level standalone item */
            <MenuLink menuConfig={menu} showFullSideBarMenu={showFullSideBarMenu} />
          ) : (
            /* Grouped item with collapsible children */
            <CollapsibleGroup label={menu.label} showFull={showFullSideBarMenu}>
              {menu.menu?.map((subMenu: any, subIndex: number) => (
                <MenuLink
                  key={`sub-${index}-${subIndex}`}
                  menuConfig={{ iconColor: menu.iconColor, ...subMenu }}
                  showFullSideBarMenu={showFullSideBarMenu}
                />
              ))}
            </CollapsibleGroup>
          )}
        </React.Fragment>
      ))}
    </VStack>
  );
});

export default SideNavMenuBuilder;
