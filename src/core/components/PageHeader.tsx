import { Flex, Stack, Heading, Text, Box, Input, IconButton } from "@chakra-ui/react";
import { LuSearch, LuRefreshCw } from "react-icons/lu";
import { memo } from "react";

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    showRefresh?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export const PageHeader = memo(({
    title,
    subtitle,
    actions,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    showRefresh,
    onRefresh,
    isRefreshing
}: PageHeaderProps) => {
    return (
        <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            mb={8}
            p={6}
            bg="app.card.bg"
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor="app.card.border"
            borderRadius="2xl"
            boxShadow="sm"
            gap={4}
        >
            <Stack gap={1}>
                <Heading
                    size="2xl"
                    fontWeight="900"
                    letterSpacing="tight"
                    color="app.text.primary"
                >
                    {title}
                </Heading>
                {subtitle && (
                    <Box fontSize="sm" color="app.text.muted">
                        {subtitle}
                    </Box>
                )}
            </Stack>
            <Flex align="center" gap={4} flexWrap="wrap" justify={{ base: "flex-start", md: "flex-end" }} mt={{ base: 4, md: 0 }}>
                {/* Search Bar */}
                {onSearchChange && (
                    <Box position="relative" w={{ base: "full", md: "250px", lg: "350px" }}>
                        <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="app.text.muted" zIndex={1}>
                            <LuSearch />
                        </Box>
                        <Input
                            placeholder={searchPlaceholder || "Search..."}
                            value={searchValue || ""}
                            onChange={(e) => onSearchChange(e.target.value)}
                            pl={10}
                            h="40px"
                            bg="app.bg"
                            border="1px solid"
                            borderColor="app.card.border"
                            borderRadius="lg"
                            boxShadow="sm"
                            _hover={{ borderColor: "app.text.accent" }}
                            _focus={{ borderColor: "app.text.accent", boxShadow: "0 0 0 1px var(--chakra-colors-app-text-accent)" }}
                            transition="all 0.2s"
                        />
                    </Box>
                )}

                {/* Refresh Button */}
                {(showRefresh || onRefresh) && (
                    <IconButton
                        aria-label="Refresh"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        variant="ghost"
                        size="md"
                        color="app.text.muted"
                        _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.05)" }}
                    >
                        <LuRefreshCw className={isRefreshing ? "spin-animation" : ""} />
                    </IconButton>
                )}

                {/* Custom Actions */}
                {actions && (
                    <Box>
                        {actions}
                    </Box>
                )}
            </Flex>
        </Flex>
    );
});

PageHeader.displayName = "PageHeader";
