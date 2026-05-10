import { useEffect, useState } from "react";
import { Box, SimpleGrid, Center, Icon, VStack, HStack, Separator, Badge, Text, IconButton } from "@chakra-ui/react";
import { GETAPI } from "@/app/api";
import { Pencil, Trash2, LayoutGrid, Zap, ShieldCheck } from "lucide-react";
import { Card } from "@/core/components/Card";
import { actionEngine } from "@/core/engine/logicEngine";

const CardGrid = (props: any) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        if (props.apiPath) {
            fetchData();
        }
    }, [props.apiPath]);

    const fetchData = () => {
        GETAPI({
            path: props.apiPath,
            serverName: props.serverName || "core",
            isPrivateApi: true
        }).subscribe((res: any) => {
            if (res.success) {
                setData(res.result || res.data || []);
            }
        });
    };

    const handleAction = (actionType: string, item: any) => {
        const events = props.events || {};
        const config = events[actionType];
        if (!config || !config.length) return;

        console.log("Triggered Grid Action", actionType, "with item", item, "and config", config);
        config.forEach((evt: any) => {
            actionEngine.trigger(evt, item, fetchData);
        });
    };

    return (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6} p={0}>
            {data.map((item, i) => (
                <Card
                    key={i}
                    _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 40px -12px rgba(6,182,212,0.25)",
                        borderColor: "cyan.500/40",
                        "& .app-actions": { opacity: 1, transform: "translateX(0)" }
                    }}
                >
                    {/* Status Badge */}
                    <Box position="absolute" top={4} right={4}>
                        <Badge
                            variant="subtle"
                            colorPalette={item.is_active || item[props.cardProperties?.statusKey] ? "green" : "red"}
                            borderRadius="full"
                            px={2}
                            fontSize="10px"
                            fontWeight="800"
                        >
                            {item.is_active || item[props.cardProperties?.statusKey] ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                    </Box>

                    <VStack align="start" gap={5}>
                        <HStack gap={4} w="full">
                            <Center
                                w={12}
                                h={12}
                                borderRadius="xl"
                                bg="rgba(6,182,212,0.1)"
                                border="1px solid"
                                borderColor="rgba(6,182,212,0.2)"
                                boxShadow="inner"
                            >
                                <Icon as={LayoutGrid} boxSize={5} color="cyan.400" />
                            </Center>
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontWeight="800" color="app.text.primary" fontSize="md" letterSpacing="tight">
                                    {item[props.cardProperties?.title] || item.name}
                                </Text>
                                <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                                    {item[props.cardProperties?.subtitle] || item.code || `ID: ${item.id}`}
                                </Text>
                            </VStack>
                        </HStack>

                        <Text fontSize="sm" color="app.text.secondary" lineClamp={2} minH="40px">
                            {item.description || "No description provided."}
                        </Text>

                        {/* We hide the specific SaaS columns genericizing it using cardProperties */}
                        {(props.cardProperties?.showStats ?? true) && (
                            <HStack gap={6} w="full" py={2}>
                                {props.cardProperties?.stat1 && (
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="10px" color="app.text.muted" fontWeight="700" textTransform="uppercase">
                                            {props.cardProperties.stat1.label}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="800" color="cyan.400">
                                            {item[props.cardProperties.stat1.key]}
                                        </Text>
                                    </VStack>
                                )}
                                {props.cardProperties?.stat1 && props.cardProperties?.stat2 && (
                                    <Separator orientation="vertical" h="24px" />
                                )}
                                {props.cardProperties?.stat2 && (
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="10px" color="app.text.muted" fontWeight="700" textTransform="uppercase">
                                            {props.cardProperties.stat2.label}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                            {item[props.cardProperties.stat2.key]}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        )}

                        <HStack justify="space-between" w="full" pt={4} borderTop="1px solid" borderColor="app.card.border">
                            <HStack gap={2}>
                                {/* Custom routing buttons if provided in properties */}
                                {props.events?.onCustom1 && (
                                    <IconButton
                                        aria-label="Features"
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="lg"
                                        onClick={() => handleAction("onCustom1", item)}
                                        _hover={{ bg: "cyan.500/10", color: "cyan.400" }}
                                    >
                                        <Zap size={16} />
                                    </IconButton>
                                )}
                                {props.events?.onCustom2 && (
                                    <IconButton
                                        aria-label="Permissions"
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="lg"
                                        onClick={() => handleAction("onCustom2", item)}
                                        _hover={{ bg: "purple.500/10", color: "purple.400" }}
                                    >
                                        <ShieldCheck size={16} />
                                    </IconButton>
                                )}
                            </HStack>

                            <HStack gap={1} className="app-actions" transition="all 0.2s" opacity={{ base: 1, md: 0.1 }} transform={{ base: "none", md: "translateX(4px)" }}>
                                {props.events?.onEdit && (
                                    <IconButton
                                        aria-label="Edit"
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="lg"
                                        onClick={() => handleAction("onEdit", item)}
                                        _hover={{ bg: "white/10", color: "white" }}
                                    >
                                        <Pencil size={14} />
                                    </IconButton>
                                )}
                                {props.events?.onDelete && (
                                    <IconButton
                                        aria-label="Delete"
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="lg"
                                        colorPalette="red"
                                        onClick={() => handleAction("onDelete", item)}
                                        _hover={{ bg: "red.500/10", color: "red.400" }}
                                    >
                                        <Trash2 size={14} />
                                    </IconButton>
                                )}
                            </HStack>
                        </HStack>
                    </VStack>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default CardGrid;
