import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { NavLink, useNavigate } from "react-router";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Tooltip } from "@/components/ui/tooltip";
import { useRef, useState, useCallback, useMemo, memo } from "react";
import { ActionEngine } from "@/core/action-engine/ActionEngine";
import { useModalStore } from "@/core/store/useModalStore";
import type { NavigationAction, ActionExecutionContext } from "@/core/action-engine/types";

// ─── Interfaces ──────────────────────────────────────────────────────

interface MenuConfig {
    key: string;
    label: string;
    icon: string;
    path?: string;
    target?: string;
    /** Legacy onClick/onHover handlers */
    actions?: {
        onClick?: string | (() => void);
        onHover?: string | (() => void);
    };
    /** New action-driven navigation — replaces path when present */
    action?: NavigationAction;
}

interface MenuLinkProps {
    menuConfig: MenuConfig;
    showFullSideBarMenu: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

/**
 * MenuLink
 * Core navigation menu item with action engine integration.
 * Supports route, modal, external, callback actions via ActionEngine.
 * Falls back to path-based navigation for backward compatibility.
 */
const MenuLink = memo(({ menuConfig, showFullSideBarMenu }: MenuLinkProps) => {
    const navigate = useNavigate();
    const activeBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const activeAccent = useColorModeValue("blue.500", "blue.400");
    const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const auth = useSelector((state: RootState) => state.auth);

    const textRef = useRef<HTMLParagraphElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    // Zustand — only the openModal selector, no extra re-renders
    const openModal = useModalStore((s) => s.openModal);

    const checkTruncation = useCallback(() => {
        if (textRef.current) {
            const { scrollWidth, clientWidth } = textRef.current;
            setIsTruncated(scrollWidth > clientWidth);
        }
    }, []);

    const tenant = useMemo(() => {
        return auth?.loginInfo ? auth.loginInfo["tenant_name"] : "GHOST_TENANT";
    }, [auth?.loginInfo]);

    // ─── Execution context for ActionEngine ──────────────────────────
    const actionContext = useMemo<ActionExecutionContext>(
        () => ({
            navigate,
            openModal,
            tenant,
            menuConfig: menuConfig as unknown as Record<string, unknown>,
        }),
        [navigate, openModal, tenant, menuConfig]
    );

    // ─── Click handler ───────────────────────────────────────────────
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            // If action-driven → delegate to ActionEngine
            if (menuConfig.action) {
                e.preventDefault();
                ActionEngine.execute(menuConfig.action, actionContext);
                return;
            }

            // Legacy: actions.onClick support (backward compat)
            if (menuConfig.actions?.onClick) {
                e.preventDefault();
                const onClickRef = menuConfig.actions.onClick;
                if (typeof onClickRef === "function") {
                    onClickRef();
                }
            }
        },
        [menuConfig.action, menuConfig.actions, actionContext]
    );

    // ─── Path building for NavLink ───────────────────────────────────
    const navigationPath = useMemo(() => {
        if (!menuConfig.path) return "";
        const cleanPath = menuConfig.path.startsWith("/")
            ? menuConfig.path.substring(1)
            : menuConfig.path;
        return `/${tenant}/workspace/${cleanPath}`;
    }, [tenant, menuConfig.path]);

    const targetUrl = useMemo(() => {
        if (!menuConfig.target) return "";
        const cleanTarget = menuConfig.target.startsWith("/")
            ? menuConfig.target.substring(1)
            : menuConfig.target;
        return `/${tenant}/workspace/${cleanTarget}`;
    }, [tenant, menuConfig.target]);

    // ─── Expanded mode (icon + label) ────────────────────────────────
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

    // ─── Collapsed mode (icon only, centered) ────────────────────────
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

    // Tooltip: show on collapsed mode OR when text is truncated
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

    // ─── Render decision ─────────────────────────────────────────────

    // Action-driven items (modal, callback, etc.) — no NavLink needed
    if (menuConfig.action || !menuConfig.path) {
        return (
            <Box w="full" onClick={handleClick} cursor="pointer">
                {wrappedContent}
            </Box>
        );
    }

    // External link items
    if (menuConfig.target) {
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

    // Standard route items — NavLink with active indicator
    return (
        <NavLink
            to={navigationPath}
            style={({ isActive }) => ({
                width: "100%",
                display: "block",
                background: isActive ? activeBg : "transparent",
                borderRadius: "12px",
                textDecoration: "none",
                borderLeft: isActive
                    ? `3px solid ${activeAccent}`
                    : "3px solid transparent",
                transition: "all 0.2s ease",
            })}
        >
            {wrappedContent}
        </NavLink>
    );
});

export default MenuLink;
