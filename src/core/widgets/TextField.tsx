import { Box, Flex, Input, Field, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { CloseButton } from "../../components/ui/close-button";

import { ruleEngine } from "../engine/logicEngine";

interface TEXTFIELD {
  name: string;
  text: string;
  mandatory: boolean;
  description?: string;
  type?: string;
  disabled?: boolean;
  hidden?: boolean;
  widget?: string;
  oneLiner?: boolean;
  enableClear?: boolean;
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
  enableClear = false,
  outLineBorder = true,
  mandatory = false,
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
      if (events) {
        ruleEngine.processEvents(events, newValue, "change", methods);
      }
    },
    [methods, events],
  );

  const handleClear = useCallback(() => {
    methods.setValue(name, "", { shouldValidate: true });
    if (events) {
      ruleEngine.processEvents(events, "", "change", methods);
    }
  }, [methods, name, events]);

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
    if (type === "email") {
      // Standard email regex
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }
    return undefined;
  }, [props.pattern, type]);

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
                // fontSize="sm"
                // fontWeight="semibold"
                // color="fg.muted"
                transition="color 0.2s"
                _invalid={{ color: "red.500" }}
                mb={oneLiner ? 0 : 1}
                 css={{
                    "& [data-part='label']": {
                        color: "app.text.muted",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        marginBottom: "6px",
                    },
                    "& [data-part='helper-text']": {
                        color: "app.text.muted",
                        fontSize: "0.75rem",
                        marginTop: "4px",
                    },
                }}
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
              {(() => {
                const { onChange, ...restRegister } = methods.register(name, {
                  required: mandatory ? `${text} is required` : false,
                  maxLength: maxLength
                    ? {
                        value: maxLength,
                        message: `Max length is ${maxLength}`,
                      }
                    : undefined,
                  minLength: minLength
                    ? {
                        value: minLength,
                        message: `Min length is ${minLength}`,
                      }
                    : undefined,
                  pattern: patternValue
                    ? {
                        value: patternValue,
                        message:
                          props.patternMessage ||
                          (type === "email"
                            ? "Invalid email address"
                            : "Invalid format"),
                      }
                    : undefined,
                });

                return (
                  <Input
                    {...restRegister}
                    type={type}
                    id={name}
                    placeholder={oneLiner ? description : ""}
                    disabled={disabled}
                    flex="1"
                    size="lg"
                    bg={"app.input.bg"}
                    borderColor="app.input.border"
                    borderRadius="lg"
                    borderWidth="1.5px"
                    // borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
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
                    transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                    backdropFilter="blur(4px)"
                    onChange={(e) => {
                      onChange(e); // Call RHF's onChange
                      handleInputChange(e); // Call our custom logic for rules
                    }}
                  />
                );
              })()}
              {enableClear && value && !disabled && (
                <CloseButton
                  size="sm"
                  onClick={handleClear}
                  _hover={{ bg: "transparent", color: "red.500" }}
                />
              )}
            </HStack>

            <Flex justify="flex-end" mt={1} gap={4}>
              {maxLength && (
                <Text
                  fontSize="2xs"
                  fontWeight="medium"
                  color={value?.length > maxLength ? "red.500" : "fg.subtle"}
                >
                  {value?.length || 0} / {maxLength}
                </Text>
              )}
              <Field.ErrorText
                fontSize="xs"
                color="red.500"
                fontWeight="medium"
              >
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
