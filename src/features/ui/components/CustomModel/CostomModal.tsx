// CustomModal.js
import React from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { Steps, Button, Dialog, Portal } from "@chakra-ui/react";

const CustomModal = ({
  isOpen,
  onClose,
  size = "md",
  title,
  children,
  onSubmit,
}: any) => {
  return (
    <Dialog.Root open={isOpen} size='xl' onOpenChange={e => {
      if (!e.open) {
        onClose();
      }
    }}>
      <Portal>

        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg={useColorModeValue('white','gray.950')}>
            <Dialog.Header>{title}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>{children}</Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="blue" mr={3} onClick={onSubmit}>
                Submit
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
};

export default CustomModal;
