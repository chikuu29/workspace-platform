import {
  Box,
  Flex,
  RadioGroup,
  Stack,
  Field,
  Text,
  IconButton,
  Circle,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { memo } from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { X, Check } from "lucide-react";
import { ruleEngine } from "../engine/logicEngine";
import React from "react";

interface RADIO {
  name: string;
  text: string;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: string;
  mandatory?: boolean;
  oneLiner?: boolean;
  outLineBorder?: boolean;
  events?: any;
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
    methods.setValue(name, "", { shouldValidate: true });
    if (events) {
      ruleEngine.processEvents(events, "", "change", methods);
    }
  };

  const handleRadioChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      methods.setValue(name, newValue, { shouldValidate: true });
      if (events) {
        ruleEngine.processEvents(events, newValue, "change", methods);
      }
    },
    [methods, name, events],
  );

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const contentWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  // ─── All color values hoisted at component level (Rules of Hooks) ────────────
  const selectedBg = useColorModeValue("blue.50", "blue.900/40");
  const selectedBorder = useColorModeValue("blue.500", "blue.400");
  const selectedText = useColorModeValue("blue.700", "blue.200");
  const unselectedBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const unselectedBg = useColorModeValue("white", "whiteAlpha.50");
  const unselectedText = useColorModeValue("gray.600", "gray.400");
  const hoverBorder = useColorModeValue("blue.300", "blue.500");
  const hoverBg = useColorModeValue("blue.50/50", "blue.900/20");
  const indicatorBg = useColorModeValue("blue.500", "blue.400");
  const indicatorUnselBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const indicatorUnselBorder = useColorModeValue("gray.300", "whiteAlpha.300");
  const labelColor = errors
    ? "red.500"
    : useColorModeValue("gray.700", "gray.200");

  /**
   * Accessibility: WAI-ARIA 1.2 §3.15 radio group pattern.
   * - Label is a <span id=labelId> (not <label htmlFor>)
   * - RadioGroup.Root gets aria-labelledby={labelId}
   * This eliminates the "label's for attribute doesn't match any element id"
   * browser warning — RadioGroup.Root renders a <div>, not a labelable input.
   */
  const labelId = `${name}-label`;

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
              {/* ── Label as <span> + aria-labelledby → no label-for mismatch ── */}
              <Flex align="center" gap={1} mb={oneLiner ? 0 : 1}>
                <Text
                  as="span"
                  id={labelId}
                  display="block"
                  fontSize="md"
                  fontWeight="semibold"
                  transition="color 0.2s"
                // color={labelColor}
                >
                  {text}
                </Text>
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
              aria-labelledby={text ? labelId : undefined}
              aria-required={mandatory}
            >
              <Flex direction="column" gap={3}>
                <Stack direction="row" gap={3} flexWrap="wrap" w="full" align="center">
                  {options.map((option) => {
                    const isSelected = String(value) === String(option.value);
                    return (
                      <RadioGroup.Item
                        key={option.value}
                        value={String(option.value)}
                        position="relative"
                        px={4}
                        py={2.5}
                        borderRadius="xl"
                        borderWidth="1.5px"
                        borderColor={isSelected ? selectedBorder : unselectedBorder}
                        bg={isSelected ? selectedBg : unselectedBg}
                        _hover={{
                          borderColor: isSelected ? selectedBorder : hoverBorder,
                          bg: isSelected ? selectedBg : hoverBg,
                        }}
                        transition="all 0.2s cubic-bezier(0.4,0,0.2,1)"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2.5}
                        minW="110px"
                        flex="1"
                        {...methods.register(name, {
                          required: mandatory ? `${text} is required` : false,
                        })}
                      >
                        <RadioGroup.ItemHiddenInput onChange={handleRadioChange} />

                        {/* ── Visual circle indicator (replaces native radio dot) ── */}
                        <Circle
                          size="18px"
                          flexShrink={0}
                          bg={isSelected ? indicatorBg : "transparent"}
                          borderWidth="2px"
                          borderColor={isSelected ? indicatorBg : indicatorUnselBorder}
                          transition="all 0.2s"
                        >
                          {isSelected && (
                            <Check
                              size={10}
                              color="white"
                              strokeWidth={3}
                            />
                          )}
                        </Circle>

                        {/* Option icon (optional) */}
                        {option.icon && (
                          <Box
                            flexShrink={0}
                            color={isSelected ? selectedBorder : unselectedText}
                            transition="color 0.2s"
                          >
                            {option.icon}
                          </Box>
                        )}

                        <RadioGroup.ItemText
                          fontWeight={isSelected ? "700" : "500"}
                          fontSize="sm"
                          color={isSelected ? selectedText : unselectedText}
                          transition="all 0.2s"
                        >
                          {option.label}
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
                    );
                  })}

                  {/* Clear selection button */}
                  {value && !disabled && (
                    <IconButton
                      size="md"
                      variant="outline"
                      aria-label="Clear selection"
                      onClick={clearSelection}
                      color="fg.muted"
                    // _hover={{ bg: "red.50", color: "red.500" }}
                    // _dark={{ _hover: { bg: "red.900/30", color: "red.400" } }}
                    >
                      <X />
                    </IconButton>
                  )}
                </Stack>

                <Field.ErrorText fontSize="sm" color="red.500" fontWeight="medium">
                  <Field.ErrorIcon /> {errors?.message?.toString()}
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
