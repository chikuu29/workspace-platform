import React from "react";
import { Box, HStack, Stat, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

const SubKPITile = ({ config }: { config: any }) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.700", "gray.200");

  return (
    <VStack align="start" gap={0} p={2} bg={useColorModeValue("gray.50", "whiteAlpha.50")} borderRadius="md" flex="1">
      <Text fontSize="10px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">
        {config.label}
      </Text>
      <Text fontSize="md" fontWeight="800" color={valueColor}>
        {config.value}
      </Text>
    </VStack>
  );
};

const KPITile = ({ label, value, helpText, colorPalette, subKpis, ...props }: any) => {


  const bg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue(
    `${colorPalette ? `${colorPalette}.600` : "blue.600"}`,
    `${colorPalette ? `${colorPalette}.400` : "blue.400"}`
  );

  return (
    <Box
      p={5}
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      {...props}
    >
      <Stat.Root>
        <Stat.Label fontSize="sm" fontWeight="600" color={labelColor}>{label}</Stat.Label>
        <Stat.ValueText mt={1} fontSize="2xl" fontWeight="800" color={valueColor}>{value}</Stat.ValueText>
        {helpText && <Stat.HelpText fontSize="xs">{helpText}</Stat.HelpText>}
      </Stat.Root>

      {Array.isArray(subKpis) && subKpis.length > 0 && (
        <HStack gap={2} w="full" mt={4}>
          {subKpis.map((sub: any, idx: number) => <SubKPITile key={`${label}-${idx}`} config={sub} />)}
        </HStack>
      )}
    </Box>
  );
};

export default KPITile;
