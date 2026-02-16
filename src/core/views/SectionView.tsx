import { useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Icon,
    IconButton,
    Stack,
    Text,
    VStack,
    HStack,
    Grid,
    createListCollection,
    Input,
    Button,
    Badge,
} from "@chakra-ui/react";
import {
    MdBadge,
    MdCardMembership,
    MdAccountBalanceWallet,
    MdAddAPhoto,
    MdPerson,
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
const SectionView = () => {
    const sidebarBg = useColorModeValue("white", "gray.950");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const sectionBg = useColorModeValue("gray.50/50", "whiteAlpha.50");
    const avatarBg = useColorModeValue("white", "gray.800");
    const separatorColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const successBg = useColorModeValue("green.50", "green.900/30");

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        plan: "standard",
        startDate: "",
        trainer: "",
    });

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

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Box>
            <Box mx="auto" px={{ base: "4", md: "8" }}>
                <VStack mb={{ base: "8", md: "16" }} textAlign="center" gap="4">
                    <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                        Registration Flow
                    </Badge>
                    <VStack gap="1">
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="extrabold" letterSpacing="tight">
                            Member <Text as="span" color="blue.500">Onboarding</Text>
                        </Heading>
                        <Text color="fg.muted" fontSize="lg" maxW="2xl" mx="auto">
                            {step === 3
                                ? "Registration complete! Welcome to GymFlow Pro."
                                : "Fill in the details below to register a new member into our fitness community."}
                        </Text>
                    </VStack>
                </VStack>

                <StepsRoot step={step} onStepChange={(e) => setStep(e.step)} count={3} variant="subtle" colorPalette="blue" >
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
                        {/* Header Section: StepsList (Horizontal Slider on Mobile) */}
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
                                <StepsItem
                                    index={0}
                                    title="Personal"
                                    icon={<Icon as={MdBadge} />}
                                    flexShrink={0}
                                    triggerProps={{
                                        cursor: "pointer",
                                        _hover: { bg: hoverBg },
                                        px: { base: "6", md: "8" },
                                        py: "4",
                                        rounded: "none",
                                    }}
                                />
                                <StepsItem
                                    index={1}
                                    title="Membership"
                                    icon={<Icon as={MdCardMembership} />}
                                    flexShrink={0}
                                    triggerProps={{
                                        cursor: "pointer",
                                        _hover: { bg: hoverBg },
                                        px: { base: "6", md: "8" },
                                        py: "4",
                                        rounded: "none",
                                    }}
                                />
                                <StepsItem
                                    index={2}
                                    title="Payment"
                                    icon={<Icon as={MdAccountBalanceWallet} />}
                                    flexShrink={0}
                                    triggerProps={{
                                        cursor: "pointer",
                                        _hover: { bg: hoverBg },
                                        px: { base: "6", md: "8" },
                                        py: "4",
                                        rounded: "none",
                                    }}
                                />
                            </StepsList>
                        </Box>

                        {/* Middle Section: Content */}
                        <Box p={{ base: "6", md: "10" }} flex="1">
                            {/* Step 0: Personal Information */}
                            <StepsContent index={0}>
                                <Stack gap={{ base: "8", md: "12" }}>
                                    {/* Modern Profile Photo Section */}
                                    <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} gap="8" p="6" bg={sectionBg} rounded="2xl" border="1px dashed" borderColor={borderColor}>
                                        <Box position="relative" role="group">
                                            <Box
                                                w="32"
                                                h="32"
                                                rounded="full"
                                                bg={avatarBg}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                shadow="inner"
                                                border="4px solid"
                                                borderColor={avatarBg}
                                                overflow="hidden"
                                                transition="all 0.3s"
                                                _groupHover={{ shadow: "md", transform: "scale(1.02)" }}
                                            >
                                                <Icon as={MdPerson} boxSize="12" color="gray.200" />
                                            </Box>
                                            <IconButton
                                                position="absolute"
                                                bottom="0"
                                                right="0"
                                                variant="brand"
                                                rounded="full"
                                                shadow="xl"
                                                size="sm"
                                                border="3px solid"
                                                borderColor={avatarBg}
                                                aria-label="Add Photo"
                                            >
                                                <Icon as={MdAddAPhoto} />
                                            </IconButton>
                                        </Box>
                                        <Box textAlign={{ base: "center", md: "left" }} w={{ base: "full", md: "auto" }}>
                                            <Heading size="md" mb="1">Profile Photo</Heading>
                                            <Text fontSize="sm" color="fg.muted" mb="4">
                                                Upload a high-quality photo to help us identify the member.
                                            </Text>
                                            <HStack gap="3" justify={{ base: "center", md: "flex-start" }}>
                                                <Button size="sm" variant="outline" bg={avatarBg}>Upload New</Button>
                                                <Button size="sm" variant="ghost" colorPalette="red">Remove</Button>
                                            </HStack>
                                            <Text fontSize="10px" color="fg.subtle" mt="3" textTransform="uppercase" letterSpacing="wider">
                                                JPG, PNG or GIF • Max 2MB
                                            </Text>
                                        </Box>
                                    </Flex>

                                    <Stack gap="6">
                                        <HStack gap="2" pb="4" borderBottom="1px solid" borderColor={separatorColor}>
                                            <Icon as={MdBadge} color="blue.500" boxSize="5" />
                                            <Heading size="md" fontWeight="bold">Personal Information</Heading>
                                        </HStack>

                                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6">
                                            <Field label="First Name">
                                                <Input
                                                    placeholder="Enter first name"
                                                    value={formData.firstName}
                                                    onChange={(e) => updateField("firstName", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Last Name">
                                                <Input
                                                    placeholder="Enter last name"
                                                    value={formData.lastName}
                                                    onChange={(e) => updateField("lastName", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Email Address">
                                                <Input
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => updateField("email", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Phone Number">
                                                <Input
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.phone}
                                                    onChange={(e) => updateField("phone", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Date of Birth">
                                                <Input
                                                    type="date"
                                                    value={formData.dob}
                                                    onChange={(e) => updateField("dob", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Gender">
                                                <SelectRoot
                                                    size="md"
                                                    collection={genderCollection}
                                                    value={[formData.gender]}
                                                    onValueChange={(e) => updateField("gender", e.value[0])}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValueText placeholder="Select Gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {genderCollection.items.map((item) => (
                                                            <SelectItem item={item} key={item.value}>
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </SelectRoot>
                                            </Field>
                                        </Grid>
                                    </Stack>
                                </Stack>
                            </StepsContent>

                            {/* Step 1: Membership Details */}
                            <StepsContent index={1}>
                                <Stack gap="8">
                                    <HStack gap="2" pb="4" borderBottom="1px solid" borderColor={separatorColor}>
                                        <Icon as={MdCardMembership} color="blue.500" boxSize="5" />
                                        <Heading size="md" fontWeight="bold">Membership Details</Heading>
                                    </HStack>

                                    <Field label="Membership Plan">
                                        <RadioCardRoot
                                            value={formData.plan}
                                            onValueChange={(e) => updateField("plan", e.value)}
                                            orientation={{ base: "vertical", md: "horizontal" }}
                                        >
                                            <RadioCardLabel />
                                            <Stack direction={{ base: "column", sm: "row" }} gap="4" w="full">
                                                {[
                                                    { value: "basic", label: "Basic", price: "$49/mo" },
                                                    { value: "standard", label: "Standard", price: "$79/mo" },
                                                    { value: "elite", label: "Elite", price: "$129/mo" },
                                                ].map((item) => (
                                                    <RadioCardItem
                                                        key={item.value}
                                                        value={item.value}
                                                        label={item.label}
                                                        description={item.price}
                                                        flex="1"
                                                    />
                                                ))}
                                            </Stack>
                                        </RadioCardRoot>
                                    </Field>

                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6">
                                        <Field label="Start Date">
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => updateField("startDate", e.target.value)}
                                            />
                                        </Field>
                                        <Field label="Trainer Assignment (Optional)">
                                            <SelectRoot
                                                size="md"
                                                collection={trainerCollection}
                                                value={[formData.trainer]}
                                                onValueChange={(e) => updateField("trainer", e.value[0])}
                                            >
                                                <SelectTrigger>
                                                    <SelectValueText placeholder="Select a Trainer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {trainerCollection.items.map((trainer) => (
                                                        <SelectItem item={trainer} key={trainer.value}>
                                                            {trainer.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </SelectRoot>
                                        </Field>
                                    </Grid>
                                </Stack>
                            </StepsContent>

                            {/* Step 2: Payment Preview */}
                            <StepsContent index={2}>
                                <Stack gap="8">
                                    <HStack gap="2" pb="4" borderBottom="1px solid" borderColor={separatorColor}>
                                        <Icon as={MdAccountBalanceWallet} color="blue.500" boxSize="5" />
                                        <Heading size="md" fontWeight="bold">Initial Payment Preview</Heading>
                                    </HStack>
                                    <Box bg={sectionBg} p={{ base: "4", md: "6" }} rounded="lg" border="1px solid" borderColor={borderColor}>
                                        <Stack gap="4">
                                            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} gap="4">
                                                <Box>
                                                    <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase">
                                                        Total Due Today
                                                    </Text>
                                                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">$108.00</Text>
                                                </Box>
                                                <Box textAlign={{ base: "left", sm: "right" }}>
                                                    <Text fontSize="xs" color="fg.muted">Includes $29 enrollment fee</Text>
                                                    <Text fontSize="sm" color="blue.600" fontWeight="bold">
                                                        {formData.plan.toUpperCase()} Plan (Monthly)
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Box borderTop="1px solid" borderColor={separatorColor} pt="4">
                                                <Text fontSize="sm" fontWeight="semibold" mb="2">Summary for {formData.firstName} {formData.lastName}</Text>
                                                <Text fontSize="xs" color="fg.muted">Email: {formData.email}</Text>
                                                <Text fontSize="xs" color="fg.muted">Start Date: {formData.startDate || "Not set"}</Text>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </StepsContent>

                            {/* Success State */}
                            {step === 3 && (
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
                                        <Text color="fg.muted">Member has been successfully registered.</Text>
                                    </VStack>
                                    <Button variant="brand" onClick={() => {
                                        setStep(0);
                                        setFormData({
                                            firstName: "", lastName: "", email: "", phone: "",
                                            dob: "", gender: "", plan: "standard", startDate: "", trainer: ""
                                        });
                                    }}>
                                        Register Another Member
                                    </Button>
                                </VStack>
                            )}
                        </Box>

                        {/* Footer Section: Action Buttons */}
                        {step < 3 && (
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
                                            Step {step + 1} of 3
                                        </Text>
                                        {step < 2 ? (
                                            <StepsNextTrigger asChild>
                                                <Button variant="brand" size="lg" px={{ base: "8", md: "12" }} shadow="md" w={{ base: "full", sm: "auto" }}>
                                                    Continue
                                                </Button>
                                            </StepsNextTrigger>
                                        ) : (
                                            <Button variant="brand" size="lg" px={{ base: "8", md: "12" }} shadow="lg" onClick={() => setStep(3)} w={{ base: "full", sm: "auto" }}>
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
                    All member data is encrypted and stored according to our security policies.
                </Text>
            </Box>
        </Box>
    );
};

export default SectionView;
