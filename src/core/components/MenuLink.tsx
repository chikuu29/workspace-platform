import { Box, HStack, VStack, Text, Popover, Stack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useNavigate, useLocation } from "react-router";
import { buildWorkspacePath } from "@/core/utils/pathBuilder";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Tooltip } from "@/components/ui/tooltip";
import { useRef, useState, useCallback, useMemo, memo } from "react";
import { ActionEngine } from "@/core/action-engine/ActionEngine";
import { useModalStore } from "@/core/store/useModalStore";
import type { NavigationAction, ActionExecutionContext } from "@/core/action-engine/types";


// ─── Constants ───────────────────────────────────────────────────────────────

/** Shared easing for all interactive transitions in this component */
const TRANSITION = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

/** Centralized hover border definition.
 *  Change this ONE value → hover border updates on EVERY variant (expanded, collapsed). */
const HOVER_BORDER_COLOR = "app.btn.border";

/**
 * Stable style reset for the external-link <a> wrapper.
 * Defined at module level so the same object reference is used on every
 * render — prevents unnecessary re-creation and avoids inline object literals.
 *
 * display:block + lineHeight:normal strips browser UA styles that make a bare
 * <a> render taller than the route/action sibling branches.
 */
const EXTERNAL_LINK_STYLE: React.CSSProperties = {
    display: "block",
    width: "100%",
    textDecoration: "none",
    lineHeight: "normal",
    color: "inherit",
};

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface MenuConfig {
    key: string;
    label: string;
    icon: string;
    /** Raw SVG markup string — rendered instantly by AsyncLoadIcon when present */
    svgIcon?: string;
    path?: string;
    target?: string;
    /** Legacy onClick/onHover handlers */
    actions?: {
        onClick?: string | (() => void);
        onHover?: string | (() => void);
    };
    /** New action-driven navigation — replaces path when present */
    action?: NavigationAction;
    /** Sub-menu items for group rendering */
    menu?: MenuConfig[];
}

interface MenuLinkProps {
    menuConfig: MenuConfig;
    showFullSideBarMenu: boolean;
}

// ─── Shared hover style builder ───────────────────────────────────────────────

/**
 * Returns the _hover prop object for both expanded and collapsed variants.
 *
 * We only add a left border on hover (not all sides) for two reasons:
 *  1. It acts as a visual accent matching the NavLink active-state bar.
 *  2. A full border causes a 1px layout shift that clips on the left edge
 *     of the sidebar — using borderLeftWidth on an element that already
 *     reserves that space (via a transparent resting border) avoids this.
 */
function buildHoverStyles(hoverBg: string, includeShift: boolean) {
    return {
        bg: hoverBg,
        // Override only the left border; the resting state already reserves
        // 2px on the left via borderLeft so no layout shift occurs.
        borderLeftColor: HOVER_BORDER_COLOR,
        transform: includeShift ? "translateX(2px)" : undefined,
    };
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * MenuLink
 * Core navigation menu item with action engine integration.
 * Supports route, modal, external, callback actions via ActionEngine.
 * Falls back to path-based navigation for backward compatibility.
 *
 * Optimization notes:
 *  - memo() prevents re-renders when parent re-renders with same props.
 *  - All event handlers are stable via useCallback.
 *  - Hover style objects are built once via useMemo, not per-render.
 *  - NavLink style factory is stable via useCallback.
 *  - No inline object literals inside JSX.
 */
const MenuLink = memo(({ menuConfig, showFullSideBarMenu }: MenuLinkProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const activeAccent = useColorModeValue("blue.500", "blue.400");
    const hoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const organizations = useSelector((state: RootState) => state.organizations);

    const textRef = useRef<HTMLParagraphElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    // Zustand — only the openModal selector to avoid extra re-renders
    const openModal = useModalStore((s) => s.openModal);

    // ─── Derived values ───────────────────────────────────────────────

    const organizationName = useMemo(
        () => (organizations?.organization?.name ? organizations.organization.name : "GHOST_ORG"),
        [organizations?.organization?.name]
    );

    const actionContext = useMemo<ActionExecutionContext>(
        () => ({ navigate, openModal, organizationName, menuConfig: menuConfig as unknown as Record<string, unknown> }),
        [navigate, openModal, organizationName, menuConfig]
    );

    // ─── Stable hover style objects ──────────────────────────────────
    // Built once per hoverBg change — not recreated on every render.
    // Both variants share the same border semantics via HOVER_BORDER_COLOR.
    const expandedHover = useMemo(() => buildHoverStyles(hoverBg, /* shift */ true), [hoverBg]);
    const collapsedHover = useMemo(() => buildHoverStyles(hoverBg, /* shift */ false), [hoverBg]);

    // ─── Stable active style objects ─────────────────────────────────
    const expandedActive = useMemo(() => ({ transform: "scale(0.98)" }), []);
    const collapsedActive = useMemo(() => ({ transform: "scale(0.95)" }), []);

    // Path resolution delegated to shared pathBuilder utility
    const navigationPath = useMemo(
        () => (menuConfig.path ? buildWorkspacePath(menuConfig.path, organizationName) : ""),
        [organizationName, menuConfig.path],
    );

    const targetUrl = useMemo(
        () => (menuConfig.target ? buildWorkspacePath(menuConfig.target, organizationName) : ""),
        [organizationName, menuConfig.target],
    );

    /**
     * Recursive check to see if this item or any of its children are currently active.
     * This ensures parent "Groups" in the navbar stay highlighted.
     */
    const isGroupActive = useMemo(() => {
        // Direct path match
        if (navigationPath && location.pathname.startsWith(navigationPath)) {
            return true;
        }
        // Check children
        if (Array.isArray(menuConfig.menu)) {
            return menuConfig.menu.some((child) => {
                const cleanChild = child.path?.startsWith("/") ? child.path.substring(1) : child.path;
                if (!cleanChild) return false;
                const fullChildPath = `/${organizationName}/workspace/${cleanChild}`;
                return location.pathname.startsWith(fullChildPath);
            });
        }
        return false;
    }, [location.pathname, navigationPath, organizationName, menuConfig.menu]);

    // ─── Event handlers ───────────────────────────────────────────────

    const checkTruncation = useCallback(() => {
        if (textRef.current) {
            const { scrollWidth, clientWidth } = textRef.current;
            setIsTruncated(scrollWidth > clientWidth);
        }
    }, []);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (menuConfig.action) {
                e.preventDefault();
                ActionEngine.execute(menuConfig.action, actionContext);
                return;
            }
            if (menuConfig.actions?.onClick) {
                e.preventDefault();
                const handler = menuConfig.actions.onClick;
                if (typeof handler === "function") handler();
            }
        },
        [menuConfig.action, menuConfig.actions, actionContext]
    );

    // ─── Stable NavLink style factory ─────────────────────────────────
    const navLinkStyle = useCallback(
        ({ isActive }: { isActive: boolean }) => ({
            width: "100%",
            display: "block",
            // Background moves to the wrapper for nice hover layering
            background: isActive ? activeBg : "transparent",
            borderRadius: "5px",
            textDecoration: "none",
            transition: TRANSITION,
            lineHeight: "normal",
            color: "inherit",
        }),
        [activeBg]
    );

    // ─── Content Builder ──────────────────────────────────────────────
    // We pass through isActive so the inner components (expanded/collapsed)
    // can render the active accent bar themselves. This ensures we never
    // get 'double borders' when a NavLink wraps a border-endued HStack.
    const renderContent = (isActive: boolean = false) => {
        const expandedHover = buildHoverStyles(hoverBg, /* shift */ true);
        const collapsedHover = buildHoverStyles(hoverBg, /* shift */ false);

        const content = showFullSideBarMenu ? (
            <HStack
                align="center"
                justify="flex-start"
                cursor="pointer"
                w="full"
                minH="42px"
                px={3}
                py={2}
                borderRadius="5px"
                gap={3}
                transition={TRANSITION}
                // Border logic: reserve space, show accent if active OR hover
                borderLeft="2px solid"
                borderLeftColor={isActive ? activeAccent : "transparent"}
                _hover={expandedHover}
                _active={expandedActive}
                onMouseEnter={checkTruncation}
            >
                <Box flexShrink={0} display="flex" alignItems="center" justifyContent="center">
                    <AsyncLoadIcon iconName={menuConfig.icon} svgIcon={menuConfig.svgIcon} />
                </Box>
                <Text
                    ref={textRef}
                    // fontSize="sm"
                    // fontWeight="500"
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
                align="center"
                justify="center"
                cursor="pointer"
                w="56px"
                h="56px"
                mx="auto"
                borderRadius="5px"
                gap={1}
                transition={TRANSITION}
                // Consistent border logic for collapsed state
                borderLeft="2px solid"
                borderLeftColor={isActive ? activeAccent : "transparent"}
                _hover={collapsedHover}
                _active={collapsedActive}
            >
                <Box display="flex" alignItems="center" justifyContent="center" h="24px">
                    <AsyncLoadIcon iconName={menuConfig.icon} svgIcon={menuConfig.svgIcon} />
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

        const tooltipPlacement = showFullSideBarMenu ? "bottom" : "right";
        const tooltipDisabled = showFullSideBarMenu && !isTruncated;

        return (
            <Tooltip
                content={menuConfig.label}
                showArrow
                openDelay={400}
                positioning={{ placement: tooltipPlacement }}
                disabled={tooltipDisabled}
            >
                {content}
            </Tooltip>
        );
    };

    // ─── Render decision ──────────────────────────────────────────────

    // Group item — renders a Popover trigger + sub-menu
    if (Array.isArray(menuConfig.menu) && menuConfig.menu.length > 0) {
        return (
            <Popover.Root positioning={{ placement: "bottom-start" }}>
                <Popover.Trigger asChild>
                    <Box w="full" cursor="pointer" lineHeight="normal">
                        {renderContent(isGroupActive)}
                    </Box>
                </Popover.Trigger>
                <Popover.Positioner>
                    <Popover.Content
                        border={0}
                        boxShadow="xl"
                        p={4}
                        rounded="xl"
                        minW="sm"
                        bg="app.card.bg"
                        zIndex="popover"
                    >
                        <Stack>
                            {menuConfig.menu.map((child, index) => (
                                <MenuLink key={index} menuConfig={child} showFullSideBarMenu={true} />
                            ))}
                        </Stack>
                    </Popover.Content>
                </Popover.Positioner>
            </Popover.Root>
        );
    }

    // Action-driven or pathless items
    if (menuConfig.action || !menuConfig.path) {
        return (
            <Box w="full" onClick={handleClick} cursor="pointer" lineHeight="normal">
                {renderContent(false)}
            </Box>
        );
    }

    // External link items
    if (menuConfig.target) {
        return (
            <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={EXTERNAL_LINK_STYLE}
            >
                {renderContent(false)}
            </a>
        );
    }

    // Standard route items
    return (
        <NavLink to={navigationPath} style={navLinkStyle}>
            {({ isActive }) => renderContent(isActive)}
        </NavLink>
    );
});

export default MenuLink;
