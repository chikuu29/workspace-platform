
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { clearGlobalError } from '@/app/slices/errorSlice';
import { ErrorSummary } from '@/components/common/ErrorSummary';
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogActionTrigger,
    DialogCloseTrigger
} from "@/components/ui/dialog";
import { Button } from "@chakra-ui/react";

export const GlobalErrorDisplay = () => {
    const dispatch = useDispatch();
    // Safe access using 'as any' if types are not perfectly updated yet or explicit type
    const { globalError } = useSelector((state: RootState) => (state as any).error || {});
    console.log("GlobalErrorDisplay", globalError);
    const handleClose = () => {
        dispatch(clearGlobalError());
    };

    if (!globalError) return null;

    return (
        <DialogRoot open={!!globalError} onOpenChange={(details) => !details.open && handleClose()} placement="center" motionPreset="slide-in-bottom" >
            <DialogContent boxShadow="0 0 20px rgba(255, 0, 0, 0.3)" border="1px solid" borderColor="red.200" borderRadius="20px">
                <DialogHeader>
                    <DialogTitle color="red.600">Action Failed</DialogTitle>
                    <DialogCloseTrigger onClick={handleClose} />
                </DialogHeader>
                <DialogBody>
                    {/* Reuse our nice summary component logic, or just render it directly */}
                    <ErrorSummary error={globalError} />
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};
