import React, { useCallback, useEffect } from "react";
import {
    VStack,
    HStack,
    Input,
    Box,
    Tag,
    SimpleGrid,
    Text,
    Flex,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { GrSystem } from "react-icons/gr";
import {
    LuCheck,
    LuKeyRound,
    LuGlobe,
    LuSettings2,
    LuShieldCheck,
    LuLock,
} from "react-icons/lu";

interface OAuthClientFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
    actionMode: string;
    serverErrors?: Record<string, string>;
}

/* ─────────────────────────────────
   Shared UI primitives
   ───────────────────────────────── */

const FormSection = ({
    title,
    icon,
    accentColor = "blue.400",
    children,
}: {
    title: string;
    icon: React.ReactElement;
    accentColor?: string;
    children: React.ReactNode;
}) => (
    <Box w="100%" position="relative">
        {/* Section header */}
        <HStack gap={2.5} mb={5}>
            <Flex
                align="center"
                justify="center"
                w={7}
                h={7}
                borderRadius="lg"
                bg={`color-mix(in srgb, var(--chakra-colors-${accentColor.replace(".", "-")}) 14%, transparent)`}
                color={accentColor}
                flexShrink={0}
            >
                {icon}
            </Flex>
            <Text
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.12em"
                color={accentColor}
            >
                {title}
            </Text>
            <Box flex={1} h="1px" bg="app.navbar.border" opacity={0.5} />
        </HStack>
        <Box pl={0}>{children}</Box>
    </Box>
);

/** Inline row: label on the left, content on the right — one field per line */
const InlineRow = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <Box w="100%">
        <HStack gap={4} w="100%" align="center" py={1}
            border={error ? "1px solid" : "none"}
            borderColor={error ? "red.500" : "transparent"}
            borderRadius="lg"
            px={error ? 2 : 0}
            bg={error ? "rgba(239,68,68,0.04)" : "transparent"}
            transition="all 0.2s"
        >
            <Text
                fontSize="sm"
                fontWeight="600"
                color={error ? "red.400" : "app.text.muted"}
                w="160px"
                flexShrink={0}
            >
                {label}
            </Text>
            <Flex flex={1} wrap="wrap" gap={2}>
                {children}
            </Flex>
        </HStack>
        {error && (
            <HStack gap={1.5} mt={1} pl={2}>
                <Text fontSize="xs" color="red.400" fontWeight="500">
                    ⚠ {error}
                </Text>
            </HStack>
        )}
    </Box>
);

/**
 * RadioPill — identical look to ToggleChip but for single-select (radio) fields.
 * No native radio bullet; uses an animated check icon instead.
 */
const RadioPill = ({
    label,
    isSelected,
    onClick,
    accentColor = "purple",
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    accentColor?: string;
}) => {
    const colors: Record<string, { border: string; bg: string; bgHover: string; text: string }> = {
        purple: { border: "purple.400", bg: "rgba(168,85,247,0.12)", bgHover: "rgba(168,85,247,0.18)", text: "purple.300" },
        blue: { border: "blue.400", bg: "rgba(59,130,246,0.12)", bgHover: "rgba(59,130,246,0.18)", text: "blue.300" },
        orange: { border: "orange.400", bg: "rgba(251,146,60,0.12)", bgHover: "rgba(251,146,60,0.18)", text: "orange.300" },
        teal: { border: "teal.400", bg: "rgba(45,212,191,0.12)", bgHover: "rgba(45,212,191,0.18)", text: "teal.300" },
    };
    const c = colors[accentColor] ?? colors.purple;

    return (
        <button
            type="button"
            onClick={onClick}
            style={{ display: "inline-flex", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
            <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
                minW="110px"
                px={isSelected ? 3 : 3.5}
                py={1.5}
                borderRadius="md"
                border="1.5px solid"
                borderColor={isSelected ? c.border : "app.navbar.border"}
                bg={isSelected ? c.bg : "transparent"}
                color={isSelected ? c.text : "app.text.muted"}
                fontWeight={isSelected ? "600" : "500"}
                fontSize="13px"
                cursor="pointer"
                transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                _hover={{
                    borderColor: c.border,
                    bg: isSelected ? c.bgHover : "rgba(168,85,247,0.06)",
                    color: isSelected ? c.text : "app.text.primary",
                    transform: "translateY(-1px)",
                    boxShadow: `0 4px 12px -4px ${c.bg}`,
                }}
                _active={{ transform: "scale(0.96)" }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        width: isSelected ? "16px" : "0px",
                        overflow: "hidden",
                        transition: "width 0.2s cubic-bezier(.4,0,.2,1), opacity 0.15s",
                        opacity: isSelected ? 1 : 0,
                        flexShrink: 0,
                    }}
                >
                    <LuCheck size={14} />
                </span>
                {label}
            </Box>
        </button>
    );
};

/** Reusable wrapper that plugs RadioPill into a single-select list */
const RadioPillGroup = ({
    options,
    value,
    onChange,
    accentColor,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
    accentColor?: string;
}) => (
    <Flex wrap="wrap" gap={2}>
        {options.map(opt => (
            <RadioPill
                key={opt.value}
                label={opt.label}
                isSelected={value === opt.value}
                onClick={() => onChange(opt.value)}
                accentColor={accentColor}
            />
        ))}
    </Flex>
);

/** Modern toggle chip with animation */
const ToggleChip = ({
    label,
    isSelected,
    onClick,
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        style={{ display: "inline-flex", background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
        <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            minW="110px"
            px={isSelected ? 3 : 3.5}
            py={1.5}
            borderRadius="md"
            border="1.5px solid"
            borderColor={isSelected ? "blue.400" : "app.navbar.border"}
            bg={isSelected ? "rgba(59, 130, 246, 0.12)" : "transparent"}
            color={isSelected ? "blue.300" : "app.text.muted"}
            fontWeight={isSelected ? "600" : "500"}
            fontSize="13px"
            textTransform="capitalize"
            cursor="pointer"
            transition="all 0.2s cubic-bezier(.4,0,.2,1)"
            _hover={{
                borderColor: "blue.400",
                bg: isSelected ? "rgba(59, 130, 246, 0.16)" : "rgba(59, 130, 246, 0.06)",
                color: isSelected ? "blue.200" : "app.text.primary",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px -4px rgba(59, 130, 246, 0.2)",
            }}
            _active={{ transform: "scale(0.96)" }}
        >
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: isSelected ? "16px" : "0px",
                    overflow: "hidden",
                    transition: "width 0.2s cubic-bezier(.4,0,.2,1), opacity 0.15s",
                    opacity: isSelected ? 1 : 0,
                    flexShrink: 0,
                }}
            >
                <LuCheck size={14} />
            </span>
            {label}
        </Box>
    </button>
);

/** Reusable multi-toggle field */
const MultiToggleField = ({
    label,
    options,
    value,
    onChange,
    error,
}: {
    label: string;
    options: { value: string; label: string }[];
    value: string[];
    onChange: (val: string[]) => void;
    error?: string;
}) => {
    const toggle = (optVal: string) => {
        const current = value || [];
        onChange(
            current.includes(optVal)
                ? current.filter((v) => v !== optVal)
                : [...current, optVal]
        );
    };

    return (
        <Field label={label} invalid={!!error} errorText={error}>
            <Flex wrap="wrap" gap={2}>
                {options.map((opt) => (
                    <ToggleChip
                        key={opt.value}
                        label={opt.label}
                        isSelected={(value || []).includes(opt.value)}
                        onClick={() => toggle(opt.value)}
                    />
                ))}
            </Flex>
        </Field>
    );
};

/** Dynamic tag input for URLs */
const DynamicTagField = ({
    label,
    placeholder,
    fieldName,
    watch,
    setValue,
    colorPalette = "blue",
    required = false,
    error,
}: {
    label: string;
    placeholder: string;
    fieldName: string;
    watch: any;
    setValue: any;
    colorPalette?: string;
    required?: boolean;
    error?: string;
}) => {
    const values = watch(fieldName) || [];
    const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !values.includes(val)) {
                setValue(fieldName, [...values, val], { shouldValidate: true });
                e.currentTarget.value = "";
            }
        }
    };
    const handleRemove = (index: number) => {
        setValue(fieldName, values.filter((_: any, i: number) => i !== index), { shouldValidate: true });
    };

    return (
        <Field label={`${label}${required ? " *" : ""}`} w="100%" invalid={!!error} errorText={error}>
            <Input
                onKeyDown={handleAdd}
                placeholder={placeholder}
                borderRadius="xl"
                _focus={{ borderColor: `${colorPalette}.400`, boxShadow: `0 0 0 1px var(--chakra-colors-${colorPalette}-400)` }}
            />
            {values.length > 0 && (
                <Flex wrap="wrap" mt={2} gap={1.5}>
                    {values.map((v: string, i: number) => (
                        <Tag.Root
                            key={i}
                            colorPalette={colorPalette}
                            variant="subtle"
                            borderRadius="full"
                            size="sm"
                        >
                            <Tag.Label fontSize="xs">{v}</Tag.Label>
                            <Tag.EndElement>
                                <Tag.CloseTrigger onClick={() => handleRemove(i)} />
                            </Tag.EndElement>
                        </Tag.Root>
                    ))}
                </Flex>
            )}
        </Field>
    );
};

/* ─────────────────────────────────
   Main Form
   ───────────────────────────────── */

export const OAuthClientForm = ({ initialData, onSubmit, actionMode, serverErrors = {} }: OAuthClientFormProps) => {
    const { register, handleSubmit, control, setValue, watch, setError, formState: { errors } } = useForm({
        defaultValues: initialData || {
            client_id: "",
            client_name: "",
            redirect_urls: [],
            post_logout_redirect_urls: [],
            allowed_origins: [],
            skip_authorization: false,
            authorization_grant_types: [],
            client_type: "confidential",
            algorithm: "HS256",
            grant_types: [],
            response_types: [],
            scope: [],
            token_endpoint_auth_method: "client_secret_basic",
        }
    });

    // Map server-side validation errors to form fields
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            Object.entries(serverErrors).forEach(([field, message]) => {
                setError(field as any, { type: "server", message });
            });
        }
    }, [serverErrors, setError]);

    // Fired by react-hook-form when validation fails on submit
    const handleFormError = useCallback((errs: Record<string, any>) => {
        const labels: Record<string, string> = {
            client_id: "Client ID",
            client_name: "Client Name",
            redirect_urls: "Redirect URLs",
            client_type: "Client Type",
            authorization_grant_types: "Auth Grant Types",
            grant_types: "Grant Types",
            response_types: "Response Types",
            scope: "Scopes",
        };
        const missing = Object.keys(errs)
            .map((k) => labels[k] || k)
            .join(", ");
        toaster.create({
            title: "Required fields missing",
            description: `Please fill in: ${missing}`,
            type: "error",
            duration: 5000,
        });
    }, []);

    return (
        <form id="client-form" onSubmit={handleSubmit(onSubmit, handleFormError)}>
            <VStack gap={8} py={2} align="stretch">

                {/* ── Identity ── */}
                <FormSection title="Identity" icon={<LuKeyRound size={16} />} accentColor="purple.400">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
                        <Field label="Client ID *" disabled={actionMode === "EDIT"} invalid={!!errors.client_id} errorText={errors.client_id?.message as string} w="100%">
                            <InputGroup flex="1" w="100%" startElement={<GrSystem />}>
                                <Input
                                    {...register("client_id", { required: "Client ID is required", minLength: { value: 6, message: "Min 6 chars" }, maxLength: { value: 50, message: "Max 50 chars" } })}
                                    placeholder="e.g. my_app_client"
                                    variant="subtle"
                                    borderRadius="xl"
                                />
                            </InputGroup>
                        </Field>
                        <Field label="Client Name *" invalid={!!errors.client_name} errorText={errors.client_name?.message as string} w="100%">
                            <Input
                                {...register("client_name", { required: "Client name is required" })}
                                placeholder="e.g. Production Auth"
                                borderRadius="xl"
                            />
                        </Field>
                    </SimpleGrid>
                    {/* No client_secret field — it is auto-generated by the backend on create */}
                </FormSection>

                {/* ── URLs & Origins ── */}
                <FormSection title="Endpoints & Origins" icon={<LuGlobe size={16} />} accentColor="blue.400">
                    <VStack gap={4} w="100%">
                        <Controller
                            name="redirect_urls"
                            control={control}
                            rules={{ validate: (v) => (v && v.length > 0) || "At least one redirect URL is required" }}
                            render={({ field }) => (
                                <DynamicTagField
                                    label="Redirect URLs (Press Enter)"
                                    placeholder="https://myapp.com/callback"
                                    fieldName="redirect_urls"
                                    watch={watch}
                                    setValue={(name: string, val: string[], opts?: any) => { setValue(name as any, val, opts); field.onChange(val); }}
                                    colorPalette="blue"
                                    required
                                    error={errors.redirect_urls?.message as string}
                                />
                            )}
                        />
                        <DynamicTagField label="Post-Logout Redirect URLs" placeholder="https://myapp.com/logout" fieldName="post_logout_redirect_urls" watch={watch} setValue={setValue} colorPalette="purple" />
                        <DynamicTagField label="Allowed Origins / CORS" placeholder="https://myapp.com" fieldName="allowed_origins" watch={watch} setValue={setValue} colorPalette="teal" />
                    </VStack>
                </FormSection>

                {/* ── Client Settings ── */}
                <FormSection title="Configuration" icon={<LuSettings2 size={16} />} accentColor="orange.400">
                    <VStack gap={3} w="100%" align="stretch">
                        <Controller name="client_type" control={control} rules={{ required: "Required" }} render={({ field }) => (
                            <InlineRow label="Client Type">
                                <RadioPillGroup
                                    options={[
                                        { value: "confidential", label: "Confidential" },
                                        { value: "public", label: "Public" },
                                        { value: "password", label: "Password" },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    accentColor="orange"
                                />
                            </InlineRow>
                        )} />
                        <Controller name="skip_authorization" control={control} render={({ field }) => (
                            <InlineRow label="Skip Authorization">
                                <RadioPillGroup
                                    options={[
                                        { value: "false", label: "No" },
                                        { value: "true", label: "Yes" },
                                    ]}
                                    value={field.value?.toString()}
                                    onChange={(v) => field.onChange(v === "true")}
                                    accentColor="orange"
                                />
                            </InlineRow>
                        )} />
                        <Controller name="algorithm" control={control} render={({ field }) => (
                            <InlineRow label="Algorithm">
                                <RadioPillGroup
                                    options={[
                                        { value: "HS256", label: "HS256" },
                                        { value: "RS256", label: "RS256" },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    accentColor="orange"
                                />
                            </InlineRow>
                        )} />
                        <Controller name="token_endpoint_auth_method" control={control} render={({ field }) => (
                            <InlineRow label="Auth Method">
                                <RadioPillGroup
                                    options={[
                                        { value: "client_secret_basic", label: "Secret Basic" },
                                        { value: "client_secret_post", label: "Secret Post" },
                                        { value: "none", label: "None (Public)" },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    accentColor="orange"
                                />
                            </InlineRow>
                        )} />
                    </VStack>
                </FormSection>

                {/* ── Capabilities ── */}
                <FormSection title="Capabilities" icon={<LuShieldCheck size={16} />} accentColor="green.400">
                    <VStack gap={3} w="100%" align="stretch">
                        <Controller
                            name="authorization_grant_types"
                            control={control}
                            rules={{ validate: (v) => (v && v.length > 0) || "Select at least one" }}
                            render={({ field }) => (
                                <InlineRow label="Auth Grant Types" error={errors.authorization_grant_types?.message as string}>
                                    {[
                                        { value: "authorization_code", label: "authorization code" },
                                        { value: "refresh_token", label: "refresh token" },
                                        { value: "implicit", label: "implicit" },
                                        { value: "client_credentials", label: "client credentials" },
                                        { value: "password", label: "password" },
                                    ].map(opt => (
                                        <ToggleChip
                                            key={opt.value}
                                            label={opt.label}
                                            isSelected={(field.value || []).includes(opt.value)}
                                            onClick={() => {
                                                const cur = field.value || [];
                                                field.onChange(cur.includes(opt.value) ? cur.filter((v: string) => v !== opt.value) : [...cur, opt.value]);
                                            }}
                                        />
                                    ))}
                                </InlineRow>
                            )}
                        />
                        <Controller
                            name="grant_types"
                            control={control}
                            rules={{ validate: (v) => (v && v.length > 0) || "Select at least one" }}
                            render={({ field }) => (
                                <InlineRow label="Grant Types" error={errors.grant_types?.message as string}>
                                    {[
                                        { value: "authorization_code", label: "authorization code" },
                                        { value: "refresh_token", label: "refresh token" },
                                        { value: "client_credentials", label: "client credentials" },
                                    ].map(opt => (
                                        <ToggleChip
                                            key={opt.value}
                                            label={opt.label}
                                            isSelected={(field.value || []).includes(opt.value)}
                                            onClick={() => {
                                                const cur = field.value || [];
                                                field.onChange(cur.includes(opt.value) ? cur.filter((v: string) => v !== opt.value) : [...cur, opt.value]);
                                            }}
                                        />
                                    ))}
                                </InlineRow>
                            )}
                        />
                        <Controller
                            name="response_types"
                            control={control}
                            rules={{ validate: (v) => (v && v.length > 0) || "Select at least one" }}
                            render={({ field }) => (
                                <InlineRow label="Response Types" error={errors.response_types?.message as string}>
                                    {[
                                        { value: "code", label: "code" },
                                        { value: "token", label: "token" },
                                        { value: "id_token", label: "id token" },
                                    ].map(opt => (
                                        <ToggleChip
                                            key={opt.value}
                                            label={opt.label}
                                            isSelected={(field.value || []).includes(opt.value)}
                                            onClick={() => {
                                                const cur = field.value || [];
                                                field.onChange(cur.includes(opt.value) ? cur.filter((v: string) => v !== opt.value) : [...cur, opt.value]);
                                            }}
                                        />
                                    ))}
                                </InlineRow>
                            )}
                        />
                    </VStack>
                </FormSection>

                {/* ── Scopes ── */}
                <FormSection title="Scopes" icon={<LuLock size={16} />} accentColor="cyan.400">
                    <Controller
                        name="scope"
                        control={control}
                        rules={{ validate: (v) => (v && v.length > 0) || "Select at least one scope" }}
                        render={({ field }) => (
                            <InlineRow label="Scopes" error={errors.scope?.message as string}>
                                {[
                                    { value: "openid", label: "openid" },
                                    { value: "profile", label: "profile" },
                                    { value: "email", label: "email" },
                                    { value: "roles", label: "roles" },
                                    { value: "read", label: "read" },
                                    { value: "write", label: "write" },
                                ].map(opt => (
                                    <ToggleChip
                                        key={opt.value}
                                        label={opt.label}
                                        isSelected={(field.value || []).includes(opt.value)}
                                        onClick={() => {
                                            const cur = field.value || [];
                                            field.onChange(cur.includes(opt.value) ? cur.filter((v: string) => v !== opt.value) : [...cur, opt.value]);
                                        }}
                                    />
                                ))}
                            </InlineRow>
                        )}
                    />
                </FormSection>

            </VStack>
        </form>
    );
};
