import { Box, Flex, Text, VStack, Icon, SimpleGrid } from "@chakra-ui/react";
import { ShieldCheck, Terminal, Zap } from "lucide-react";
import { memo } from "react";
import { Card } from "@/core/components/Card";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: any;
    gradient: string;
}

const StatCard = memo(({ label, value, icon, gradient }: StatCardProps) => (
    <Card
        backdropFilter="blur(24px)"
        boxShadow="app.shadow.glass-glow"
        p={5}
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px -8px rgba(99,102,241,0.18)",
            borderColor: "rgba(99,102,241,0.3)",
        }}
    >
        {/* Gradient accent strip */}
        <Box h="3px" position="absolute" top={0} left={0} right={0} bgGradient={gradient} />

        <VStack align="start" gap={4}>
            <Box
                w="44px"
                h="44px"
                borderRadius="xl"
                bgGradient={gradient}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 16px -4px rgba(0,0,0,0.15)"
            >
                <Icon as={icon} boxSize={5} color="white" />
            </Box>

            <VStack align="start" gap={1}>
                <Text fontSize="xs" fontWeight="700" color="app.text.muted" textTransform="uppercase" letterSpacing="0.05em">
                    {label}
                </Text>
                <Text fontSize="xl" fontWeight="800" color="app.text.primary" letterSpacing="-0.5px">
                    {value}
                </Text>
            </VStack>
        </VStack>
    </Card>
));

StatCard.displayName = "StatCard";

export const OAuthStats = memo(({ totalClients, activeOAuth }: { totalClients: number, activeOAuth: number }) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
            <StatCard
                label="Total Clients"
                value={totalClients}
                icon={Terminal}
                gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
            />
            <StatCard
                label="Active OAuth"
                value={activeOAuth}
                icon={ShieldCheck}
                gradient="linear-gradient(135deg, #10b981 0%, #3b82f6 100%)"
            />
            <StatCard
                label="API Performance"
                value="99.9%"
                icon={Zap}
                gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
            />
        </SimpleGrid>
    );
});

OAuthStats.displayName = "OAuthStats";
