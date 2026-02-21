import { Box, Flex, Input, Field, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { InputGroup } from "../../components/ui/input-group";
import { CloseButton } from "../../components/ui/close-button";
import { ruleEngine } from "../engine/logicEngine";
import { LuCalendar } from "react-icons/lu";

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
    enableClear = false,
    events,
    errors,
}: DATEFIELD) => {
    if (hidden) return null;

    const methods = useFormContext();
    const value = useWatch({
        control: methods.control,
        name,
    });

    const handleInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            if (events) {
                ruleEngine.processEvents(events, newValue, 'change', methods);
            }
        },
        [methods, events]
    );

    const handleClear = useCallback(() => {
        methods.setValue(name, "", { shouldValidate: true });
        if (events) {
            ruleEngine.processEvents(events, "", 'change', methods);
        }
    }, [methods, name, events]);

    const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
    const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

    const { onChange, ...restRegister } = methods.register(name, {
        required: mandatory ? `${text} is required` : false,
    });

    return (
        <Box w="full" py={2} px={1} transition="all 0.2s">
            <Field.Root invalid={!!errors} required={mandatory} disabled={disabled}>
                <Flex
                    direction={oneLiner ? { base: "column", md: "row" } : "column"}
                    align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
                    gap={oneLiner ? 4 : 2}
                    w="full"
                >
                    {text && (
                        <Box w={labelWidth}>
                            <Field.Label
                                htmlFor={name}
                                fontSize="sm"
                                fontWeight="semibold"
                                color="fg.muted"
                                _invalid={{ color: "red.500" }}
                                mb={oneLiner ? 0 : 1}
                            >
                                {text}
                            </Field.Label>
                            {description && !oneLiner && (
                                <Text fontSize="xs" color="fg.subtle" mb={1}>
                                    {description}
                                </Text>
                            )}
                        </Box>
                    )}

                    <Box w={inputWidth}>
                        <HStack gap={2} w="full" align="center">
                            <InputGroup
                                flex="1"
                                startElement={<LuCalendar color="gray.400" />}
                            >
                                <Input
                                    {...restRegister}
                                    type="date"
                                    id={name}
                                    placeholder={oneLiner ? description : ""}
                                    size="md"
                                    variant="outline"
                                    disabled={disabled}
                                    bg={useColorModeValue("white", "whiteAlpha.50")}
                                    borderRadius="lg"
                                    borderWidth="1.5px"
                                    borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                                    _hover={{
                                        borderColor: useColorModeValue("gray.300", "whiteAlpha.400"),
                                    }}
                                    _focus={{
                                        borderColor: "blue.500",
                                        boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                                        bg: useColorModeValue("white", "whiteAlpha.100"),
                                    }}
                                    _invalid={{
                                        borderColor: "red.500",
                                        boxShadow: "0 0 0 1px rgba(229, 62, 62, 0.6)",
                                    }}
                                    transition="all 0.2s"
                                    onChange={(e) => {
                                        onChange(e);
                                        handleInputChange(e);
                                    }}
                                />
                            </InputGroup>
                            {enableClear && value && !disabled && (
                                <CloseButton
                                    size="sm"
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
