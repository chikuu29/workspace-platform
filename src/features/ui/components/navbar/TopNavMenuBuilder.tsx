import {
  Box,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import MenuLink from "@/core/components/MenuLink";
import { memo, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopNavPropsType {
  FEATURE_LIST: any[];
  SHOW_TOP_NAV_MENU: boolean;
}

// ─── TopNavMenuBuilder ────────────────────────────────────────────────────────

/**
 * TopNavMenuBuilder
 * Horizontal navigation bar rendered inside the global Navbar (desktop only).
 * Hidden on mobile via responsive display.
 * Uses the universal MenuLink component to ensure consistent design.
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
    <Box
      display={{ base: "none", lg: "block" }}
      w="full"
      minW={0}
      px={{ lg: 1, xl: 3 }}
      py="2"
      overflowX="auto"
      overflowY="hidden"
      css={scrollbarCss}
    >
      {!isPhoneScreen && (
        <Flex alignItems="center" minW="max-content">
          <Flex gap={{ lg: 1, xl: 2 }} flexWrap="nowrap">
            {FEATURE_LIST.map((navItem: any) => (
              <Box key={navItem.label} minW="fit-content" display="flex" alignItems="center">
                <MenuLink menuConfig={{ iconColor: navItem?.iconColor, ...navItem }} showFullSideBarMenu={true} />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
    </Box>
  );
});

export default TopNavMenuBuilder;
