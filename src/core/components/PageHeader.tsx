import { Flex, Stack, Heading, Text, Box, Input, IconButton } from "@chakra-ui/react";
import { Search, RefreshCw } from "lucide-react";
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
    icon?: React.ElementType;
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
    isRefreshing,
    icon: IconComponent
}: PageHeaderProps) => {
    return (
        <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "start", lg: "center" }}
            mb={4}
            p={6}
            // bg="app.card.bg"
            backdropFilter="blur(16px)"
            // border="1px solid"
            borderColor="app.card.border"
            borderRadius="2xl"
            // boxShadow="sm"
            gap={6}
            w="full"
            position="relative"
            overflow="hidden"
        >
            {/* Background Decorative SVG */}
            <Box
                position="absolute"
                right="-20px"
                top="-20px"
                color="app.text.accent/5"
                zIndex={0}
                pointerEvents="none"
            >
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" strokeDasharray="40 20" />
                    <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="10" strokeDasharray="10 5" />
                </svg>
            </Box>

            <Flex align="center" gap={2} flex="1" zIndex={1}>
                {IconComponent && (
                    <Flex
                        align="center"
                        justify="center"
                        w="40px"
                        h="40px"
                        borderRadius="xl"
                        bgGradient="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                        boxShadow="0 8px 24px -4px rgba(99,102,241,0.4)"
                        color="white"
                        flexShrink={0}
                        position="relative"
                        overflow="hidden"
                    >
                        <Box
                            position="absolute"
                            top="2px"
                            left="4px"
                            right="4px"
                            h="6px"
                            borderRadius="full"
                            bg="rgba(255,255,255,0.22)"
                        />
                        <IconComponent size={20} strokeWidth={2.5} style={{ zIndex: 1 }} />
                    </Flex>
                )}
                <Stack gap={1.5}>
                    <Heading
                    // size="3xl"
                    fontWeight="900"
                    letterSpacing="tight"
                    color="app.text.primary"
                    lineHeight="1"
                >
                    {title}
                </Heading>
                {subtitle && (
                    <Text fontSize="md" fontWeight="600" color="app.text.muted" maxW="600px">
                        {subtitle}
                    </Text>
                )}
                </Stack>
            </Flex>

            <Flex 
                align="center" 
                gap={3} 
                flexWrap="wrap" 
                justify={{ base: "flex-start", lg: "flex-end" }} 
                w={{ base: "full", lg: "auto" }}
                zIndex={1}
            >
                {/* Search Bar */}
                {onSearchChange && (
                    <Box position="relative" w={{ base: "full", md: "300px" }}>
                        <Box position="absolute" left={3.5} top="50%" transform="translateY(-50%)" color="app.text.muted" zIndex={1}>
                            <Search size={18} />
                        </Box>
                        <Input
                            placeholder={searchPlaceholder || "Search..."}
                            value={searchValue || ""}
                            onChange={(e) => onSearchChange(e.target.value)}
                            pl={11}
                            h="46px"
                            bg="app.card.bg"
                            border="1px solid"
                            borderColor="app.card.border"
                            borderRadius="lg"
                            boxShadow="xs"
                            fontWeight="600"
                            _hover={{ borderColor: "app.text.accent" }}
                            _focus={{ 
                                borderColor: "app.text.accent", 
                                boxShadow: "0 0 0 1px var(--chakra-colors-app-text-accent)",
                                bg: "app.input.bg"
                            }}
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
                        variant="outline"
                        h="46px"
                        w="46px"
                        borderRadius="lg"
                        borderColor="app.card.border"
                        color="app.text.muted"
                        _hover={{ color: "app.text.primary", bg: "app.card.bg", borderColor: "app.text.accent" }}
                    >
                        <RefreshCw size={18} className={isRefreshing ? "spin-animation" : ""} />
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
