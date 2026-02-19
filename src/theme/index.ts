import { createSystem, defaultConfig } from "@chakra-ui/react"
import { colors, semanticTokens } from "./tokens/colors"
import { recipes } from "./recipes"

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors
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

            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
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
