import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
    base: {

        borderRadius: "md",

    },
    variants: {
        variant: {
            solid: {
                bg: "brand.500",
                color: "white",
                _hover: {
                    bg: "brand.600",
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                },
                _active: {
                    bg: "brand.700",
                    transform: "translateY(0)",
                },
            },
            outline: {
                border: "1px solid",
                borderColor: "brand.500",
                color: "brand.500",
                bg: "transparent",
                _hover: {
                    bg: "brand.50",
                    borderColor: "brand.600",
                },
            },
            ghost: {
                bg: "transparent",
                color: "brand.500",
                _hover: {
                    bg: "brand.50",
                },
            },
            brand: {
                // bg: { _light: "brand.500", _dark: "brand.400" },
                // color: "white",

                // borderRadius: "full",
                // boxShadow: "0 4px 15px 0 rgba(111, 93, 255, 0.4)",
                _hover: {
                    // bg: { _light: "brand.600", _dark: "brand.500" },
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px 0 rgba(111, 93, 255, 0.5)",
                },
                _active: {
                    transform: "translateY(0)",
                },
            }
        },
        size: {
            xs: {
                h: "8",
                minW: "8",
                fontSize: "xs",
                px: "3",
            },
            sm: {
                h: "9",
                minW: "9",
                fontSize: "sm",
                px: "4",
            },
            md: {
                h: "11",
                minW: "11",
                fontSize: "md",
                px: "6",
            },
            lg: {
                h: "14",
                minW: "14",
                fontSize: "lg",
                px: "8",
            },
        },
    },
    defaultVariants: {
        variant: "solid",
        size: "md",
    },
})
