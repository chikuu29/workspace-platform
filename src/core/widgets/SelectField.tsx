import { Box, Flex, Field, Text, HStack, createListCollection } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import React, { memo, useEffect, useState, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    ComboboxInput,
    ComboboxRoot,
    ComboboxContent,
    ComboboxItem,
    ComboboxControl,
} from "../../components/ui/combobox";
import { GETAPI, APIService } from "@/app/api";
import { ruleEngine } from "../engine/logicEngine";

interface SELECTFIELD {
    name: string;
    text: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    oneLiner?: boolean;
    required?: boolean;
    mandatory?: boolean;
    options?: { label: string; value: string }[];
    apiPath?: string;
    serverName?: string;
    labelField?: string;
    valueField?: string;
    defaultValue?: string;
    events?: any;
    errors?: any;
}

const SelectField = ({
    name,
    text,
    description,
    disabled = false,
    hidden = false,
    oneLiner = false,
    required = false,
    mandatory = false,
    options: initialOptions = [],
    apiPath,
    serverName = "core",
    labelField = "name",
    valueField = "id",
    defaultValue = "",
    events,
    errors,
}: SELECTFIELD) => {
    const isRequired = required || mandatory;
    const [apiOptions, setApiOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apiPath && (!initialOptions || initialOptions.length === 0)) {
            setLoading(true);
            const subscription = GETAPI({
                path: apiPath,
                serverName: serverName as APIService,
                isPrivateApi: true,
            }).subscribe({
                next: (res: any) => {
                    if (res.success && (res.result || res.data)) {
                        const data = res.result || res.data;
                        const mapped = data.map((item: any) => ({
                            label: item[labelField] || "",
                            value: String(item[valueField] || ""),
                        }));
                        setApiOptions(mapped);
                    }
                    setLoading(false);
                },
                error: (err) => {
                    console.error("Failed to fetch select options:", err);
                    setLoading(false);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [apiPath, serverName, labelField, valueField, initialOptions?.length]);

    const options = apiPath && (!initialOptions || initialOptions.length === 0) ? apiOptions : initialOptions;

    const collection = useMemo(() =>
        createListCollection({
            items: options,
        }), [options]
    );

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
                rules={{ required: isRequired ? `${text} is required` : false }}
                render={({ field }) => (
                    <Field.Root invalid={!!errors} required={isRequired} disabled={disabled}>
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
                                        <Flex as="span" align="center" gap={1}>
                                            {text}
                                            {isRequired && (
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

                            <Box w={inputWidth}>
                                <ComboboxRoot
                                    collection={collection}
                                    value={field.value ? [field.value] : []}
                                    onValueChange={(e) => {
                                        const val = e.value[0] ?? "";
                                        field.onChange(val);
                                        if (events) {
                                            ruleEngine.processEvents(events, val, 'change', methods);
                                        }
                                    }}
                                    disabled={disabled || loading}
                                    width="full"
                                    positioning={{ sameWidth: true, strategy: "fixed" }}
                                >
                                    <ComboboxControl clearable>
                                        <ComboboxInput
                                            placeholder={oneLiner ? description : `Select ${text}`}
                                            bg={"app.input.bg"}
                                            borderRadius="lg"
                                            borderWidth="1.5px"
                                            borderColor="app.input.border"
                                            h="48px"
                                            px={4}
                                            fontWeight="600"
                                            transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                                            _hover={{
                                                borderColor: "app.input.border.focus",
                                            }}
                                            _invalid={{
                                                borderColor: "red.500",
                                                boxShadow: "0 0 0 3px rgba(239,68,68,0.2)",
                                            }}
                                            _focus={{
                                                borderColor: "app.input.border.focus",
                                                boxShadow: "app.input.glow",
                                                outline: "none",
                                            }}
                                        />
                                    </ComboboxControl>
                                    <ComboboxContent
                                        bg="app.card.bg"
                                        borderColor="app.card.border"
                                        borderWidth="1px"
                                        borderRadius="xl"
                                        p={1.5}
                                        zIndex={9999}
                                        boxShadow="0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05)"
                                    >
                                        {collection.items.length > 0 ? (
                                            collection.items.map((item) => (
                                                <ComboboxItem
                                                    key={item.value}
                                                    item={item}
                                                    px={4}
                                                    py={3}
                                                    my={1}
                                                    borderRadius="lg"
                                                    fontWeight="600"
                                                    fontSize="sm"
                                                    cursor="pointer"
                                                    transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
                                                    color="app.text.primary"
                                                    bg="transparent"
                                                    _hover={{
                                                        bg: useColorModeValue("rgba(66, 42, 251, 0.06)", "rgba(117, 81, 255, 0.15)"),
                                                        color: useColorModeValue("brand.500", "brand.200"),
                                                        transform: "translateX(4px)",
                                                    }}
                                                    _selected={{
                                                        bg: useColorModeValue("rgba(66, 42, 251, 0.1)", "rgba(117, 81, 255, 0.2)"),
                                                        color: useColorModeValue("brand.500", "brand.100"),
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    <Flex w="full" align="center" justify="space-between">
                                                        <Text fontSize="sm" fontWeight="inherit">
                                                            {item.label}
                                                        </Text>
                                                    </Flex>
                                                </ComboboxItem>
                                            ))
                                        ) : (
                                            <Box p={3} textAlign="center" color="app.text.muted" fontSize="sm" fontWeight="medium">
                                                No options found
                                            </Box>
                                        )}
                                    </ComboboxContent>
                                </ComboboxRoot>
                                <Field.ErrorText fontSize="md" color="red.500" fontWeight="medium" mt={1}>
                                    <Field.ErrorIcon />
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

export default memo(SelectField);
