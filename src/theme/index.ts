import { createSystem, defaultConfig } from "@chakra-ui/react"
import { colors, semanticTokens as colorSemanticTokens } from "./tokens/colors"
import { gradients, semanticTokens as gradientSemanticTokens } from "./tokens/gradients"
import { recipes } from "./recipes"

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors,
            gradients,
            fonts: {
                body: { value: "Inter, sans-serif" },
                heading: { value: "Inter, sans-serif" },
                mono: { value: "JetBrains Mono, monospace" },
            }
        },
        semanticTokens: {
            ...colorSemanticTokens,
            ...gradientSemanticTokens,
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
        "*": {
            "&::-webkit-scrollbar": {
                display: "none",
            },
            "scrollbarWidth": "none",
        }
    }
})

export default system
