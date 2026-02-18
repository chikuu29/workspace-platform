import { Tabs as ChakraTabs } from "@chakra-ui/react"
import * as React from "react"

/**
 * Tabs Component
 * Optimized for Chakra UI v3
 */
export const TabsRoot = ChakraTabs.Root
export const TabsList = ChakraTabs.List
export const TabsTrigger = ChakraTabs.Trigger
export const TabsContent = ChakraTabs.Content
export const TabsIndicator = ChakraTabs.Indicator

export interface TabsInfo {
    title: string
    value: string
    icon?: React.ReactElement
    disabled?: boolean
}

export interface TabsProps extends ChakraTabs.RootProps {
    tabs: TabsInfo[]
    children: React.ReactNode
}

export const TabList = React.forwardRef<HTMLDivElement, ChakraTabs.ListProps>(
    function TabList(props, ref) {
        return (
            <TabsList ref={ref} {...props}>
                {props.children}
                <TabsIndicator />
            </TabsList>
        )
    },
)
