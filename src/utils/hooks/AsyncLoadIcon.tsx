import React, { useState, useEffect } from "react";
import DynamicIcon from "../app/renderDynamicIcons";
import { Box, Spinner } from "@chakra-ui/react";
import { IconType } from "react-icons";

// Refactored AsyncLoadIcon for better reliability and debugging
const AsyncLoadIcon = React.memo(({ iconName }: { iconName: string }) => {
  const [IconComponent, setIconComponent] = useState<IconType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const loadIcon = async () => {
      try {
        const icon = await DynamicIcon(iconName);
        if (isMounted) {
          setIconComponent(() => icon);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadIcon();
    return () => { isMounted = false; };
  }, [iconName]);

  if (loading) {
    return (
      <Box boxSize="4" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xs" />
      </Box>
    );
  }

  if (error || !IconComponent) {
    return <Box boxSize="4" bg="red.100" borderRadius="full" />;
  }

  return (
    <Box boxSize="4" display="flex" alignItems="center" justifyContent="center">
      <IconComponent size="16px" />
    </Box>
  );
});

export default AsyncLoadIcon;
