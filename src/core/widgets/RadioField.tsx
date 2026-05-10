import { Box, Flex, RadioGroup, Stack, Field, Text, Button, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, memo, useCallback } from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import { ruleEngine } from "../engine/logicEngine";
import React from "react";

interface RADIO {
  name: string;
  text: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: string;
  mandatory?: boolean;
  oneLiner?: boolean;
  outLineBorder?: boolean;
  events?: any; // Add events prop
  description?: string;
  errors: FieldError;
}

const RadioField = ({
  name,
  text,
  options,
  disabled = false,
  hidden = false,
  defaultValue = "",
  mandatory = false,
  oneLiner = false,
  outLineBorder = true,
  description,
  events,
  errors,
}: RADIO) => {
  if (hidden) return null;

  const methods = useFormContext();

  const value = useWatch({
    name,
    control: methods.control,
  });

  const clearSelection = () => {
    console.log("clearSelection");
    methods.setValue(name, "", { shouldValidate: true });
    if (events) {
      ruleEngine.processEvents(events, "", 'change', methods);
    }
  };

  const handleRadioChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      methods.setValue(name, newValue, { shouldValidate: true });
      if (events) {
        ruleEngine.processEvents(events, newValue, 'change', methods);
      }
    },
    [methods, name, events]
  );

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const contentWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  const selectedBg = useColorModeValue("blue.50", "blue.900/40");
  const selectedBorder = useColorModeValue("blue.500", "blue.400");

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
              <Field.Label
                fontSize="sm"
                fontWeight="semibold"
                color="fg.muted"
                transition="color 0.2s"
                _invalid={{ color: "red.500" }}
                mb={oneLiner ? 0 : 1}
              >
                {text}
              </Field.Label>
              {description && (
                <Text fontSize="xs" color="fg.subtle" mb={oneLiner ? 0 : 1}>
                  {description}
                </Text>
              )}
            </Box>
          )}

          <Box w={contentWidth}>
            <RadioGroup.Root
              width="full"
              id={name}
              disabled={disabled}
              value={String(value || "")}
            >
              <Flex direction="column" gap={3}>
                <Stack
                  direction="row"
                  gap={3}
                  flexWrap="wrap"
                  w="full"
                  align="center"
                >
                  {options.map((option) => {
                    const isSelected = String(value) === String(option.value);
                    return (
                      <RadioGroup.Item
                        key={option.value}
                        value={String(option.value)}
                        position="relative"
                        px={4}
                        py={2}
                        borderRadius="lg"
                        borderWidth="1.5px"
                        borderColor={isSelected ? selectedBorder : useColorModeValue("gray.200", "whiteAlpha.200")}
                        bg={isSelected ? selectedBg : useColorModeValue("white", "whiteAlpha.50")}
                        _hover={{
                          borderColor: isSelected ? selectedBorder : useColorModeValue("gray.300", "whiteAlpha.400"),
                          bg: isSelected ? selectedBg : useColorModeValue("gray.50", "whiteAlpha.100")
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="110px"
                        flex="1"
                        {...methods.register(name, {
                          required: mandatory ? `${text} is required` : false,
                        })}
                      >
                        <RadioGroup.ItemHiddenInput
                          onChange={handleRadioChange}
                        />
                        {/* Custom indicator can be added here if needed, but card look is cleaner without the dot */}
                        <Box display="none">
                          <RadioGroup.ItemControl />
                        </Box>
                        <RadioGroup.ItemText
                          fontWeight="semibold"
                          fontSize="sm"
                          color={isSelected ? "blue.600" : "fg.muted"}
                          _dark={{ color: isSelected ? "blue.300" : "gray.400" }}
                        >
                          {option.label}
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
                    );
                  })}

                  {value && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      aria-label="Clear selection"
                      onClick={clearSelection}
                      color="fg.muted"
                      _hover={{ bg: "red.50", color: "red.500" }}
                      _dark={{ _hover: { bg: "red.900/30", color: "red.400" } }}
                    >
                      <X />
                    </IconButton>
                  )}
                </Stack>
                <Field.ErrorText fontSize="xs" color="red.500" fontWeight="medium">
                  {errors?.message?.toString()}
                </Field.ErrorText>
              </Flex>
            </RadioGroup.Root>
          </Box>
        </Flex>
      </Field.Root>
    </Box>
  );
};

export default memo(RadioField);
