import React from "react";
import { UISectionType, UI_TYPE_ALIASES } from "./UISectionType";
import type { SectionRendererProps } from "@/core/renderer/ui-type-renderers/types";
import KPISectionRenderer from "@/core/renderer/ui-type-renderers/KPISectionRenderer";
import TableSectionRenderer from "@/core/renderer/ui-type-renderers/TableSectionRenderer";
import ChartSectionRenderer from "@/core/renderer/ui-type-renderers/ChartSectionRenderer";
import ActionSectionRenderer from "@/core/renderer/ui-type-renderers/ActionSectionRenderer";

export type UITypeRendererComponent = React.ComponentType<SectionRendererProps>;

class UITypeRegistryStore {
  private readonly registry = new Map<string, UITypeRendererComponent>();

  register(type: string, renderer: UITypeRendererComponent) {
    this.registry.set(type, renderer);
  }

  resolveType(type: string): string {
    return UI_TYPE_ALIASES[type] || type;
  }

  resolve(type: string): UITypeRendererComponent | undefined {
    const resolvedType = this.resolveType(type);
    return this.registry.get(resolvedType);
  }

  has(type: string): boolean {
    const resolvedType = this.resolveType(type);
    return this.registry.has(resolvedType);
  }
}

export const UITypeRegistry = new UITypeRegistryStore();

UITypeRegistry.register(UISectionType.KPI_SECTION, KPISectionRenderer);
UITypeRegistry.register(UISectionType.TABLE_SECTION, TableSectionRenderer);
UITypeRegistry.register(UISectionType.CHART_SECTION, ChartSectionRenderer);
UITypeRegistry.register(UISectionType.ACTION_SECTION, ActionSectionRenderer);
