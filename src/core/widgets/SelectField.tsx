import { Box, Flex, Field as ChakraField, Text, HStack, createListCollection } from "@chakra-ui/react";
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
    options: initialOptions = [],
    apiPath,
    serverName = "core",
    labelField = "name",
    valueField = "id",
    defaultValue = "",
    events,
    errors,
}: SELECTFIELD) => {
    const [options, setOptions] = useState<any[]>(initialOptions);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apiPath && initialOptions.length === 0) {
            setLoading(true);
            GETAPI({
                path: apiPath,
                serverName: serverName as APIService,
                isPrivateApi: true,
            }).subscribe((res: any) => {
                if (res.success && (res.result || res.data)) {
                    const data = res.result || res.data;
                    const mapped = data.map((item: any) => ({
                        label: item[labelField],
                        value: item[valueField],
                    }));
                    setOptions(mapped);
                }
                setLoading(false);
            });
        }
    }, [apiPath, serverName, labelField, valueField, initialOptions]);

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
                rules={{ required: required ? `${text} is required` : false }}
                render={({ field }) => (
                    <ChakraField.Root invalid={!!errors} required={required} disabled={disabled}>
                        <Flex
                            direction={oneLiner ? { base: "column", md: "row" } : "column"}
                            align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
                            gap={oneLiner ? 4 : 2}
                            w="full"
                        >
                            {text && (
                                <Box w={labelWidth}>
                                    <ChakraField.Label
                                        htmlFor={name}
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color="fg.muted"
                                        mb={oneLiner ? 0 : 1}
                                    >
                                        {text}
                                    </ChakraField.Label>
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
                                        const val = e.value[0];
                                        field.onChange(val);
                                        if (events) {
                                            ruleEngine.processEvents(events, val, 'change', methods);
                                        }
                                    }}
                                    disabled={disabled || loading}
                                    width="full"
                                    positioning={{ sameWidth: true, strategy: "fixed" }}
                                >
                                    <ComboboxControl>
                                        <ComboboxInput
                                            placeholder={oneLiner ? description : `Select ${text}`}
                                            bg={useColorModeValue("white", "whiteAlpha.50")}
                                            borderRadius="lg"
                                            borderWidth="1.5px"
                                            borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                                            h="48px"
                                            px={4}
                                            fontWeight="600"
                                            transition="all 0.2s"
                                            _hover={{
                                                borderColor: useColorModeValue("gray.300", "whiteAlpha.400"),
                                            }}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                                                bg: useColorModeValue("white", "whiteAlpha.100"),
                                            }}
                                        />
                                    </ComboboxControl>
                                    <ComboboxContent
                                        bg="app.bg.primary"
                                        borderColor="app.card.border"
                                        zIndex={9999}
                                        boxShadow="2xl"
                                    >
                                        {collection.items.length > 0 ? (
                                            collection.items.map((item) => (
                                                <ComboboxItem
                                                    key={item.value}
                                                    item={item}
                                                    _hover={{ bg: "whiteAlpha.100", color: "cyan.400" }}
                                                >
                                                    {item.label}
                                                </ComboboxItem>
                                            ))
                                        ) : (
                                            <Box p={2} color="fg.subtle">No options found</Box>
                                        )}
                                    </ComboboxContent>
                                </ComboboxRoot>
                                <ChakraField.ErrorText fontSize="xs" color="red.500" fontWeight="medium" mt={1}>
                                    {errors?.message?.toString()}
                                </ChakraField.ErrorText>
                            </Box>
                        </Flex>
                    </ChakraField.Root>
                )}
            />
        </Box>
    );
};

export default memo(SelectField);
