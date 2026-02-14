import React from 'react';
import { Box, Text, Stat, Flex } from "@chakra-ui/react";

const KPITile = ({ label, value, helpText, trend, ...props }: any) => {
    return (
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white" {...props}>
            <Stat.Root>
                <Stat.Label>{label}</Stat.Label>
                <Stat.ValueText>{value}</Stat.ValueText>
                {helpText && <Stat.HelpText>{helpText}</Stat.HelpText>}
            </Stat.Root>
        </Box>
    );
};

export default KPITile;
