import { Box, Flex, Input, Field, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";

import { ruleEngine } from "../engine/logicEngine";

interface TEXTFIELD {
  name: string;
  text: string;
  required?: boolean;
  description?: string;
  type?: string;
  disabled?: boolean;
  hidden?: boolean;
  widget?: string;
  oneLiner?: boolean;
  outLineBorder?: boolean;
  maxLength?: number;
  minLength?: number;
  events?: any; // Add events prop
  errors: FieldError;
  pattern?: string;
  patternMessage?: string;
}

const TextField = ({
  name,
  text,
  description,
  type = "text",
  disabled = false,
  hidden = false,
  widget,
  oneLiner = false,
  outLineBorder = true,
  required = false,
  events,
  maxLength,
  minLength,
  errors,
  pattern, // Add pattern
  patternMessage, // Add patternMessage
}: TEXTFIELD) => {
  if (hidden) return null;
  const props = { pattern, patternMessage }; // Create props object for useMemo

  const methods = useFormContext();
  const control = methods.control;

  const value = useWatch({
    control,
    name,
  });

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      // methods.setValue(name, newValue, { shouldValidate: true }); // Handled by RHF onChange now
      if (events) {
        ruleEngine.processEvents(events, newValue, 'change', methods);
      }
    },
    [methods, name, events]
  );

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  const patternValue = useMemo(() => {
    if (props.pattern) {
      try {
        // If pattern is a string like "^[0-9]+$", convert to RegExp
        return new RegExp(props.pattern);
      } catch (e) {
        console.error("Invalid pattern regex", props.pattern);
        return undefined;
      }
    }
    return undefined;
  }, [props.pattern]);

  return (
    <Box
      w="full"
      py={2}
      px={1}
      transition="all 0.2s"
    >
      <Field.Root invalid={!!errors} required={required} disabled={disabled}>
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
                transition="color 0.2s"
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

          <Box w={inputWidth} position="relative">
            {(() => {
              const { onChange, ...restRegister } = methods.register(name, {
                required: required ? `${text} is required` : false,
                maxLength: maxLength ? { value: maxLength, message: `Max length is ${maxLength}` } : undefined,
                minLength: minLength ? { value: minLength, message: `Min length is ${minLength}` } : undefined,
                pattern: patternValue ? { value: patternValue, message: props.patternMessage || "Invalid format" } : undefined
              });

              return (
                <Input
                  {...restRegister}
                  type={type}
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
                    onChange(e); // Call RHF's onChange
                    handleInputChange(e); // Call our custom logic for rules
                  }}
                />
              );
            })()}

            <Flex justify="flex-end" mt={1} gap={4}>
              {maxLength && (
                <Text fontSize="2xs" fontWeight="medium" color={value?.length > maxLength ? "red.500" : "fg.subtle"}>
                  {value?.length || 0} / {maxLength}
                </Text>
              )}
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

export default memo(TextField);
