import React, { useState } from "react";
import { Box, Input, chakra, type InputProps } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ChakraButton = chakra("button");

const MotionBox = motion.create(Box);

interface AuthFormInputProps {
    /** The field label shown above the input */
    label: string;
    /** Icon rendered on the left side of the input */
    icon?: React.ReactNode;
    /** Validation error message */
    error?: string;
    /** Helper hint shown below the input (hidden when there is an error) */
    hint?: string;
    /** Whether this is a password field (adds show/hide toggle) */
    isPassword?: boolean;
    /** Whether the field is required */
    required?: boolean;
    /** Props forwarded to the underlying Chakra Input */
    inputProps?: InputProps & React.RefAttributes<HTMLInputElement>;
}

/**
 * AuthFormInput
 *
 * A polished, reusable form input for the authentication pages.
 * Features:
 *  - Icon slot on the left
 *  - Password show/hide toggle
 *  - Animated error message (slide‑down)
 *  - Semantic‑token powered light/dark styling
 *  - Focus glow consistent with the glassmorphism design system
 */
const AuthFormInput = React.forwardRef<HTMLInputElement, AuthFormInputProps>(
    ({ label, icon, error, hint, isPassword = false, required = false, inputProps = {} }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const inputType = isPassword ? (showPassword ? "text" : "password") : inputProps.type ?? "text";

        const eyeButton = isPassword ? (
            <ChakraButton
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="auth.text.muted"
                bg="transparent"
                border="none"
                _hover={{ color: "auth.text.accent" }}
                transition="color 0.2s"
                outline="none"
                cursor="pointer"
                px={1}
            >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </ChakraButton>
        ) : null;

        return (
            <Field
                label={label}
                required={required}
                w="100%"
                errorText={error}
                helperText={!error && hint ? hint : undefined}
                invalid={!!error}
                css={{
                    "& [data-part='label']": {
                        color: "auth.text.muted",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        marginBottom: "6px",
                    },
                    "& [data-part='helper-text']": {
                        color: "auth.text.muted",
                        fontSize: "0.75rem",
                        marginTop: "4px",
                    },
                }}
            >
                <InputGroup
                    flex="1"
                    w="100%"
                    startElement={
                        icon ? (
                            <Box color="auth.text.accent" display="flex" alignItems="center">
                                {icon}
                            </Box>
                        ) : undefined
                    }
                    endElement={eyeButton ?? undefined}
                >
                    <Input
                        ref={ref}
                        {...inputProps}
                        type={inputType}
                        size="lg"
                        borderRadius="xl"
                        bg="auth.input.bg"
                        borderColor="auth.input.border"
                        color="auth.text.primary"
                        _placeholder={{ color: "auth.text.muted", fontSize: "sm" }}
                        _focus={{
                            borderColor: "auth.input.border.focus",
                            boxShadow: "auth.input.glow",
                            outline: "none",
                        }}
                        _hover={{
                            borderColor: "auth.input.border.focus",
                        }}
                        _invalid={{
                            borderColor: "red.500",
                            boxShadow: "0 0 0 3px rgba(239,68,68,0.2)",
                        }}
                        transition="all 0.22s cubic-bezier(0.4,0,0.2,1)"
                        backdropFilter="blur(4px)"
                        fontSize="sm"
                        fontWeight={500}
                    />
                </InputGroup>
            </Field>
        );
    }
);

AuthFormInput.displayName = "AuthFormInput";

export default AuthFormInput;
