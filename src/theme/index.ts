import { createSystem, defaultConfig } from "@chakra-ui/react"
import { colors, semanticTokens as colorSemanticTokens } from "./tokens/colors"
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
        semanticTokens: {
            ...colorSemanticTokens
        },
        recipes,

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
        "button, [role='button'], [data-part='cell-trigger'], [data-part='prev-trigger'], [data-part='next-trigger'], [data-part='trigger']": {
            cursor: "pointer",
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
