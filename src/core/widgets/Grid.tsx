import React from 'react';
import { SimpleGrid, Box } from '@chakra-ui/react';
import { ComponentRenderer } from '../renderer/ComponentRenderer';

const Grid = ({ widgets, columns = 2, gap = 4, ...props }: any) => {
    return (
        <SimpleGrid columns={columns} gap={gap} {...props}>
            {widgets?.map((child: any) => (
                <ComponentRenderer key={child.name} config={child} />
            ))}
        </SimpleGrid>
    );
};

export default Grid;
