import React from "react";
import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import RunTimeWidgetRender from "./RunTimeWidget";
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
 * Renders dynamic tabs, each containing its own nested widgets.
 */
const TabsWidget: React.FC<TabsWidgetProps> = ({ tabs, defaultValue, ...rest }) => {
    if (!tabs || tabs.length === 0) return null;

    // Use the first tab title as default value if not provided
    const defaultTabValue = defaultValue || tabs[0].title;

    return (
        <TabsRoot defaultValue={defaultTabValue} variant="subtle" colorPalette="blue" >
            <TabsList
                bg="bg.muted"
                p="1"
                borderRadius="lg"
                display="flex"
                w="fit-content"
                overflowX="auto"
                css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.title}
                        value={tab.title}
                        py="2"
                        px="6"
                        borderRadius="md"
                        _selected={{
                            bg: "bg.panel",
                            shadow: "sm",
                        }}
                    >
                        <HStack gap="2">
                            {tab.iconName && (
                                <Box boxSize="4">
                                    <AsyncLoadIcon iconName={tab.iconName} />
                                </Box>
                            )}
                            <Text fontSize="sm" fontWeight="semibold">{tab.title}</Text>
                        </HStack>
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map((tab) => (
                <TabsContent key={tab.title} value={tab.title} mt="4">
                    <RunTimeWidgetRender
                        configs={tab.widgets}
                        {...rest}
                    />
                </TabsContent>
            ))}
        </TabsRoot>
    );
};

export default TabsWidget;
