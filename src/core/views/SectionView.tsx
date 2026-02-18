import React, { useMemo, useCallback, memo } from "react";
import {
    Box,
    Flex,
    Heading,
    Icon,
    Stack,
    Text,
    VStack,
    HStack,
    Grid,
    Input,
    Button,
    Badge,
} from "@chakra-ui/react";
import {
    MdBadge,
    MdCardMembership,
    MdAccountBalanceWallet,
} from "react-icons/md";
import {
    StepsRoot,
    StepsList,
    StepsItem,
    StepsContent,
    StepsNextTrigger,
    StepsPrevTrigger,
} from "@/components/ui/steps";
import { useColorModeValue } from "@/components/ui/color-mode";
import { FormProvider, useForm } from "react-hook-form";
import RunTimeWidgetRender from "../widgets/RunTimeWidget";
import "../widgets"; // Ensure all widgets are registered
import { ScriptProvider } from "@/features/ui/components/contexts/ScriptProvider";

// Gender and Trainer collections are no longer needed here as they are handled by specialized widgets or the template

const SectionView = ({ config }: any) => {
    const sidebarBg = useColorModeValue("white", "gray.950");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const separatorColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const successBg = useColorModeValue("green.50", "green.900/30");

    const [step, setStep] = React.useState(0);

    const sections = useMemo(() => {
        return config?.UI_VIEW?.schema?.sections || [];
    }, [config]);

    const scriptFiles = useMemo(() => {
        return config?.scripts?.files || [];
    }, [config]);


    // Icon mapping
    const getIcon = (name: string) => {
        switch (name) {
            case "MdBadge": return MdBadge;
            case "MdCardMembership": return MdCardMembership;
            case "MdAccountBalanceWallet": return MdAccountBalanceWallet;
            default: return MdBadge;
        }
    };

    const methods = useForm({
        mode: "onChange",
        defaultValues: {},
    });

    const handleStepChange = useCallback((e: any) => {
        setStep(e.step);
    }, []);

    const handleReset = useCallback(() => {
        setStep(0);
        methods.reset();
    }, [methods]);

    const onFormSubmit = (data: any) => {
        console.log("SectionView Form Submitted:", data);
        setStep(sections.length);
    };

    if (!sections.length) return null;

    return (
        <Box>
            <Box mx="auto" px={{ base: "4", md: "8" }}>
                <VStack mb={{ base: "8", md: "16" }} textAlign="center" gap="4">
                    <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                        {config.UI_TYPE?.title || "Registration Flow"}
                    </Badge>
                    <VStack gap="1">
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="extrabold" letterSpacing="tight">
                            {config.UI_TYPE?.title || "Member Onboarding"}
                        </Heading>
                        <Text color="fg.muted" fontSize="lg" maxW="2xl" mx="auto">
                            {step === sections.length
                                ? "Registration complete! Thank you."
                                : config.UI_TYPE?.description || "Fill in the details below."}
                        </Text>
                    </VStack>
                </VStack>

                <StepsRoot step={step} onStepChange={handleStepChange} count={sections.length} variant="subtle" colorPalette="blue" >
                    <Box
                        bg={sidebarBg}
                        rounded="2xl"
                        shadow="xl"
                        border="1px solid"
                        borderColor={borderColor}
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                    >
                        {/* Header Section: StepsList */}
                        <Box
                            borderBottom="1px solid"
                            borderColor={separatorColor}
                            bg={useColorModeValue("gray.50/50", "whiteAlpha.100")}
                            overflowX="auto"
                            css={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            <StepsList
                                gap="0"
                                p="0"
                                borderBottom="none"
                                flexWrap="nowrap"
                                minW="max-content"
                            >
                                {sections.map((section: any, index: number) => (
                                    <StepsItem
                                        key={index}
                                        index={index}
                                        title={section.title}
                                        icon={<Icon as={getIcon(section.iconName)} />}
                                        flexShrink={0}
                                        triggerProps={{
                                            cursor: "pointer",
                                            _hover: { bg: hoverBg },
                                            px: { base: "6", md: "8" },
                                            py: "4",
                                            rounded: "none",
                                        }}
                                    />
                                ))}
                            </StepsList>
                        </Box>

                        {/* Middle Section: Content */}
                        <Box p={{ base: "6", md: "10" }} flex="1">
                            <FormProvider {...methods}>
                                <form onSubmit={methods.handleSubmit(onFormSubmit)}>
                                    <ScriptProvider scriptFiles={scriptFiles}>
                                        {sections.map((section: any, index: number) => (
                                            <StepsContent key={index} index={index}>
                                                <Stack gap="6">
                                                    {/* <HStack gap="2" pb="4" borderBottom="1px solid" borderColor={separatorColor}>
                                                    <Icon as={getIcon(section.iconName)} color="blue.500" boxSize="5" />
                                                    <Heading size="md" fontWeight="bold">{section.description}</Heading>
                                                </HStack> */}

                                                    {/* Render tabs/widgets dynamically using RunTimeWidgetRender */}
                                                    <RunTimeWidgetRender
                                                        configs={section.widgets}
                                                        tabs={section.tabs}
                                                    />
                                                </Stack>
                                            </StepsContent>
                                        ))}
                                    </ScriptProvider>
                                </form>
                            </FormProvider>

                            {/* Success State */}
                            {step === sections.length && (
                                <VStack gap="6" py="10">
                                    <Box
                                        w="20"
                                        h="20"
                                        rounded="full"
                                        bg={successBg}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="green.500"
                                    >
                                        <Icon as={MdBadge} boxSize="10" />
                                    </Box>
                                    <VStack gap="2">
                                        <Heading size="lg">Success!</Heading>
                                        <Text color="fg.muted">Process completed successfully.</Text>
                                    </VStack>
                                    <Button variant="brand" onClick={handleReset}>
                                        Restart
                                    </Button>
                                </VStack>
                            )}
                        </Box>

                        {/* Footer Section: Action Buttons */}
                        {step < sections.length && (
                            <Box p="4" borderTop="1px solid" borderColor={separatorColor} bg={useColorModeValue("white", "gray.950")}>
                                <Flex direction={{ base: "column-reverse", sm: "row" }} justify="space-between" align="center" gap="4">
                                    <Box w={{ base: "full", sm: "auto" }}>
                                        {step > 0 && (
                                            <StepsPrevTrigger asChild>
                                                <Button variant="ghost" size="lg" px={{ base: "4", md: "8" }} w={{ base: "full", sm: "auto" }}>
                                                    Back
                                                </Button>
                                            </StepsPrevTrigger>
                                        )}
                                    </Box>
                                    <HStack gap="4" w={{ base: "full", sm: "auto" }} justify={{ base: "space-between", sm: "flex-end" }}>
                                        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                                            Step {step + 1} of {sections.length}
                                        </Text>
                                        {step < sections.length - 1 ? (
                                            <StepsNextTrigger asChild>
                                                <Button variant="brand" size="lg" px={{ base: "8", md: "12" }} shadow="md" w={{ base: "full", sm: "auto" }}>
                                                    Continue
                                                </Button>
                                            </StepsNextTrigger>
                                        ) : (
                                            <Button
                                                variant="brand"
                                                size="lg"
                                                px={{ base: "8", md: "12" }}
                                                shadow="lg"
                                                onClick={methods.handleSubmit(onFormSubmit)}
                                                w={{ base: "full", sm: "auto" }}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                    </HStack>
                                </Flex>
                            </Box>
                        )}
                    </Box>
                </StepsRoot>

                <Text mt="8" textAlign="center" fontSize="xs" color="fg.muted">
                    Security Policy: All data is encrypted and handled securely.
                </Text>
            </Box>
        </Box>
    );
};

export default SectionView;
