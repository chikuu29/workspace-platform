import React, { useMemo } from "react";
import DynamicIcon from "../app/renderStaticIcon"; // Import your dynamic icon function
import { Steps, Box } from "@chakra-ui/react";

const LoadIcon = React.memo(({ iconName, ...rest }: { iconName: string, [key: string]: any }) => {
  //   console.log("===Calling AsyncLoadIcon==", iconName);

  // Use useMemo to memoize the icon component
  const IconComponent = useMemo(() => {
    return DynamicIcon(iconName); // Call the DynamicIcon function synchronously
  }, [iconName]);
  return (<Box boxSize="24px" {...rest}><IconComponent /></Box>);
});

export default LoadIcon;
