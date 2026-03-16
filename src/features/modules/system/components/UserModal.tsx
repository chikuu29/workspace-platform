import React, { useCallback, useEffect } from 'react';
import {
    Button,
    Field,
    Input,
    VStack,
    HStack,
    Dialog,
} from '@chakra-ui/react';
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogBackdrop,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    organizationName: string;
    /** When provided the modal enters EDIT mode — form is pre-filled, password hidden */
    initialData?: any | null;
}

// ─── UserModal ────────────────────────────────────────────────────────────────

/**
 * UserModal — handles both CREATE and EDIT modes.
 *
 * - CREATE: all fields shown, password required.
 * - EDIT:   form pre-filled from `initialData`, password field hidden
 *           (password changes should go through a separate reset flow).
 */
const UserModal: React.FC<UserModalProps> = React.memo((
    { isOpen, onClose, onSubmit, isLoading = false, organizationName, initialData = null }
) => {
    const isEditMode = Boolean(initialData);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: initialData ?? {} });

    // Pre-fill form whenever the modal opens with new initialData
    useEffect(() => {
        if (isOpen) {
            reset(initialData ?? {});
        }
    }, [isOpen, initialData, reset]);

    const handleFormSubmit = useCallback(
        (data: any) => {
            onSubmit({ ...data, organization_name: organizationName });
        },
        [onSubmit, organizationName]
    );

    const handleClose = useCallback(() => {
        reset({});
        onClose();
    }, [reset, onClose]);

    return (
        <DialogRoot open={isOpen} onOpenChange={handleClose} size="lg" placement="center" motionPreset="slide-in-bottom" >
            <DialogBackdrop backdropFilter="blur(4px)" bg="black/40" />
            <DialogContent
                bg="app.bg"
                borderRadius="2xl"
                p={4}
                border="1px solid"
                borderColor="blue"
                boxShadow="0 0 40px rgba(251,146,60,0.15), 2xl"
                backdrop={false}
            >
                <DialogHeader>
                    <DialogTitle fontSize="xl" fontWeight="bold">
                        {isEditMode ? "Edit User" : "Add New User"}
                    </DialogTitle>
                </DialogHeader>

                <DialogBody>
                    <VStack gap={4} as="form" id="user-form" onSubmit={handleSubmit(handleFormSubmit)}>
                        <HStack w="full" gap={4}>
                            <Field.Root invalid={!!errors.first_name}>
                                <Field.Label>First Name</Field.Label>
                                <Input
                                    {...register('first_name', { required: 'First name is required' })}
                                    placeholder="John"
                                    borderRadius="lg"
                                />
                                <Field.ErrorText>{errors.first_name?.message as string}</Field.ErrorText>
                            </Field.Root>

                            <Field.Root invalid={!!errors.last_name}>
                                <Field.Label>Last Name</Field.Label>
                                <Input
                                    {...register('last_name', { required: 'Last name is required' })}
                                    placeholder="Doe"
                                    borderRadius="lg"
                                />
                                <Field.ErrorText>{errors.last_name?.message as string}</Field.ErrorText>
                            </Field.Root>
                        </HStack>

                        <Field.Root invalid={!!errors.username}>
                            <Field.Label>username</Field.Label>
                            <Input
                                {...register('username', { required: 'username is required' })}
                                placeholder="johndoe"
                                borderRadius="lg"
                                // username is readonly in edit mode (it's typically an immutable ID)
                                readOnly={isEditMode}
                                opacity={isEditMode ? 0.7 : 1}
                            />
                            <Field.ErrorText>{errors.username?.message as string}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.email}>
                            <Field.Label>Email Address</Field.Label>
                            <Input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                                })}
                                placeholder="john@example.com"
                                borderRadius="lg"
                            />
                            <Field.ErrorText>{errors.email?.message as string}</Field.ErrorText>
                        </Field.Root>

                        {/* Password — only shown in CREATE mode */}
                        {!isEditMode && (
                            <Field.Root invalid={!!errors.password}>
                                <Field.Label>Password</Field.Label>
                                <Input
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Min 6 characters' },
                                    })}
                                    placeholder="••••••••"
                                    borderRadius="lg"
                                />
                                <Field.ErrorText>{errors.password?.message as string}</Field.ErrorText>
                            </Field.Root>
                        )}

                        <Field.Root>
                            <Field.Label>Organization</Field.Label>
                            <Input value={organizationName} disabled borderRadius="lg" />
                            <Field.HelperText>Users belong to your current organization.</Field.HelperText>
                        </Field.Root>
                    </VStack>
                </DialogBody>

                <DialogFooter gap={3}>
                    <Button variant="ghost" onClick={handleClose} borderRadius="lg">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="user-form"
                        loading={isLoading}
                        bg="app.gradient.premium"
                        color="white"
                        borderRadius="lg"
                        px={8}
                        fontWeight="600"
                        _hover={{ filter: "brightness(1.1)" }}
                    >
                        {isEditMode ? "Save Changes" : "Create User"}
                    </Button>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    );
});

UserModal.displayName = "UserModal";
export default UserModal;
