import {
    Box,
    Flex,
    Input,
    Field,
    Text,
    HStack,
    VStack,
    IconButton,
    Button,
    SimpleGrid,
    Center,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, memo, useCallback, useMemo } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { InputGroup } from "../../components/ui/input-group";
import { CloseButton } from "../../components/ui/close-button";
import { SegmentedControl } from "../../components/ui/segmented-control";
import {
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTrigger,
} from "../../components/ui/popover";
import { ruleEngine } from "../engine/logicEngine";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuClock } from "react-icons/lu";

interface DATETIMEFIELD {
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

const DateTimeField = ({
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
}: DATETIMEFIELD) => {
    if (hidden) return null;

    const methods = useFormContext();
    const value = useWatch({
        control: methods.control,
        name,
    });

    // Integrated State
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"calendar" | "year">("calendar");
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

    // Time State
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [ampm, setAmpm] = useState<string>("AM");

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
                let h = dt.getHours();
                const m = String(dt.getMinutes()).padStart(2, "0");
                const p = h >= 12 ? "PM" : "AM";
                h = h % 12 || 12;
                setHour(String(h).padStart(2, "0"));
                setMinute(m);
                setAmpm(p);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    const formattedValue = useMemo(() => {
        if (!selectedDate) return "";
        return selectedDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }, [selectedDate]);

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

    const handleDateSelect = (date: Date) => {
        const newDate = new Date(date);
        let h = parseInt(hour);
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        newDate.setHours(h, parseInt(minute), 0, 0);

        const iso = newDate.toISOString();
        methods.setValue(name, iso, { shouldValidate: true });
        if (events) ruleEngine.processEvents(events, iso, 'change', methods);
    };

    const handleYearSelect = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode("calendar");
    };

    const handleTimeSync = (newHour: string, newMin: string, newAmpm: string) => {
        if (!selectedDate) {
            // If no date selected yet, use viewDate or today
            const baseDate = viewDate || new Date();
            let h = parseInt(newHour) || 12;
            if (newAmpm === "PM" && h < 12) h += 12;
            if (newAmpm === "AM" && h === 12) h = 0;
            baseDate.setHours(h, parseInt(newMin) || 0, 0, 0);
            return;
        }
        const newDate = new Date(selectedDate);
        let h = parseInt(newHour) || 12;
        if (newAmpm === "PM" && h < 12) h += 12;
        if (newAmpm === "AM" && h === 12) h = 0;
        newDate.setHours(h, parseInt(newMin) || 0, 0, 0);

        const iso = newDate.toISOString();
        methods.setValue(name, iso, { shouldValidate: true });
        if (events) ruleEngine.processEvents(events, iso, 'change', methods);
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
                                                startElement={<LuCalendar color="gray.400" />}
                                                endElement={<LuClock color="gray.400" />}
                                            >
                                                <Input
                                                    readOnly
                                                    value={formattedValue}
                                                    placeholder="Select date and time..."
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
                                                        <LuChevronLeft />
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
                                                        <LuChevronRight />
                                                    </IconButton>
                                                </Flex>

                                                {/* Scrollable Area */}
                                                <Box maxH="320px" overflowY="auto" px={1}>
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

                                                    {selectedDate && viewMode === "calendar" && (
                                                        <Box w="full" pt="4" mt="2" borderTop="1px solid" borderColor={borderColor}>
                                                            <VStack gap="4">
                                                                <HStack justify="center" gap="6">
                                                                    <VStack gap="0" align="center">
                                                                        <Text fontSize="2xs" color={mutedColor} fontWeight="bold">HOUR</Text>
                                                                        <Input
                                                                            type="number"
                                                                            min={1}
                                                                            max={12}
                                                                            value={hour}
                                                                            onChange={(e) => {
                                                                                let v = e.target.value.slice(-2);
                                                                                if (parseInt(v) > 12) v = "12";
                                                                                if (parseInt(v) < 1) v = "01";
                                                                                setHour(v);
                                                                                handleTimeSync(v, minute, ampm);
                                                                            }}
                                                                            w="14"
                                                                            textAlign="center"
                                                                            variant="flushed"
                                                                            fontWeight="bold"
                                                                        />
                                                                    </VStack>
                                                                    <Text pt="4" fontWeight="bold" fontSize="xl">:</Text>
                                                                    <VStack gap="0" align="center">
                                                                        <Text fontSize="2xs" color={mutedColor} fontWeight="bold">MIN</Text>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            max={59}
                                                                            value={minute}
                                                                            onChange={(e) => {
                                                                                let v = e.target.value.slice(-2);
                                                                                if (parseInt(v) > 59) v = "59";
                                                                                if (parseInt(v) < 0) v = "00";
                                                                                setMinute(v);
                                                                                handleTimeSync(hour, v, ampm);
                                                                            }}
                                                                            w="14"
                                                                            textAlign="center"
                                                                            variant="flushed"
                                                                            fontWeight="bold"
                                                                        />
                                                                    </VStack>
                                                                </HStack>

                                                                <Center w="full">
                                                                    <SegmentedControl
                                                                        value={ampm}
                                                                        onValueChange={(e) => {
                                                                            if (e.value) {
                                                                                setAmpm(e.value);
                                                                                handleTimeSync(hour, minute, e.value);
                                                                            }
                                                                        }}
                                                                        items={["AM", "PM"]}
                                                                        size="sm"
                                                                        w="140px"
                                                                    />
                                                                </Center>
                                                            </VStack>
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

export default memo(DateTimeField);
