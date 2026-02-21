import { VStack, Text, Box, Flex, Separator } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { memo, useState, useCallback } from "react";
import MenuLink from "@/core/components/MenuLink";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { LuChevronDown } from "react-icons/lu";

interface SideNavPropsType {
  showFullSideBarMenu: boolean;
}

/**
 * CollapsibleGroup
 * Accordion-style menu group with smooth chevron rotation and height animation.
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
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

    const handleToggle = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    if (!showFull) {
      // In collapsed mode, just render the children (icon-only) without group headers
      return <>{children}</>;
    }

    return (
      <Box w="full">
        <Flex
          align="center"
          justify="space-between"
          px={3}
          py={2}
          cursor="pointer"
          borderRadius="lg"
          onClick={handleToggle}
          _hover={{ bg: hoverBg }}
          transition="all 0.15s"
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
          <Box
            transition="transform 0.2s ease"
            transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
            color={textColor}
          >
            <LuChevronDown size={14} />
          </Box>
        </Flex>

        {/* Animated content area */}
        <Box
          overflow="hidden"
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
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

/**
 * SideNavMenuBuilder
 * Renders the sidebar navigation menu from Redux state.
 * Supports collapsible sub-menu groups, memoized for performance.
 */
const SideNavMenuBuilder = memo(({ showFullSideBarMenu }: SideNavPropsType) => {
  const { FEATURE }: APP_CONFIG_STATE = useSelector(
    (state: RootState) => state.app.AppConfigState
  );

  if (FEATURE.length === 0) return null;

  return (
    <VStack
      gap={2}
      w="full"
      align={showFullSideBarMenu ? "stretch" : "center"}
    >
      {FEATURE.map((menu: any, index: number) => (
        <React.Fragment key={`menu-${index}`}>
          {menu.isMaster ? (
            <MenuLink
              menuConfig={menu}
              showFullSideBarMenu={showFullSideBarMenu}
            />
          ) : (
            <CollapsibleGroup
              label={menu.label}
              showFull={showFullSideBarMenu}
            >
              {menu.menu?.map((subMenu: any, subIndex: number) => (
                <MenuLink
                  key={`sub-${index}-${subIndex}`}
                  menuConfig={subMenu}
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
