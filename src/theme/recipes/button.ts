import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
    base: {
        display: "inline-flex",
        appearance: "none",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        position: "relative",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        outline: "none",
        fontWeight: "600",
        lineHeight: "1.2",
        borderRadius: "xl",
        transitionProperty: "common",
        transitionDuration: "moderate",
        _focusVisible: {
            outline: "2px solid",
            outlineColor: "brand.500",
            outlineOffset: "2px",
        },
        _disabled: {
            opacity: 0.5,
            cursor: "not-allowed",
            boxShadow: "none",
        },
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
            premium: {
                bgGradient: "to-r",
                gradientFrom: "brand.400",
                gradientTo: "blue.500",
                color: "white",
                boxShadow: "0 4px 15px 0 rgba(116, 79, 247, 0.4)",
                _hover: {
                    gradientFrom: "brand.500",
                    gradientTo: "blue.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px 0 rgba(116, 79, 247, 0.5)",
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
