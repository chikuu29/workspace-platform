import { Button, useDisclosure, Dialog, Portal, Icon } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { Repeat } from 'lucide-react';

interface AppVersionInterface {
  isNewVersionAvailable: boolean;
  version?: string;
}

const AppVersionAlert: React.FC<AppVersionInterface> = ({
  isNewVersionAvailable,
  version,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null); // Reference for the least destructive action (Cancel)

  const handleRefresh = () => {
    window.location.reload(); // Refreshes the page
  };

  useEffect(() => {
    if (isNewVersionAvailable) {
      onOpen();
    }
  }, [isNewVersionAvailable, onOpen]);

  return (
    <Dialog.Root
      open={open}
      initialFocusEl={() => cancelRef.current}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside={false}
      role="alertdialog"
    >
      <Portal>

        <Dialog.Backdrop>
          <div className="pyro">
            <div className="before"></div>
            <div className="after"></div>
          </div>
        </Dialog.Backdrop>
        <Dialog.Positioner>
          <Dialog.Content borderRadius={"15px"}>
            <Dialog.Header
              fontSize="lg"
              fontWeight="bold"
              color={"green"}
              textAlign={"center"}
              borderRadius={"15px"}
            >
              New Version Available
            </Dialog.Header>
            <Dialog.Body textAlign="center" fontWeight={100}>
              A new version is available. You're currently running an older
              version. Please refresh to update.
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                colorPalette="green"
                variant="outline"
                onClick={handleRefresh}
                ml={3}
                width="100%"><Icon as={Repeat} style={{ animation: "spin 2s linear infinite" }} />Refresh Now
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AppVersionAlert;
