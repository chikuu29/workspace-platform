import React from "react";
import { Box, HStack, Text, VStack, Heading } from "@chakra-ui/react";
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion, AnimatePresence } from "framer-motion";
import RunTimeWidgetRender from "../renderer/RunTimeWidget";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";

interface TabConfig {
    title: string;
    description?: string;
    iconName?: string;
    widgets: any[];
    [key: string]: any;
}

interface TabsWidgetProps {
    tabs: TabConfig[];
    defaultValue?: string;
    [key: string]: any;
}

/**
 * TabsWidget
 * Renders dynamic tabs with a premium, modern design matching the Project Wizard aesthetic.
 */
const TabsWidget: React.FC<TabsWidgetProps> = ({ tabs, defaultValue, ...rest }) => {
    if (!tabs || tabs.length === 0) return null;

    // Premium adaptive theme colors
    const activeColor = "#c799ff"; // Modern purple accent
    const inactiveColor = useColorModeValue("gray.500", "whiteAlpha.600");
    const textColor = useColorModeValue("gray.900", "white");
    const mutedTextColor = useColorModeValue("gray.600", "gray.400");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
    const headerBg = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(20, 20, 25, 0.7)");

    // Use the first tab title as default value if not provided
    const defaultTabValue = defaultValue || tabs[0].title;

    // Create a unique key for the tabs set to force re-mounting (and thus selection reset) when the tabs change
    const tabsKey = React.useMemo(() => tabs.map(t => t.title).join('-'), [tabs]);

    return (
        <TabsRoot key={tabsKey} defaultValue={defaultTabValue} variant="plain" w="full">
            <Box
                position="sticky"
                top="0"
                zIndex="sticky"
                backdropFilter="blur(16px)"
                bg={"app.card.bg"}
                borderBottom="1px solid"
                borderColor={borderColor}
                px={{ base: "4", md: "12" }}
                transition="all 0.3s ease"
            >
                <TabsList
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={{ base: "4", md: "8" }}
                    borderBottom="none"
                    overflowX="auto"
                    py="2"
                    css={{
                        "&::-webkit-scrollbar": { display: "none" },
                        "msOverflowStyle": "none",
                        "scrollbarWidth": "none",
                    }}
                >
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.title}
                            value={tab.title}
                            py="4"
                            px="2"
                            fontSize="sm"
                            fontWeight="semibold"
                            color={inactiveColor}
                            whiteSpace="nowrap"
                            flexShrink={0}
                            _selected={{
                                color: textColor,
                                _after: {
                                    content: '""',
                                    position: "absolute",
                                    bottom: "-2px",
                                    left: "0",
                                    right: "0",
                                    height: "3px",
                                    bg: activeColor,
                                    borderRadius: "full",
                                    boxShadow: `0 0 12px ${activeColor}`,
                                }
                            }}
                            _hover={{
                                color: activeColor,
                                transform: "translateY(-1px)"
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                        >
                            <HStack gap="2">
                                {tab.iconName && (
                                    <Box boxSize="4" opacity="0.8">
                                        <AsyncLoadIcon iconName={tab.iconName} />
                                    </Box>
                                )}
                                <Text>{tab.title}</Text>
                            </HStack>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Box>

            {tabs.map((tab) => (
                <TabsContent
                    key={tab.title}
                    value={tab.title}
                    px={{ base: "6", md: "12" }}
                    py={{ base: "8", md: "12" }}
                    position="relative"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab.title}
                            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                            transition={{
                                duration: 0.5,
                                ease: [0.19, 1, 0.22, 1]
                            }}
                        >
                            <VStack align="start" gap="2" mb="12">
                                <Heading
                                    size="2xl"
                                    fontWeight="extrabold"
                                    color={textColor}
                                    letterSpacing="tight"
                                >
                                    {tab.headerTitle || tab.title}
                                </Heading>
                                <Text color={mutedTextColor} fontSize="lg" maxW="2xl" lineHeight="tall">
                                    {tab.description || "Refine and manage your workspace settings and configurations."}
                                </Text>
                            </VStack>

                            <Box
                                bg={useColorModeValue("whiteAlpha.500", "whiteAlpha.50")}
                                borderRadius="2xl"
                                p={{ base: "4", md: "8" }}
                                border="1px solid"
                                borderColor={borderColor}
                                shadow="sm"
                            >
                                <RunTimeWidgetRender
                                    configs={tab.widgets}
                                    {...rest}
                                />
                            </Box>
                        </motion.div>
                    </AnimatePresence>
                </TabsContent>
            ))}
        </TabsRoot>
    );
};

export default TabsWidget;
