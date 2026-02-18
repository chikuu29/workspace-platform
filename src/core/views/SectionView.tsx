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
import {
    RadioCardRoot,
    RadioCardItem,
    RadioCardLabel,
} from "@/components/ui/radio-card";
import { Field } from "@/components/ui/field";
import {
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useColorModeValue } from "@/components/ui/color-mode";
import { createListCollection } from "@chakra-ui/react";

// Static collections moved outside to prevent recreation
const genderCollection = createListCollection({
    items: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ],
});

const trainerCollection = createListCollection({
    items: [
        { label: "Sarah Connor", value: "1" },
        { label: "Mike Mentzer", value: "2" },
        { label: "Dorian Yates", value: "3" },
    ],
});

// Memoized Individual Widget Renderer
const WidgetRenderer = memo(({ widget, value, onChange }: any) => {
    // console.log(`Rendering Widget: ${widget.name}`);

    switch (widget.widget) {
        case "textField":
            return (
                <Field label={widget.text} required={widget.required}>
                    <Input
                        placeholder={widget.description}
                        value={value || ""}
                        onChange={(e) => onChange(widget.name, e.target.value)}
                    />
                </Field>
            );
        case "selectField":
            // Fallback to genderCollection for demo if not provided
            const collection = widget.name === "gender" ? genderCollection : trainerCollection;
            return (
                <Field label={widget.text} required={widget.required}>
                    <SelectRoot
                        size="md"
                        collection={collection}
                        value={[value]}
                        onValueChange={(e) => onChange(widget.name, e.value[0])}
                    >
                        <SelectTrigger>
                            <SelectValueText placeholder={widget.description} />
                        </SelectTrigger>
                        <SelectContent>
                            {collection.items.map((item) => (
                                <SelectItem item={item} key={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                </Field>
            );
        default:
            return null;
    }
});

// Memoized Step Content Renderer
const StepContentRenderer = memo(({ widgets, formData, updateField }: any) => {
    // console.log("Rendering StepContentRenderer");
    return (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6">
            {widgets.map((widget: any) => (
                <WidgetRenderer
                    key={widget.name}
                    widget={widget}
                    value={formData[widget.name]}
                    onChange={updateField}
                />
            ))}
        </Grid>
    );
});

const SectionView = ({ config }: any) => {
    const sidebarBg = useColorModeValue("white", "gray.950");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const separatorColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const successBg = useColorModeValue("green.50", "green.900/30");

    const [step, setStep] = React.useState(0);

    // Dynamic sections from config
    const sections = useMemo(() => {
        return config?.UI_VIEW?.schema?.sections || [];
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

    // Initialize formData dynamically
    const initialFormData = useMemo(() => {
        const data: any = {};
        sections.forEach((section: any) => {
            section.tabs?.forEach((tab: any) => {
                tab.widgets?.forEach((widget: any) => {
                    data[widget.name] = "";
                });
            });
        });
        return data;
    }, [sections]);

    const [formData, setFormData] = React.useState(initialFormData);

    const updateField = useCallback((field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    }, []);

    const handleStepChange = useCallback((e: any) => {
        setStep(e.step);
    }, []);

    const handleReset = useCallback(() => {
        setStep(0);
        setFormData(initialFormData);
    }, [initialFormData]);

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
                                '-ms-overflow-style': 'none',
                                'scrollbar-width': 'none',
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
                            {sections.map((section: any, index: number) => (
                                <StepsContent key={index} index={index}>
                                    <Stack gap="6">
                                        <HStack gap="2" pb="4" borderBottom="1px solid" borderColor={separatorColor}>
                                            <Icon as={getIcon(section.iconName)} color="blue.500" boxSize="5" />
                                            <Heading size="md" fontWeight="bold">{section.description}</Heading>
                                        </HStack>

                                        {/* Render widgets from the first tab (skipping tabs layer) */}
                                        <StepContentRenderer
                                            widgets={section.tabs?.[0]?.widgets || []}
                                            formData={formData}
                                            updateField={updateField}
                                        />
                                    </Stack>
                                </StepsContent>
                            ))}

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
                                            <Button variant="brand" size="lg" px={{ base: "8", md: "12" }} shadow="lg" onClick={() => setStep(sections.length)} w={{ base: "full", sm: "auto" }}>
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
