import * as echarts from 'echarts/core';
import { ComposeOption } from 'echarts/core';
import {
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  LineSeriesOption,
  BarSeriesOption,
  PieSeriesOption,
  HeatmapSeriesOption,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  CalendarComponent,
  GraphicComponent,
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
  VisualMapComponentOption,
  CalendarComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register components
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent,
  CalendarComponent,
  GraphicComponent,
  CanvasRenderer,
]);

// Compose the type-safe EChartsOption for our registered charts and components
export type EChartsOption = ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | PieSeriesOption
  | HeatmapSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | VisualMapComponentOption
  | CalendarComponentOption
>;

export * from 'echarts/core';
export { echarts };
