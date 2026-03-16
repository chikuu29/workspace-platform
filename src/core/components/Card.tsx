import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export const Card = React.forwardRef<HTMLDivElement, BoxProps>(
    ({ children, ...props }, ref) => {
        return (
            <Box
                ref={ref}
                bg="app.card.bg"
                borderRadius="2xl"
                p={5}
                border="1px solid"
                borderColor="app.card.border"
                boxShadow="app.shadow.card"
                transition="all 0.2s"
                _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "app.shadow.glass-glow",
                    borderColor: "app.card.borderHover"
                }}
                position="relative"
                overflow="hidden"
                display="flex"
                flexDirection="column"
                gap={4}
                {...props}
            >
                {children}
            </Box>
        );
    }
);

Card.displayName = "Card";
