"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ColorModeProvider } from "@/components/ui/color-mode"
import { system } from "@/theme"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "./store"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider store={store}>
            <ChakraProvider value={system}>
                <ColorModeProvider>
                    {children}
                </ColorModeProvider>
            </ChakraProvider>
        </ReduxProvider>
    )
}
