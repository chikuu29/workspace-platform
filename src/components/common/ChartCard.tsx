/**
 * ChartCard.tsx
 *
 * Generic, reusable, theme-aware charting component built with Apache ECharts.
 * Fully compatible with React 18, React Strict Mode, and Chakra UI v3.
 *
 * Supports two modes:
 * 1. **Explicit** — Pass type/title/initialData as props (original behaviour).
 * 2. **Widget-driven** — Pass only apiEndpoint; the backend returns a
 *    self-describing envelope { chart_type, title, subtitle, filters, series }
 *    and the component auto-configures itself.
 *
 * Performance Features:
 * - Memoized component (React.memo)
 * - Ref-based ECharts initialization (prevents unnecessary re-renders)
 * - Full unmount cleanup (disposes ECharts instances to prevent memory leaks)
 * - Dynamic RxJS data subscription with automatic unsubscribe
 * - Responsive window resizing listener
 */
import { memo, useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  Button,
} from "@chakra-ui/react";
import * as echarts from "@/core/utils/echarts";
import { ChevronDown } from "lucide-react";
import { GETAPI } from "@/app/api";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";

// ── Types ────────────────────────────────────────────────────────────

/** Filter option shape — shared by props and API response. */
export interface FilterOption {
  label: string;
  value: string;
}

export interface ChartCardProps {
  /** Chart type — if omitted, auto-detected from API response `chart_type`. */
  type?: "pie" | "bar" | "line" | "area" | "donut" | "funnel";
  /** Display title — if omitted, auto-set from API response. */
  title?: string;
  /** Display subtitle — if omitted, auto-set from API response. */
  subtitle?: string;
  /** Initial static data */
  initialData?: any;
  /** API endpoint to fetch data dynamically (widget endpoint) */
  apiEndpoint?: string;
  /** Optional custom data mapper to ECharts Option configuration */
  mapDataToOption?: (data: any, isDark: boolean) => echarts.EChartsOption;
  /** Visual height of the chart container */
  height?: string | number;
  /** Optional selection dropdown filter options (overrides API-provided filters) */
  filterOptions?: FilterOption[];
  /** Current selected filter value */
  selectedFilter?: string;
  /** Callback triggered when the filter choice changes */
  onFilterChange?: (value: string) => void;
}

// ── Theme Mapping Colors ─────────────────────────────────────────────

const COLORS = {
  light: {
    text: "#2B3674",
    muted: "#A3AED0",
    gridLine: "#E5E9F2",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E9F2",
    palette: ["#4318FF", "#6AD2FF", "#FFB547", "#05CD99", "#EE5D50", "#B085FF"],
  },
  dark: {
    text: "#FFFFFF",
    muted: "#707EAE",
    gridLine: "rgba(255, 255, 255, 0.08)",
    tooltipBg: "#111C44",
    tooltipBorder: "rgba(255, 255, 255, 0.12)",
    palette: ["#7551FF", "#05CD99", "#FF5B5C", "#FFB547", "#00F2FE", "#B085FF"],
  },
};

// ── Component Implementation ─────────────────────────────────────────

const ChartCard = memo(({
  title: titleProp,
  subtitle: subtitleProp,
  type: typeProp,
  initialData,
  apiEndpoint,
  mapDataToOption,
  height = "300px",
  filterOptions: filterOptionsProp,
  selectedFilter,
  onFilterChange,
}: ChartCardProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Raw chart series data (extracted from widget envelope or raw API response)
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState<boolean>(!!apiEndpoint);
  const [error, setError] = useState<string | null>(null);

  // ── Backend-driven widget config (auto-configured from API response) ──
  const [serverChartType, setServerChartType] = useState<string | undefined>(undefined);
  const [serverTitle, setServerTitle] = useState<string | undefined>(undefined);
  const [serverSubtitle, setServerSubtitle] = useState<string | undefined>(undefined);
  const [serverFilters, setServerFilters] = useState<FilterOption[] | undefined>(undefined);

  // Resolved values — props take priority over server-provided values
  const type = typeProp || serverChartType || "line";
  const title = titleProp || serverTitle || "";
  const subtitle = subtitleProp || serverSubtitle;
  const filterOptions = filterOptionsProp || serverFilters;

  // Theme tracking
  const isDark = useColorModeValue(false, true);
  const themeColors = useMemo(() => (isDark ? COLORS.dark : COLORS.light), [isDark]);
  const cardBg = useColorModeValue("app.card.bg", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const shadow = useColorModeValue("0 10px 30px rgba(0, 0, 0, 0.04)", "0 4px 20px rgba(0, 0, 0, 0.2)");
  const selectColor = useColorModeValue("#2B3674", "#FFFFFF");

  // Fetch data if apiEndpoint is supplied — detects widget envelope
  useEffect(() => {
    if (!apiEndpoint) {
      setData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const subscription = GETAPI({ path: apiEndpoint, isPrivateApi: true }).subscribe({
      next: (res: any) => {
        if (res && res.success === false) {
          setError(res.message || "Failed to load chart data");
          setLoading(false);
          return;
        }

        // Unwrap standard REST envelope { success, data, message }
        const payload = res && res.data !== undefined ? res.data : res;

        // Detect widget envelope: { chart_type, title, subtitle, filters, series }
        if (payload && payload.chart_type && payload.series !== undefined) {
          setServerChartType(payload.chart_type);
          if (payload.title) setServerTitle(payload.title);
          if (payload.subtitle) setServerSubtitle(payload.subtitle);
          if (Array.isArray(payload.filters)) setServerFilters(payload.filters);
          setData(payload.series);
        } else {
          // Fallback: raw data (backwards compatible with non-widget endpoints)
          setData(payload);
        }
        setLoading(false);
      },
      error: (err) => {
        console.error(`Failed to fetch chart data from ${apiEndpoint}:`, err);
        setError("Network error loading chart data");
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [apiEndpoint, initialData]);

  // Normalise chart type — map widget envelope types to ECharts types.
  // "donut" and "funnel" share the same data shape as "pie" (Group A),
  // "area" shares the same shape as "line" (Group B).
  const resolvedEchartsType = useMemo(() => {
    const typeStr = type as string;
    if (typeStr === "donut" || typeStr === "funnel") return "pie";
    if (typeStr === "area") return "line";
    return typeStr as "pie" | "line" | "bar";
  }, [type]);

  // Default option builder for each type
  const defaultMapper = useCallback(
    (chartData: any, dark: boolean): echarts.EChartsOption => {
      const colors = dark ? COLORS.dark : COLORS.light;
      const baseOptions: echarts.EChartsOption = {
        color: colors.palette,
        textStyle: {
          fontFamily: "Inter, system-ui, sans-serif",
          color: colors.text,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: colors.tooltipBg,
          borderColor: colors.tooltipBorder,
          textStyle: {
            color: colors.text,
          },
          borderWidth: 1,
          borderRadius: 8,
          shadowBlur: 10,
          shadowColor: "rgba(0,0,0,0.1)",
        },
        grid: {
          top: "15%",
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
      };

      if (!chartData) return baseOptions;

      switch (resolvedEchartsType) {
        case "pie": {
          // Normalise array data or object mapping
          let seriesData = Array.isArray(chartData)
            ? chartData
            : Object.entries(chartData).map(([key, val]) => ({
              name: key,
              value: val,
            }));

          // Standardise labels (support name/label keys)
          seriesData = seriesData.map((item: any) => ({
            name: item.name || item.label || "Other",
            value: typeof item.value === "number" ? item.value : 0,
          }));

          // donut vs pie rendering: donut has center hole, pie fills fully
          const isDonut = (type as string) !== "funnel";
          const radius: [string, string] = isDonut ? ["50%", "70%"] : ["0%", "70%"];

          return {
            ...baseOptions,
            tooltip: {
              trigger: "item",
              backgroundColor: colors.tooltipBg,
              borderColor: colors.tooltipBorder,
              textStyle: { color: colors.text },
              formatter: "{b}: <b>{c}</b> ({d}%)",
            },
            legend: {
              orient: "horizontal",
              bottom: "0%",
              textStyle: { color: colors.muted, fontSize: 11 },
              icon: "circle",
              itemWidth: 8,
              itemHeight: 8,
            },
            series: [
              {
                name: title,
                type: "pie",
                radius,
                avoidLabelOverlap: true,
                padAngle: 2,
                itemStyle: {
                  borderRadius: 8,
                  borderColor: dark ? "#111c44" : "#ffffff",
                  borderWidth: 2,
                },
                label: {
                  show: false,
                  position: "center",
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: "bold",
                    formatter: "{b}\n{c}",
                  },
                },
                labelLine: {
                  show: false,
                },
                data: seriesData,
              },
            ],
          };
        }

        case "line": {
          let items: any[] = [];
          if (Array.isArray(chartData)) {
            items = chartData;
          } else if (chartData && typeof chartData === "object") {
            const possibleKeys = ["daily_visits", "visits", "history", "trend", "data"];
            const foundKey = possibleKeys.find((k) => Array.isArray(chartData[k]));
            if (foundKey) {
              items = chartData[foundKey];
            }
          }

          const xAxisData = items.map((item: any) => item.date || item.label || item.name || "");
          const yAxisData = items.map((item: any) => item.count || item.value || 0);

          // Area chart uses a visible areaStyle, line chart uses subtle gradient
          const isArea = (type as string) === "area";
          const areaOpacity = isArea ? 0.35 : 0.15;

          return {
            ...baseOptions,
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: xAxisData,
              axisLine: { lineStyle: { color: colors.gridLine } },
              axisLabel: { color: colors.muted, fontSize: 10 },
            },
            yAxis: {
              type: "value",
              splitLine: { lineStyle: { color: colors.gridLine } },
              axisLabel: { color: colors.muted, fontSize: 10 },
            },
            series: [
              {
                name: title,
                type: "line",
                data: yAxisData,
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 3 },
                areaStyle: {
                  opacity: areaOpacity,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: colors.palette[0] },
                    { offset: 1, color: "rgba(117, 81, 255, 0)" },
                  ]),
                },
              },
            ],
          };
        }

        case "bar": {
          let items: any[] = [];
          if (Array.isArray(chartData)) {
            items = chartData;
          } else if (chartData && typeof chartData === "object") {
            const possibleKeys = ["daily_visits", "visits", "history", "trend", "data"];
            const foundKey = possibleKeys.find((k) => Array.isArray(chartData[k]));
            if (foundKey) {
              items = chartData[foundKey];
            }
          }

          const xAxisData = items.map((item: any) => item.label || item.name || item.date || "");
          const yAxisData = items.map((item: any) => item.value || item.count || 0);

          return {
            ...baseOptions,
            xAxis: {
              type: "category",
              data: xAxisData,
              axisLine: { lineStyle: { color: colors.gridLine } },
              axisLabel: { color: colors.muted, fontSize: 10 },
              axisTick: { show: false },
            },
            yAxis: {
              type: "value",
              splitLine: { lineStyle: { color: colors.gridLine } },
              axisLabel: { color: colors.muted, fontSize: 10 },
            },
            series: [
              {
                name: title,
                type: "bar",
                barWidth: "45%",
                data: yAxisData,
                itemStyle: {
                  borderRadius: [6, 6, 0, 0],
                },
              },
            ],
          };
        }

        default:
          return baseOptions;
      }
    },
    [resolvedEchartsType, type, title]
  );

  // Compute final option based on current data state
  const chartOption = useMemo(() => {
    if (mapDataToOption) {
      return mapDataToOption(data, isDark);
    }
    return defaultMapper(data, isDark);
  }, [data, isDark, mapDataToOption, defaultMapper]);

  // Initialise, update options, and handle theme changes
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    if (chartOption) {
      chartInstance.current.setOption(chartOption, true);
    }
  }, [chartOption]);

  // Handle Resize responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const selectedLabel = useMemo(() => {
    return filterOptions?.find((opt) => opt.value === selectedFilter)?.label || "Select";
  }, [selectedFilter, filterOptions]);

  return (
    <Box
      p={5}
      borderRadius="24px"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px) saturate(160%)"
      boxShadow={shadow}
      position="relative"
      overflow="hidden"
      w="full"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Chart Headers & Filters */}
      <HStack justify="space-between" align="flex-start" mb={4} gap={4}>
        <VStack align="stretch" gap={0.5} flex="1">
          <Heading size="xs" fontWeight="800" color="app.text.primary">
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="2xs" fontWeight="600" color="app.text.muted">
              {subtitle}
            </Text>
          )}
        </VStack>

        {filterOptions && filterOptions.length > 0 && (
          <MenuRoot positioning={{ placement: "bottom-end" }}>
            <MenuTrigger asChild>
              <Button
                variant="subtle"
                size="sm"
                fontWeight="800"
                fontSize="2xs"
                borderRadius="12px"
                bg={useColorModeValue("rgba(244, 247, 254, 0.84)", "rgba(27, 37, 75, 0.84)")}
                borderColor={borderColor}
                border="1px solid"
                color={selectColor}
                px={3}
                py={1.5}
                height="32px"
                _hover={{
                  bg: useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)"),
                }}
              >
                {selectedLabel} <ChevronDown size={12} style={{ marginLeft: "4px" }} />
              </Button>
            </MenuTrigger>
            <MenuContent
              bg={useColorModeValue("#FFFFFF", "#111C44")}
              borderColor={borderColor}
              borderRadius="12px"
              p={1}
              zIndex={1500}
            >
              {filterOptions.map((option) => (
                <MenuItem
                  value={option.value}
                  key={option.value}
                  onClick={() => onFilterChange?.(option.value)}
                  fontWeight="700"
                  fontSize="2xs"
                  borderRadius="8px"
                  color={option.value === selectedFilter ? "blue.500" : selectColor}
                  _hover={{
                    bg: useColorModeValue("rgba(0, 0, 0, 0.04)", "rgba(255, 255, 255, 0.06)"),
                  }}
                  cursor="pointer"
                  py={1.5}
                  px={3}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuContent>
          </MenuRoot>
        )}
      </HStack>

      {/* Chart Canvas Area */}
      <Box position="relative" flex="1" w="full" minH={height}>
        {loading && (
          <Center position="absolute" inset={0} bg={cardBg} zIndex={2}>
            <Spinner size="md" color="blue.500" />
          </Center>
        )}

        {error && !loading && (
          <Center position="absolute" inset={0} zIndex={2} p={4} textAlign="center">
            <Text fontSize="xs" fontWeight="700" color="red.500">
              {error}
            </Text>
          </Center>
        )}

        {!error && (
          <Box ref={chartRef} w="full" h="100%" minH={height} />
        )}
      </Box>
    </Box>
  );
});

ChartCard.displayName = "ChartCard";
export default ChartCard;
