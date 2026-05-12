import { createSystem, defaultConfig } from "@chakra-ui/react"
import { colors, semanticTokens } from "./tokens/colors"
import { recipes } from "./recipes"

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors,
            fonts: {
                body: { value: "Inter, sans-serif" },
                heading: { value: "Inter, sans-serif" },
                mono: { value: "JetBrains Mono, monospace" },
            }
        },
        semanticTokens,
        recipes,
        // textStyles: {
        //     body: {
        //         value: {
        //             fontSize: "sm",
        //             // lineHeight: "tall",
        //         },
        //     },
        // },
    },
    globalCss: {
        "html, body": {
            margin: 0,
            padding: 0,
            color: "text.default",
            bg: "bg.default",

            fontWeight: "700",
            fontFamily: "body",
            "&::-webkit-scrollbar": {
                display: "none",
            },
            "scrollbarWidth": "none",
        },
        "*": {
            "&::-webkit-scrollbar": {
                display: "none",
            },
            "scrollbarWidth": "none",
        }
    }
})

export default system
