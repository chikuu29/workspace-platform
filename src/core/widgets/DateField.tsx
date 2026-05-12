import { Box, Flex, Input, Field, Text, HStack, SimpleGrid, IconButton, Center, Button, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { InputGroup } from "../../components/ui/input-group";
import { CloseButton } from "../../components/ui/close-button";
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from "../../components/ui/popover";
import { ruleEngine } from "../engine/logicEngine";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DATEFIELD {
    name: string;
    text: string;
    mandatory: boolean;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    widget?: string;
    oneLiner?: boolean;
    enableClear?: boolean;
    errors: FieldError;
    events?: any;
}

const DateField = ({
    name,
    text,
    description,
    disabled = false,
    hidden = false,
    oneLiner = false,
    mandatory = false,
    enableClear = true,
    events,
    errors,
}: DATEFIELD) => {
    if (hidden) return null;

    const methods = useFormContext();
    const value = useWatch({
        control: methods.control,
        name,
    });

    // Picker State
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"calendar" | "year">("calendar");
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

    // UI Colors
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
    const bg = useColorModeValue("white", "rgba(15, 23, 42, 0.9)");
    const mutedColor = useColorModeValue("gray.500", "whiteAlpha.600");

    // Sync from outer value
    useEffect(() => {
        if (value) {
            const dt = new Date(value);
            if (!isNaN(dt.getTime())) {
                setSelectedDate(dt);
                setViewDate(dt);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    const formattedValue = useMemo(() => {
        if (!selectedDate) return "";
        return selectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, [selectedDate]);

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
        return days;
    }, [viewDate]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        const endYear = currentYear + 50;
        const yearsArray = [];
        for (let i = startYear; i <= endYear; i++) {
            yearsArray.push(i);
        }
        return yearsArray;
    }, []);

    const handleDateSelect = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);

        const iso = newDate.toISOString().split('T')[0]; // Store as YYYY-MM-DD
        methods.setValue(name, iso, { shouldValidate: true });
        if (events) ruleEngine.processEvents(events, iso, 'change', methods);
    };

    const handleYearSelect = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode("calendar");
    };

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        methods.setValue(name, "", { shouldValidate: true });
        if (events) ruleEngine.processEvents(events, "", 'change', methods);
    }, [methods, name, events]);

    const changeMonth = (offset: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
    const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

    return (
        <Box w="full" py={2} px={1}>
            <Field.Root invalid={!!errors} required={mandatory} disabled={disabled}>
                <Flex
                    direction={oneLiner ? { base: "column", md: "row" } : "column"}
                    align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
                    gap={oneLiner ? 4 : 2}
                    w="full"
                >
                    {text && (
                        <Box w={labelWidth}>
                            <Field.Label fontSize="sm" fontWeight="semibold" color="fg.muted">
                                {text}
                            </Field.Label>
                            {description && !oneLiner && (
                                <Text fontSize="xs" color="fg.subtle">
                                    {description}
                                </Text>
                            )}
                        </Box>
                    )}

                    <Box w={inputWidth}>
                        <HStack gap={2} w="full" align="center">
                            <Box flex="1">
                                <PopoverRoot open={open} onOpenChange={(e) => {
                                    setOpen(e.open);
                                    if (!e.open) setViewMode("calendar");
                                }}>
                                    <PopoverTrigger asChild>
                                        <Box w="full">
                                            <InputGroup
                                                w="full"
                                                startElement={<Calendar color="gray.400" />}
                                            >
                                                <Input
                                                    readOnly
                                                    value={formattedValue}
                                                    placeholder="Select date..."
                                                    cursor="pointer"
                                                    onClick={() => !disabled && setOpen(true)}
                                                    size="md"
                                                    borderRadius="xl"
                                                    borderWidth="1.5px"
                                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)" }}
                                                    bg={useColorModeValue("white", "whiteAlpha.100")}
                                                />
                                            </InputGroup>
                                        </Box>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        width="320px"
                                        p="0"
                                        borderRadius="2xl"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        bg={bg}
                                        backdropFilter="blur(16px)"
                                        boxShadow="2xl"
                                    >
                                        <PopoverBody p="4">
                                            <VStack gap="4" align="stretch">
                                                <Flex w="full" justify="space-between" align="center">
                                                    <IconButton size="xs" variant="ghost" onClick={() => changeMonth(-1)} visibility={viewMode === "year" ? "hidden" : "visible"}>
                                                        <ChevronLeft />
                                                    </IconButton>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        fontWeight="bold"
                                                        onClick={() => setViewMode(viewMode === "calendar" ? "year" : "calendar")}
                                                        _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
                                                    >
                                                        {viewMode === "calendar"
                                                            ? viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                                                            : "Select Year"
                                                        }
                                                    </Button>
                                                    <IconButton size="xs" variant="ghost" onClick={() => changeMonth(1)} visibility={viewMode === "year" ? "hidden" : "visible"}>
                                                        <ChevronRight />
                                                    </IconButton>
                                                </Flex>

                                                {/* Scrollable Area */}
                                                <Box maxH="240px" overflowY="auto" px={1}>
                                                    {viewMode === "calendar" ? (
                                                        <SimpleGrid columns={7} gap="1" w="full">
                                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                                                <Center key={`${d}-${idx}`} fontSize="2xs" fontWeight="bold" color={mutedColor}>
                                                                    {d}
                                                                </Center>
                                                            ))}
                                                            {daysInMonth.map((date, i) => (
                                                                <Center key={i}>
                                                                    {date && (
                                                                        <Button
                                                                            size="xs"
                                                                            variant={selectedDate?.toDateString() === date.toDateString() ? "solid" : "ghost"}
                                                                            colorPalette={selectedDate?.toDateString() === date.toDateString() ? "blue" : "gray"}
                                                                            onClick={() => handleDateSelect(date)}
                                                                            fontSize="xs"
                                                                            w="8"
                                                                            h="8"
                                                                            borderRadius="md"
                                                                        >
                                                                            {date.getDate()}
                                                                        </Button>
                                                                    )}
                                                                </Center>
                                                            ))}
                                                        </SimpleGrid>
                                                    ) : (
                                                        <Box w="full">
                                                            <SimpleGrid columns={3} gap="2">
                                                                {years.map(year => (
                                                                    <Button
                                                                        key={year}
                                                                        size="sm"
                                                                        variant={viewDate.getFullYear() === year ? "solid" : "ghost"}
                                                                        colorPalette={viewDate.getFullYear() === year ? "blue" : "gray"}
                                                                        onClick={() => handleYearSelect(year)}
                                                                        borderRadius="md"
                                                                    >
                                                                        {year}
                                                                    </Button>
                                                                ))}
                                                            </SimpleGrid>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Pinned Footer */}
                                                <Button
                                                    w="full"
                                                    size="md"
                                                    colorPalette="blue"
                                                    onClick={() => setOpen(false)}
                                                    borderRadius="xl"
                                                    fontWeight="bold"
                                                    mt="2"
                                                >
                                                    Done
                                                </Button>
                                            </VStack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </PopoverRoot>
                            </Box>
                            {enableClear && value && !disabled && (
                                <CloseButton
                                    size="sm"
                                    variant="ghost"
                                    color="fg.muted"
                                    onClick={handleClear}
                                    _hover={{ bg: "transparent", color: "red.500" }}
                                />
                            )}
                        </HStack>

                        <Flex justify="flex-end" mt={1}>
                            <Field.ErrorText fontSize="xs" color="red.500" fontWeight="medium">
                                {errors?.message?.toString()}
                            </Field.ErrorText>
                        </Flex>
                    </Box>
                </Flex>
            </Field.Root>
        </Box>
    );
};

export default memo(DateField);
