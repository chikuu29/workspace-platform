import React, { useCallback } from 'react';
import {
    Button,
    Field,
    Input,
    VStack,
    Textarea,
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

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = React.memo(({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleFormSubmit = useCallback((data: any) => {
        onSubmit(data);
        reset();
    }, [onSubmit, reset]);

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="md" placement="center" motionPreset="slide-in-bottom">
            <DialogBackdrop backdropFilter="blur(5px)" bg="blackAlpha.500" />
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
                    <DialogTitle fontSize="xl" fontWeight="bold">Create New Role</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={4} as="form" id="role-form" onSubmit={handleSubmit(handleFormSubmit)}>
                        <Field.Root invalid={!!errors.role_name}>
                            <Field.Label htmlFor="role_name">Role Name</Field.Label>
                            <Input
                                id="role_name"
                                {...register('role_name', { required: 'Role name is required' })}
                                placeholder="e.g. Editor, Support, Manager"
                                borderRadius="lg"
                            />
                            <Field.ErrorText>{errors.role_name?.message as string}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.description}>
                            <Field.Label htmlFor="description">Description</Field.Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Briefly describe the responsibilities of this role..."
                                borderRadius="lg"
                                rows={3}
                            />
                            <Field.ErrorText>{errors.description?.message as string}</Field.ErrorText>
                        </Field.Root>
                    </VStack>
                </DialogBody>
                <DialogFooter gap={3}>
                    <Button variant="ghost" onClick={onClose} borderRadius="lg">Cancel</Button>
                    <Button
                        type="submit"
                        form="role-form"
                        loading={isLoading}
                        bg="app.gradient.premium"
                        color="white"
                        borderRadius="lg"
                        px={8}
                        fontWeight="600"
                        _hover={{ filter: "brightness(1.1)" }}
                    >
                        Create Role
                    </Button>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    );
});

export default RoleModal;
