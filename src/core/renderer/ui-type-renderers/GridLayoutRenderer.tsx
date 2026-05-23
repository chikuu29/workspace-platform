import React from "react";
import { Box, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import UITypeRenderEntry from "@/core/renderer/UITypeRenderEntry";
import type { SectionRendererProps } from "./types";

/**
 * GridLayoutRenderer is a high-fidelity recursive container component.
 * It renders sub-components inside a standard responsive 12-column Grid.
 * Child components specify their custom column span (e.g. span 8 / span 4)
 * inside their individual layout properties.
 */
const GridLayoutRenderer: React.FC<SectionRendererProps> = ({
  component,
  pageConfig,
  resolveData,
  resolveActions,
  fallbackTableColumns,
}) => {
  console.log("Rendering GridLayout with component:", component);
  const subComponents = component.components || [];

  const gridGap = component.layout?.gap ?? 6;
  const gridColumns = component.layout?.columns ?? { base: 1, md: 12 };

  // Convert layout column mapping to repeat notation or handle responsive column configurations
  const templateColumns = typeof gridColumns === "number"
    ? `repeat(${gridColumns}, 1fr)`
    : gridColumns;

  return (
    <Box w="100%" mb={6} {...(component.layout?.layoutStyles || {})}>
      {(component.title || component.description) && (
        <Box mb={4}>
          {component.title && (
            <Heading
              size="md"
              fontWeight="800"
              letterSpacing="tight"
              mb={1}
              color="app.text.primary"
            >
              {component.title}
            </Heading>
          )}
          {component.description && (
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {component.description}
            </Text>
          )}
        </Box>
      )}

      <Grid
        {...component.layoutStyles}
        // w="100%"
      >
        {subComponents.map((sub, index) => {
          // Default column span to full width on mobile/base if not defined, otherwise read custom spans
          const gridColumn = sub.layout?.gridColumn ?? "span 12";
          const gridRow = sub.layout?.gridRow;
          const layoutStyles = sub.layout?.layoutStyles || {};

          return (
            <GridItem
              key={sub.id || `grid-sub-${index}`}
              // gridColumn={gridColumn}
              // gridRow={gridRow}
              w="100%"
              {...layoutStyles}
            >
              <UITypeRenderEntry
                component={sub}
                pageConfig={pageConfig}
                resolveData={resolveData}
                resolveActions={resolveActions}
                fallbackTableColumns={fallbackTableColumns}
              />
            </GridItem>
          );
        })}
      </Grid>
    </Box>
  );
};

export default React.memo(GridLayoutRenderer);
