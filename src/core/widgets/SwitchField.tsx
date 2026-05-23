import { Box, Flex, Field, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import React, { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Switch as CustomSwitch } from "@/components/ui/switch";
import { ruleEngine } from "../engine/logicEngine";

interface SWITCHFIELD {
    name: string;
    text: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    oneLiner?: boolean;
    defaultValue?: boolean;
    events?: any;
    errors?: any;
}

const SwitchField = ({
    name,
    text,
    description,
    disabled = false,
    hidden = false,
    oneLiner = false,
    defaultValue = false,
    events,
    errors,
}: SWITCHFIELD) => {
    if (hidden) return null;

    const methods = useFormContext();
    if (!methods) return null;

    const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
    const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

    return (
        <Box w="full" py={2} px={1} transition="all 0.2s">
            <Controller
                control={methods.control}
                name={name}
                defaultValue={defaultValue}
                render={({ field }) => (
                    <Field.Root invalid={!!errors} disabled={disabled}>
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
                                        fontSize="md"
                                        fontWeight="semibold"
                                        transition="color 0.2s"
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
                                <HStack
                                    gap={4}
                                    w="full"
                                    align="center"
                                    bg={useColorModeValue("white", "whiteAlpha.50")}
                                    borderRadius="lg"
                                    borderWidth="1.5px"
                                    borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                                    h="48px"
                                    px={4}
                                    transition="all 0.2s"
                                >
                                    <CustomSwitch
                                        id={name}
                                        checked={field.value}
                                        onCheckedChange={(e) => {
                                            field.onChange(e.checked);
                                            if (events) {
                                                ruleEngine.processEvents(events, e.checked, 'change', methods);
                                            }
                                        }}
                                        disabled={disabled}
                                    />
                                    <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                                        {field.value ? "Enabled" : "Disabled"}
                                    </Text>
                                </HStack>
                                <Field.ErrorText fontSize="xs" color="red.500" fontWeight="medium" mt={1}>
                                    {errors?.message?.toString()}
                                </Field.ErrorText>
                            </Box>
                        </Flex>
                    </Field.Root>
                )}
            />
        </Box>
    );
};

export default memo(SwitchField);
