import { Box, Flex, Textarea, Field, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { memo } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";

import { ruleEngine } from "../engine/logicEngine";

interface TEXTAREA {
  name: string;
  text: string;
  mandatory: boolean;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
  widget?: string;
  oneLiner?: boolean;
  outLineBorder?: boolean;
  maxLength?: number;
  minLength?: number;
  events?: any;
  errors: FieldError;
}

const TextArea = ({
  name,
  text,
  description,
  disabled = false,
  hidden = false,
  widget,
  oneLiner = false,
  mandatory = false,
  outLineBorder = true,
  events,
  maxLength,
  minLength,
  errors,
}: TEXTAREA) => {
  const methods = useFormContext();
  const control = methods.control;

  const value = useWatch({ control, name });

  const handleTextAreaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      methods.setValue(name, newValue, { shouldValidate: true });
      if (events) {
        ruleEngine.processEvents(events, newValue, "change", methods);
      }
    },
    [methods, name, events],
  );

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  // ─── Color tokens hoisted (no hooks inside JSX / callbacks) ─────────────────
  const inputBg = useColorModeValue("white", "whiteAlpha.50");
  const inputBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputHoverBorder = useColorModeValue("gray.300", "whiteAlpha.400");
  const inputFocusBg = useColorModeValue("white", "whiteAlpha.100");

  if (hidden || !methods) return null;

  return (
    <Box w="full" py={2} px={1} transition="all 0.2s">
      <Field.Root invalid={!!errors} required={mandatory} disabled={disabled}>
        <Flex
          direction={oneLiner ? { base: "column", md: "row" } : "column"}
          align={oneLiner ? { base: "stretch", md: "flex-start" } : "stretch"}
          gap={oneLiner ? 4 : 2}
          w="full"
        >
          {text && (
            <Box w={labelWidth} pt={oneLiner ? 2 : 0}>
              <Field.Label
                htmlFor={name}
                fontSize="md"
                fontWeight="semibold"
                transition="color 0.2s"
                _invalid={{ color: "red.500" }}
                mb={oneLiner ? 0 : 1}
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

          <Box w={inputWidth} position="relative">
            <Textarea
              {...methods.register(name, {
                required: mandatory ? `${text} is required` : false,
                maxLength: maxLength
                  ? { value: maxLength, message: `Max length is ${maxLength}` }
                  : undefined,
                minLength: minLength
                  ? { value: minLength, message: `Min length is ${minLength}` }
                  : undefined,
              })}
              id={name}
              placeholder={oneLiner ? description : ""}
              disabled={disabled}
              bg={inputBg}
              borderRadius="lg"
              borderWidth="1.5px"
              borderColor={inputBorder}
              _hover={{ borderColor: inputHoverBorder }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                bg: inputFocusBg,
              }}
              _invalid={{
                borderColor: "red.500",
                boxShadow: "0 0 0 1px rgba(229, 62, 62, 0.6)",
              }}
              transition="all 0.2s"
              onChange={handleTextAreaChange}
              /**
               * Autocomplete fix:
               * Textarea fields don't benefit from standard autocomplete tokens
               * (they're for long-form content, not autofilled values), so we
               * explicitly opt them out of prediction to silence the browser
               * warning while keeping paste/spellcheck functional.
               * The `name` attribute still allows password managers to save
               * form data — "off" only prevents field-level auto-suggestions.
               */
              autoComplete="off"
            />

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

export default memo(TextArea);
