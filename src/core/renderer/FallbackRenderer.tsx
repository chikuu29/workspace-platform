import React, { useMemo } from "react";
import {
    Box,
    VStack,
    Heading,
    Text,
    Icon,
    Badge,
    Code,
    Button,
    HStack as ChakraHStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { AlertTriangle, FileSearch, Settings, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface FallbackRendererProps {
    reason: "MISSING_UI_TYPE" | "INVALID_TYPE" | "COMPONENT_NOT_FOUND" | "TEMPLATE_NOT_FOUND" | "UNAUTHORIZED" | "PBAC_UNAUTHORIZED";
    type?: string;
    config?: any;
}

const FallbackRenderer: React.FC<FallbackRendererProps> = ({ reason, type, config }) => {
    const navigate = useNavigate();
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
                    icon: Settings,
                    badge: "Config Error"
                };
            case "INVALID_TYPE":
                return {
                    title: "Invalid View Type",
                    description: "The specified 'UI_TYPE.type' is empty or invalid.",
                    icon: AlertTriangle,
                    badge: "Definition Error"
                };
            case "COMPONENT_NOT_FOUND":
                return {
                    title: "Unknown View Component",
                    description: `The component type "${type}" is not registered in ViewRegistry.`,
                    icon: FileSearch,
                    badge: "Registry Error"
                };
            case "TEMPLATE_NOT_FOUND":
                return {
                    title: "Template Not Found",
                    description: type
                        ? `Could not load template "${type}". Please check the template name and try again.`
                        : "The requested template could not be found or loaded.",
                    icon: FileSearch,
                    badge: "Template Error"
                };
            case "UNAUTHORIZED":
                return {
                    title: "Access Denied",
                    description: type 
                        ? `You are not authorized to access "${type}". Please contact your administrator.`
                        : "You do not have permission to view this resource or organization data.",
                    icon: AlertTriangle,
                    badge: "Security Block"
                };
            case "PBAC_UNAUTHORIZED":
                return {
                    title: "Policy Access Denied",
                    description: "Your assigned policies do not grant you access to this specific view or page.",
                    icon: AlertTriangle,
                    badge: "PBAC Block"
                };
            default:
                return {
                    title: "System Error",
                    description: "An unexpected rendering error occurred.",
                    icon: AlertTriangle,
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
                bg={"app.card.bg"}
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

                    <ChakraHStack gap="4" width="full" justify="center" pt="2">
                        <Button 
                            variant="subtle" 
                            colorPalette="gray" 
                            size="md" 
                            borderRadius="xl"
                            onClick={() => navigate(-1)}
                            _hover={{ transform: "translateX(-2px)" }}
                            transition="all 0.2s"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </Button>
                        <Button 
                            variant="solid" 
                            colorPalette="orange" 
                            size="md" 
                            borderRadius="xl"
                            onClick={() => navigate("/myApps")}
                            _hover={{ transform: "scale(1.02)", boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.4)" }}
                            transition="all 0.2s"
                        >
                            <Home size={16} />
                            Return Home
                        </Button>
                    </ChakraHStack>
                </VStack>
            </Box>
        </motion.div>
    );
};

export default React.memo(FallbackRenderer);
