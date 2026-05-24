import {
    Box,
    Button,
    DatePicker,
    Field,
    Flex,
    Input,
    Portal,
    Text,
} from "@chakra-ui/react";
import {
    CalendarDateTime,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
} from "@internationalized/date";
import { useColorModeValue } from "../../components/ui/color-mode";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type FieldError, useFormContext, useWatch } from "react-hook-form";
import { CloseButton } from "../../components/ui/close-button";
import { ruleEngine } from "../engine/logicEngine";
import { Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DATETIMEFIELD {
    name: string;
    text?: string;
    mandatory?: boolean;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    widget?: string;
    oneLiner?: boolean;
    enableClear?: boolean;
    errors: FieldError;
    events?: any;
}

// ─── Formatter (module-level singleton — created once, never recreated) ────────

const dateTimeFormatter = new DateFormatter("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a JS Date to a CalendarDateTime so it integrates with
 * Chakra's DatePicker value system (Zag.js / @internationalized/date).
 */
function dateToCalendar(date: Date): CalendarDateTime {
    return new CalendarDateTime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
    );
}

// ─── DateTimeField ────────────────────────────────────────────────────────────

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
    const methods = useFormContext();
    const { control, register, setValue, unregister } = methods;
    const rhfValue = useWatch({ control, name });

    // CalendarDateTime[] — the format Chakra DatePicker expects
    const [calValue, setCalValue] = useState<CalendarDateTime[]>(() => {
        if (!rhfValue) return [];
        try {
            return [dateToCalendar(new Date(rhfValue))];
        } catch {
            return [];
        }
    });

    // ── Register with RHF so mandatory validation fires on submit ─────────────
    useEffect(() => {
        register(name, {
            required: mandatory ? `${text || "This field"} is required` : false,
        });
        return () => { unregister(name); };
    }, [mandatory, name, register, text, unregister]);

    // ── Sync incoming RHF value → CalendarDateTime (edit mode / form reset) ───
    useEffect(() => {
        if (!rhfValue) {
            setCalValue([]);
            return;
        }
        try {
            const d = new Date(rhfValue);
            if (!isNaN(d.getTime())) {
                setCalValue([dateToCalendar(d)]);
            }
        } catch {
            setCalValue([]);
        }
    }, [rhfValue]);

    // ── Colors ────────────────────────────────────────────────────────────────
    const accent = "#6366f1";
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
    const inputBg = useColorModeValue("white", "whiteAlpha.50");
    const mutedColor = useColorModeValue("gray.400", "whiteAlpha.500");
    const panelBg = useColorModeValue("white", "gray.900");
    const hasError = !!errors;

    // ── Derived display values ────────────────────────────────────────────────

    /** Native time input value — "HH:MM" */
    const timeValue = calValue[0]
        ? `${String(calValue[0].hour).padStart(2, "0")}:${String(calValue[0].minute).padStart(2, "0")}`
        : "";

    /** Formatted label shown on the trigger button */
    const displayLabel = useMemo(() => {
        if (!calValue[0]) return "";
        return dateTimeFormatter.format(calValue[0].toDate(getLocalTimeZone()));
    }, [calValue]);

    // ── Commit to RHF ─────────────────────────────────────────────────────────

    const commitCalendar = useCallback((next: CalendarDateTime) => {
        const iso = next.toDate(getLocalTimeZone()).toISOString();
        setValue(name, iso, { shouldValidate: true, shouldDirty: true });
        if (events) ruleEngine.processEvents(events, iso, "change", methods);
    }, [events, methods, name, setValue]);

    // ── DatePicker change (user selects a day) ────────────────────────────────

    const handleDateChange = useCallback((details: any) => {
        const newDate = details.value[0];
        if (!newDate) {
            setCalValue([]);
            setValue(name, "", { shouldValidate: true, shouldDirty: true });
            if (events) ruleEngine.processEvents(events, "", "change", methods);
            return;
        }
        // Preserve existing time when changing the date
        const prevTime = calValue[0] ?? { hour: 0, minute: 0 };
        const next = new CalendarDateTime(
            newDate.year,
            newDate.month,
            newDate.day,
            prevTime.hour,
            prevTime.minute,
        );
        setCalValue([next]);
        commitCalendar(next);
    }, [calValue, commitCalendar, events, methods, name, setValue]);

    // ── Time input change (native <input type="time">) ────────────────────────

    const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.currentTarget.value.split(":").map(Number);
        setCalValue((prev) => {
            const base = prev[0] ?? new CalendarDateTime(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate(),
                0, 0,
            );
            const next = base.set({ hour: hours, minute: minutes });
            commitCalendar(next);
            return [next];
        });
    }, [commitCalendar]);

    // ── Clear ────────────────────────────────────────────────────────────────

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCalValue([]);
        setValue(name, "", { shouldValidate: true, shouldDirty: true });
        if (events) ruleEngine.processEvents(events, "", "change", methods);
    }, [events, methods, name, setValue]);

    const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
    const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

    if (hidden || !methods) return null;

    return (
        <Box w="full" py={2} px={1}>
            <Field.Root invalid={hasError} required={mandatory} disabled={disabled}>
                <Flex
                    direction={oneLiner ? { base: "column", md: "row" } : "column"}
                    align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
                    gap={oneLiner ? 4 : 2}
                    w="full"
                >
                    {/* Label */}
                    {text && (
                        <Box w={labelWidth}>
                            <Field.Label
                                htmlFor={name}
                                fontSize="md"
                                fontWeight="semibold"
                                transition="color 0.2s"
                            >
                                <Flex as="span" align="center" gap={1}>
                                    {text}
                                    {mandatory && (
                                        <Text
                                            as="span"
                                            color="red.500"
                                            fontSize="md"
                                            fontWeight="bold"
                                            lineHeight="1"
                                            aria-hidden
                                            title="Required"
                                        >
                                            *
                                        </Text>
                                    )}
                                </Flex>
                            </Field.Label>
                            {description && !oneLiner && (
                                <Text fontSize="xs" color="fg.subtle" mb={1}>
                                    {description}
                                </Text>
                            )}
                        </Box>
                    )}

                    {/* Input area */}
                    <Box w={inputWidth}>
                        <DatePicker.Root
                            value={calValue as any}
                            onValueChange={handleDateChange as any}
                            closeOnSelect={false}
                            disabled={disabled}
                            w="full"
                        >
                            {/* Trigger button — exact pattern from Chakra reference demo */}
                            <DatePicker.Control>
                                <Box position="relative" w="full">
                                    <DatePicker.Trigger asChild unstyled>
                                        <Button
                                            id={name}
                                            variant="outline"
                                            w="full"
                                            h="48px"
                                            justifyContent="space-between"
                                            borderRadius="lg"
                                            borderWidth="1.5px"
                                            borderColor={hasError ? "red.500" : "app.input.border"}
                                            bg={"app.input.bg"}
                                            fontSize="md"
                                            fontWeight={displayLabel ? "600" : "600"}
                                            color={displayLabel ? "fg.default" : "app.text.muted"}
                                            disabled={disabled}
                                            px={4}
                                            _hover={{ borderColor: "app.input.border.focus" }}
                                            _focus={{
                                                outline: "none",
                                                borderColor: hasError ? "red.500" : "app.input.border.focus",
                                                boxShadow: hasError
                                                    ? "0 0 0 3px rgba(239,68,68,0.2)"
                                                    : "app.input.glow",
                                            }}
                                            transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                                        >
                                            <Box style={{ color: hasError ? "#ef4444" : accent }} mr={2} flexShrink={0}>
                                                <Calendar size={15} />
                                            </Box>
                                            <Text flex={1} textAlign="left" truncate>
                                                {displayLabel || (oneLiner ? description : "Select date & time...")}
                                            </Text>
                                        </Button>
                                    </DatePicker.Trigger>

                                    {/* Clear button — sits inside the control, right edge */}
                                    {enableClear && rhfValue && !disabled && (
                                        <Box position="absolute" right={1} top="50%" transform="translateY(-50%)" zIndex={1}>
                                            <CloseButton
                                                size="xs"
                                                variant="ghost"
                                                color="fg.muted"
                                                onClick={handleClear}
                                                _hover={{ bg: "transparent", color: "red.500" }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </DatePicker.Control>

                            {/* Calendar panel — Portal so it escapes overflow:hidden containers */}
                            <Portal>
                                <DatePicker.Positioner>
                                    <DatePicker.Content
                                        p={3}
                                        borderRadius="2xl"
                                        border="1.5px solid"
                                        borderColor={borderColor}
                                        // bg={panelBg}
                                        boxShadow="0 20px 60px -12px rgba(0,0,0,0.3)"
                                        minW="280px"
                                    >
                                        {/* Day view: header + calendar + time input */}
                                        <DatePicker.View view="day">
                                            <DatePicker.Header />
                                            <DatePicker.DayTable />
                                            {/* Native time input — elegant, no custom spinners needed */}
                                            <Box pt={2} pb={1} borderTop="1px solid" borderColor={borderColor} mt={2}>
                                                <Text fontSize="10px" fontWeight="700" letterSpacing="widest" color={mutedColor} textTransform="uppercase" mb={1.5}>
                                                    Time
                                                </Text>
                                                <Input
                                                    type="time"
                                                    value={timeValue}
                                                    onChange={handleTimeChange}
                                                    size="sm"
                                                    borderRadius="lg"
                                                    borderColor={borderColor}
                                                    bg={inputBg}
                                                    fontFamily="mono"
                                                    fontWeight="600"
                                                    fontSize="sm"
                                                    _focus={{
                                                        borderColor: accent,
                                                        boxShadow: `0 0 0 3px rgba(99,102,241,0.18)`,
                                                    }}
                                                />
                                            </Box>
                                        </DatePicker.View>

                                        {/* Month view */}
                                        <DatePicker.View view="month">
                                            <DatePicker.Header />
                                            <DatePicker.MonthTable />
                                        </DatePicker.View>

                                        {/* Year view */}
                                        <DatePicker.View view="year">
                                            <DatePicker.Header />
                                            <DatePicker.YearTable />
                                        </DatePicker.View>
                                    </DatePicker.Content>
                                </DatePicker.Positioner>
                            </Portal>
                        </DatePicker.Root>

                        {/* Validation error */}
                        {hasError && (
                            <Field.ErrorText fontSize="xs" color="red.500" fontWeight="600" mt={1}>
                                <Field.ErrorIcon /> {errors?.message?.toString()}
                            </Field.ErrorText>
                        )}
                    </Box>
                </Flex>
            </Field.Root>
        </Box>
    );
};

export default memo(DateTimeField);
