import React, { Suspense, lazy, useMemo } from "react";
import DynamicIcon from "../app/renderDynamicIcons";
import { Steps, Box, Spinner } from "@chakra-ui/react";

// Function to create a lazy-loaded icon component
const createIconComponent = (iconName: string) => {
  return lazy(async () => {
    const iconModule = await DynamicIcon(iconName);
    return { default: iconModule };
  });

};

// Optimizing AsyncLoadIcon with React.memo
const AsyncLoadIcon = React.memo(({ iconName }: { iconName: string }) => {

  // console.log("===Calling AsynLoadIcon==", iconName);

  const IconComponent = useMemo(
    () => createIconComponent(iconName),
    [iconName]
  )
  return (
    <Suspense fallback={<Spinner size="sm" />}>
      <Box boxSize="24px">
        <IconComponent />
      </Box>
    </Suspense>
  );
});

export default AsyncLoadIcon;
