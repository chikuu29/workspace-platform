import React, { useMemo } from "react";
import {
    Box,
    VStack,
    Heading,
    Text,
    Icon,
    Badge,
    Code,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuTriangleAlert, LuFileSearch, LuSettings } from "react-icons/lu";
import { motion } from "framer-motion";

interface FallbackRendererProps {
    reason: "MISSING_UI_TYPE" | "INVALID_TYPE" | "COMPONENT_NOT_FOUND" | "TEMPLATE_NOT_FOUND";
    type?: string;
    config?: any;
}

const FallbackRenderer: React.FC<FallbackRendererProps> = ({ reason, type, config }) => {
    // Premium theme colors
    const bg = useColorModeValue("white", "rgba(15, 23, 42, 0.4)");
    const borderColor = useColorModeValue("orange.200", "rgba(245, 158, 11, 0.2)");
    const iconColor = useColorModeValue("orange.500", "orange.400");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const mutedColor = useColorModeValue("gray.500", "whiteAlpha.600");

    const content = useMemo(() => {
        switch (reason) {
            case "MISSING_UI_TYPE":
                return {
                    title: "Missing Configuration",
                    description: "The renderer found no 'UI_TYPE' defined in the configuration object.",
                    icon: LuSettings,
                    badge: "Config Error"
                };
            case "INVALID_TYPE":
                return {
                    title: "Invalid View Type",
                    description: "The specified 'UI_TYPE.type' is empty or invalid.",
                    icon: LuTriangleAlert,
                    badge: "Definition Error"
                };
            case "COMPONENT_NOT_FOUND":
                return {
                    title: "Unknown View Component",
                    description: `The component type "${type}" is not registered in ViewRegistry.`,
                    icon: LuFileSearch,
                    badge: "Registry Error"
                };
            case "TEMPLATE_NOT_FOUND":
                return {
                    title: "Template Not Found",
                    description: type
                        ? `Could not load template "${type}". Please check the template name and try again.`
                        : "The requested template could not be found or loaded.",
                    icon: LuFileSearch,
                    badge: "Template Error"
                };
            default:
                return {
                    title: "System Error",
                    description: "An unexpected rendering error occurred.",
                    icon: LuTriangleAlert,
                    badge: "Unknown Error"
                };
        }
    }, [reason, type]);

    const { title, description, icon, badge } = content;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Box
                p="10"
                bg={bg}
                borderRadius="3xl"
                border="2px dashed"
                borderColor={borderColor}
                backdropFilter="blur(10px)"
                // maxW="xl"
                mx="auto"
                my="10"
                textAlign="center"
                position="relative"
                overflow="hidden"
                _before={{
                    content: '""',
                    position: "absolute",
                    top: "-20%",
                    left: "-20%",
                    width: "50%",
                    height: "50%",
                    bg: "orange.400",
                    filter: "blur(100px)",
                    opacity: 0.05,
                    zIndex: -1,
                }}
            >
                <VStack gap="6" >
                    <Badge
                        colorPalette="orange"
                        variant="subtle"
                        px="3"
                        py="1"
                        rounded="full"
                        textTransform="uppercase"
                        fontSize="xs"
                        letterSpacing="widest"
                    >
                        {badge}
                    </Badge>

                    <Box
                        p="5"
                        bg="orange.100/10"
                        rounded="2xl"
                        border="1px solid"
                        borderColor="orange.200/20"
                    >
                        <Icon as={icon} size="xl" color={iconColor} />
                    </Box>

                    <VStack gap="2">
                        <Heading size="lg" fontWeight="extrabold" color={textColor}>
                            {title}
                        </Heading>
                        <Text color={mutedColor} fontSize="md">
                            {description}
                        </Text>
                    </VStack>

                    {config && (
                        <Box
                            w="full"
                            p="4"
                            bg="blackAlpha.50"
                            rounded="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            textAlign="left"
                        >
                            <Text fontSize="xs" fontWeight="bold" mb="2" color={mutedColor} textTransform="uppercase">
                                Context
                            </Text>
                            <Code fontSize="xs" bg="transparent" display="block" whiteSpace="pre-wrap">
                                {JSON.stringify(config, null, 2)}
                            </Code>
                        </Box>
                    )}
                </VStack>
            </Box>
        </motion.div>
    );
};

export default React.memo(FallbackRenderer);
