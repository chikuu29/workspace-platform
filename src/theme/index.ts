import { createSystem, defaultConfig } from "@chakra-ui/react"
import { colors } from "./tokens/colors"
import { recipes } from "./recipes"

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors
        },
        recipes,
        textStyles: {},
    },
    globalCss: {
        "html, body": {
            margin: 0,
            padding: 0,
        },
    }
})

export default system
