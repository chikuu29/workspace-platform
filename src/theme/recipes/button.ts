import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
    base: {
        borderRadius: "md",
        cursor: "pointer",
    },
    variants: {
        variant: {
            solid: {
                _hover: {
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
                _hover: {
                    bg: "brand.50",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px 0 rgba(111, 93, 255, 0.5)",
                },
            },
            brand: {
                color: "brand.500",
                _hover: {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px 0 rgba(111, 93, 255, 0.5)",
                },
                _active: {
                    transform: "translateY(0)",
                },
            },

            // Indigo→violet gradient — use for primary action buttons throughout the app
            action: {
                background: "linear-gradient(to right, #6366f1, #8b5cf6)",
                color: "white",
                fontWeight: "600",
                fontSize: "sm",
                letterSpacing: "0.01em",
                borderRadius: "xl",
                transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                _hover: {
                    background: "linear-gradient(to right, #4f46e5, #7c3aed)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 25px rgba(99,102,241,0.45)",
                },
                _active: { transform: "translateY(0px)" },
                _loading: { opacity: 0.8 },
                _disabled: { opacity: 0.6, cursor: "not-allowed" },
            },

            // Deeper purple gradient — use for high-prominence CTAs (SSO login, register, etc.)
            premium: {
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                fontWeight: "800",
                borderRadius: "2xl",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                _hover: {
                    background: "linear-gradient(135deg, #5a67d8, #6b46c1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 40px -12px rgba(66,42,251,0.4)",
                },
                _active: { transform: "translateY(0)" },
                _loading: { opacity: 0.8 },
                _disabled: { opacity: 0.6, cursor: "not-allowed" },
            },
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
