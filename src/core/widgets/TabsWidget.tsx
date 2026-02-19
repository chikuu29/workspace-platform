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
    const activeColor = "#3B82F6"; // Vibrant blue
    const inactiveColor = useColorModeValue("gray.500", "whiteAlpha.600");
    const textColor = useColorModeValue("gray.800", "white");
    const mutedTextColor = useColorModeValue("gray.600", "whiteAlpha.600");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const headerBg = useColorModeValue("gray.50/50", "white/5");

    // Use the first tab title as default value if not provided
    const defaultTabValue = defaultValue || tabs[0].title;

    // Create a unique key for the tabs set to force re-mounting (and thus selection reset) when the tabs change
    const tabsKey = React.useMemo(() => tabs.map(t => t.title).join('-'), [tabs]);

    return (
        <TabsRoot key={tabsKey} defaultValue={defaultTabValue} variant="plain" w="full">
            <Box borderBottom="1px solid" borderColor={borderColor} bg={headerBg} px={{ base: "6", md: "12" }} p={4}>
                <TabsList gap="16" borderBottom="none">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.title}
                            value={tab.title}
                            py="5"
                            px="4"
                            fontSize="sm"
                            fontWeight="bold"
                            color={inactiveColor}
                            _selected={{ color: activeColor }}
                            _hover={{ color: activeColor }}
                            transition="all 0.2s"
                            position="relative"
                        >
                            <HStack gap="2">
                                {/* {tab.iconName && (
                                    <Box boxSize="4" color={useColorModeValue("gray.400", "whiteAlpha.400")}>
                                        <AsyncLoadIcon iconName={tab.iconName} />
                                    </Box>
                                )} */}
                                <Text>{tab.title}</Text>
                            </HStack>
                        </TabsTrigger>
                    ))}
                    <TabsIndicator
                        height="4px"
                        bg={activeColor}
                        roundedTop="full"
                        bottom="0"
                    />
                </TabsList>
            </Box>

            {tabs.map((tab) => (
                <TabsContent key={tab.title} value={tab.title} px={{ base: "6", md: "12" }} py="10" position="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab.title}
                            initial={{ opacity: 0, y: -25, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <VStack align="start" gap="2" mb="8">
                                <Heading size="xl" fontWeight="bold" color={textColor}>
                                    {tab.headerTitle || `Configure ${tab.title}`}
                                </Heading>
                                <Text color={mutedTextColor} fontSize="md">
                                    {tab.description || "Define the core parameters for your initiatives."}
                                </Text>
                            </VStack>
                            <RunTimeWidgetRender
                                configs={tab.widgets}
                                {...rest}
                            />
                        </motion.div>
                    </AnimatePresence>
                </TabsContent>
            ))}
        </TabsRoot>
    );
};

export default TabsWidget;
