import React from 'react';
import { Table, Box } from "@chakra-ui/react";

const KPITable = ({ headers = [], data = [], ...props }: any) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table.Root striped>
                <Table.Header>
                    <Table.Row>
                        {headers.map((head: string, idx: number) => (
                            <Table.ColumnHeader key={idx}>{head}</Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((row: any, rIdx: number) => (
                        <Table.Row key={rIdx}>
                            {headers.map((head: string, cIdx: number) => (
                                <Table.Cell key={cIdx}>{row[head.toLowerCase()] || row[head] || '-'}</Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default KPITable;
