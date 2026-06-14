import React, { memo } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { PageHeader } from "./PageHeader";

export interface PageLayoutProps extends Omit<BoxProps, "title"> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    showRefresh?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    icon?: React.ElementType;
    /** Contextual badge label displayed above the title */
    badge?: string;
    /** Override badge color palette */
    badgeColor?: string;
    /** Accent color key — controls gradient bar, icon glow, badge */
    accentColor?: string;
    children: React.ReactNode;
}

export const PageLayout = memo(({
    title,
    subtitle,
    actions,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    showRefresh,
    onRefresh,
    isRefreshing,
    icon,
    badge,
    badgeColor,
    accentColor,
    children,
    ...rest
}: PageLayoutProps) => {
    return (
        <Box mt={4} animation="fade-in 0.5s ease-out" w="full" {...rest}>
            <PageHeader
                title={title}
                subtitle={subtitle}
                actions={actions}
                searchPlaceholder={searchPlaceholder}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                showRefresh={showRefresh}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
                icon={icon}
                badge={badge}
                badgeColor={badgeColor}
                accentColor={accentColor}
            />
            <Box
                backdropFilter="blur(16px)"
                borderColor="app.card.border"
                overflow="hidden"
                boxShadow="inner-xl"
            // p={4}
            >
                {children}
            </Box>
        </Box>
    );
});

PageLayout.displayName = "PageLayout";
