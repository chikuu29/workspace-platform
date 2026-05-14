import React, { useEffect, useState, useCallback, memo, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Spinner,
  Center,
  IconButton,
} from "@chakra-ui/react";
import {
  Database,
  Layers,
  Eye,
  Box as BoxIcon,
  Scale,
  HardDrive,
  DatabaseBackup,
  Files,
  Check,
  Activity,
  RefreshCw
} from "lucide-react";
import { GETAPI } from "../../../app/api";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#3b82f6,#6366f1)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
];

const getGradient = (index: number): string => {
  return STAT_GRADIENTS[index % STAT_GRADIENTS.length];
};

// ─── DBStatCard ──────────────────────────────────────────────────────────────

interface DBStatCardProps {
  icon: any;
  label: string;
  value: string | number;
  index: number;
}

const DBStatCard = memo(({ icon, label, value, index }: DBStatCardProps) => {
  const gradient = useMemo(() => getGradient(index), [index]);

  return (
    <Card
      backdropFilter="blur(24px)"
      boxShadow="app.shadow.glass-glow"
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 40px -8px rgba(99,102,241,0.18)",
        borderColor: "rgba(99,102,241,0.3)",
      }}
    >
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
  );
});

DBStatCard.displayName = "DBStatCard";

// ─── Main Component ──────────────────────────────────────────────────────────

const DatabaseStatistics = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    GETAPI({
      path: "app/getDataBaseStatisics",
      isPrivateApi: true,
      enableCache: false,
    }).subscribe((res) => {
      if (res.success) {
        setReport(res["result"]);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !report) {
    return (
      <Center py={40}>
        <VStack gap={4}>
          <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
          <Text color="app.text.muted" fontWeight="600">Analyzing database...</Text>
        </VStack>
      </Center>
    );
  }

  const stats = [
    { icon: Database, label: "Database", value: report?.db },
    { icon: Layers, label: "Collections", value: report?.collections },
    { icon: Eye, label: "Views", value: report?.views },
    { icon: BoxIcon, label: "Objects", value: report?.objects },
    { icon: Scale, label: "Avg Object Size", value: `${(report?.avgObjSize || 0).toFixed(2)} bytes` },
    { icon: HardDrive, label: "Data Size", value: `${report?.dataSize || 0} bytes` },
    { icon: DatabaseBackup, label: "Storage Size", value: `${report?.storageSize || 0} bytes` },
    { icon: Files, label: "Indexes", value: report?.indexes },
    { icon: Activity, label: "Index Size", value: `${report?.indexSize || 0} bytes` },
    { icon: Check, label: "Status", value: report?.ok === 1 ? "Healthy" : "Attention" },
  ];

  return (
    <PageLayout
      onRefresh={fetchStats}
      isRefreshing={loading}
      title="System Health"
      icon={Activity}
      subtitle="Database performance and metrics."
    >

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={6}>
        {stats.map((stat, idx) => (
          <DBStatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            index={idx}
          />
        ))}
      </SimpleGrid>
    </PageLayout>
  );
};

export default memo(DatabaseStatistics);
