import { Box, Flex, Input, Field, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useMemo, memo, useCallback } from "react";
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
  events?: any;
  errors: FieldError;
  pattern?: string;
  patternMessage?: string;
  /** Explicit autocomplete token. Falls back to a sensible default derived from `name`/`type`. */
  autoComplete?: string;
}

/**
 * Derives a reasonable HTML autocomplete attribute value from the field's
 * name and input type. This satisfies the browser's autofill heuristics and
 * eliminates the DevTools accessibility warning:
 *   "A form field has an id/name recognized by autofill but no autocomplete attribute."
 *
 * We intentionally avoid "off" — that disables autofill entirely, which is
 * bad UX. Instead we map to the closest standard token so the browser can
 * still assist the user correctly.
 */
function deriveAutoComplete(name: string, type: string): string {
  const n = name.toLowerCase();

  // Explicit type mappings
  if (type === "email") return "email";
  if (type === "password") return "current-password";
  if (type === "tel") return "tel";
  if (type === "url") return "url";

  // Name-fragment heuristics (order matters — most specific first)
  if (n.includes("confirm") && n.includes("password")) return "new-password";
  if (n.includes("new") && n.includes("password")) return "new-password";
  if (n.includes("password")) return "current-password";
  if (n.includes("email")) return "email";
  if (n.includes("phone") || n.includes("mobile")) return "tel";
  if (n.includes("first") && n.includes("name")) return "given-name";
  if (n.includes("last") && n.includes("name")) return "family-name";
  if (n.includes("name")) return "name";
  if (n.includes("user")) return "username";
  if (n.includes("address") && n.includes("line")) return "address-line1";
  if (n.includes("city")) return "address-level2";
  if (n.includes("state")) return "address-level1";
  if (n.includes("zip") || n.includes("postal")) return "postal-code";
  if (n.includes("country")) return "country";
  if (n.includes("org") || n.includes("company")) return "organization";
  if (n.includes("dob") || n.includes("birth")) return "bday";
  if (n.includes("url") || n.includes("website")) return "url";

  // Fallback — tell the browser this is an arbitrary field; disables prediction
  // without fully opting out of autofill (which "off" would do).
  return "on";
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
  pattern,
  patternMessage,
  autoComplete,
}: TEXTFIELD) => {
  if (hidden) return null;

  const methods = useFormContext();
  const control = methods.control;

  const value = useWatch({ control, name });

  // Debounced rule engine — avoids firing on every keystroke
  const debouncedRule = useMemo(() => {
    let timer: any;
    return (val: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (events) {
          ruleEngine.processEvents(events, val, "change", methods);
        }
      }, 300);
    };
  }, [events, methods]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, rhfOnChange: any) => {
      const val = e.target.value;
      rhfOnChange(e);      // RHF internal update
      debouncedRule(val);  // Rule engine (debounced)
    },
    [debouncedRule],
  );

  const handleClear = useCallback(() => {
    methods.setValue(name, "", { shouldValidate: true });
    if (events) {
      ruleEngine.processEvents(events, "", "change", methods);
    }
  }, [methods, name, events]);

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const inputWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  // Pattern compilation — memoized to avoid recomputing per render
  const patternValue = useMemo(() => {
    if (pattern) {
      try {
        return new RegExp(pattern);
      } catch {
        console.error("TextField: invalid pattern regex →", pattern);
        return undefined;
      }
    }
    if (type === "email") {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }
    return undefined;
  }, [pattern, type]);

  /**
   * Resolve the autocomplete token:
   *  1. Explicit prop wins (lets the config override per-field).
   *  2. Fall back to heuristic derivation from name + type.
   *
   * This satisfies the Chrome/Firefox DevTools a11y audit:
   *   "A form field recognized by autofill has no autocomplete attribute."
   */
  const resolvedAutoComplete = autoComplete ?? deriveAutoComplete(name, type);

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
                fontSize="md"
                fontWeight="semibold"
                transition="color 0.2s"
              >
                <Flex as="span" align="center" gap={1}>
                  {text}
                  {/* Mandatory indicator rendered explicitly so it's
                      always visible — Field.RequiredIndicator only shows
                      when Field.Root has required={true}, but we also
                      want consistent asterisk styling across themes. */}
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

          <Box w={inputWidth}>
            <HStack gap={2} w="full" align="center">
              {(() => {
                const { onChange, ...restRegister } = methods.register(name, {
                  required: mandatory ? `${text} is required` : false,
                  maxLength: maxLength
                    ? { value: maxLength, message: `Max length is ${maxLength}` }
                    : undefined,
                  minLength: minLength
                    ? { value: minLength, message: `Min length is ${minLength}` }
                    : undefined,
                  pattern: patternValue
                    ? {
                        value: patternValue,
                        message:
                          patternMessage ||
                          (type === "email" ? "Invalid email address" : "Invalid format"),
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
                    _hover={{ borderColor: "app.input.border.focus" }}
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
                    // ── Autofill fix ──────────────────────────────────────────
                    // Derived from field name/type; satisfies browser autofill
                    // heuristics without disabling user-beneficial suggestions.
                    autoComplete={resolvedAutoComplete}
                    onChange={(e) => handleChange(e, onChange)}
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

            <Flex mt={2} gap={4} align="center" justify={oneLiner ? "space-between" : "flex-start"}>
              <Field.ErrorText fontSize="md" color="red.500" fontWeight="medium">
                <Field.ErrorIcon />
                {errors?.message?.toString()}
              </Field.ErrorText>
              {maxLength && (
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color={value?.length > maxLength ? "red.500" : "fg.subtle"}
                >
                  {value?.length || 0} / {maxLength}
                </Text>
              )}
            </Flex>
          </Box>
        </Flex>
      </Field.Root>
    </Box>
  );
};

export default memo(TextField);
