import {
    Box,
    Button,
    DatePicker,
    Field,
    Flex,
    Portal,
    Text,
} from "@chakra-ui/react";
import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
} from "@internationalized/date";
import { useColorModeValue } from "../../components/ui/color-mode";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { type FieldError, useFormContext, useWatch } from "react-hook-form";
import { CloseButton } from "../../components/ui/close-button";
import { ruleEngine } from "../engine/logicEngine";
import { Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DATEFIELD {
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

const dateFormatter = new DateFormatter("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a JS Date to a CalendarDate so it integrates with
 * Chakra's DatePicker value system (Zag.js / @internationalized/date).
 */
function dateToCalendar(date: Date): CalendarDate {
    return new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    );
}

// ─── DateField ────────────────────────────────────────────────────────────────

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
    const methods = useFormContext();
    const { control, register, setValue, unregister } = methods;
    const value = useWatch({ control, name });

    // CalendarDate[] — the format Chakra DatePicker expects
    const [calValue, setCalValue] = useState<CalendarDate[]>(() => {
        if (!value) return [];
        try {
            return [dateToCalendar(new Date(value))];
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

    // ── Sync incoming RHF value → CalendarDate (edit mode / form reset) ───
    useEffect(() => {
        if (!value) {
            setCalValue([]);
            return;
        }
        try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setCalValue([dateToCalendar(d)]);
            }
        } catch {
            setCalValue([]);
        }
    }, [value]);

    // ── Colors ────────────────────────────────────────────────────────────────
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
    const hasError = !!errors;

    // ── Derived display values ────────────────────────────────────────────────

    /** Formatted label shown on the trigger button */
    const displayLabel = useMemo(() => {
        if (!calValue[0]) return "";
        return dateFormatter.format(calValue[0].toDate(getLocalTimeZone()));
    }, [calValue]);

    // ── Commit to RHF ─────────────────────────────────────────────────────────

    const commitCalendar = useCallback((next: CalendarDate) => {
        const iso = `${next.year}-${String(next.month).padStart(2, "0")}-${String(next.day).padStart(2, "0")}`;
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
        setCalValue([newDate]);
        commitCalendar(newDate);
    }, [commitCalendar, events, methods, name, setValue]);

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
                            onOpenChange={(details) => {
                                if (!details.open) {
                                    if (document.activeElement instanceof HTMLElement) {
                                        document.activeElement.blur();
                                    }
                                }
                            }}
                            closeOnSelect={true}
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
                                            fontWeight="600"
                                            color={displayLabel ? "fg.default" : "app.text.muted"}
                                            disabled={disabled}
                                            cursor={disabled ? "not-allowed" : "pointer"}
                                            px={4}
                                            _hover={{
                                                bg: "app.input.bg",
                                                borderColor: hasError ? "red.500" : "app.input.border"
                                            }}
                                            _focus={{
                                                outline: "none",
                                                bg: "app.input.bg",
                                                borderColor: hasError ? "red.500" : "app.input.border",
                                                boxShadow: hasError
                                                    ? "0 0 0 3px rgba(239,68,68,0.2)"
                                                    : "none",
                                            }}
                                            _active={{
                                                bg: "app.input.bg"
                                            }}
                                            transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                                        >
                                            <Box color={hasError ? "red.500" : "app.text.muted"} mr={2} flexShrink={0}>
                                                <Calendar size={15} />
                                            </Box>
                                            <Text flex={1} textAlign="left" truncate>
                                                {displayLabel || (oneLiner ? description : "Select date...")}
                                            </Text>
                                        </Button>
                                    </DatePicker.Trigger>

                                    {/* Clear button — sits inside the control, right edge */}
                                    {enableClear && value && !disabled && (
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
                                        bg="app.card.bg"
                                        boxShadow="0 20px 60px -12px rgba(0,0,0,0.3)"
                                        minW="280px"
                                    >
                                        <DatePicker.View view="day">
                                            <DatePicker.Header />
                                            <DatePicker.DayTable />
                                        </DatePicker.View>

                                        <DatePicker.View view="month">
                                            <DatePicker.Header />
                                            <DatePicker.MonthTable />
                                        </DatePicker.View>

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

export default memo(DateField);
