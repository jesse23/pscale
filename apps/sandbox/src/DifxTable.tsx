import {
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ActionType, PreviewObjectTreeNode, Preview } from './types';

const columnHelper = createColumnHelper<Preview>();

const columns = [
  columnHelper.accessor('key', {
    cell: (info) => info.renderValue(),
    header: 'Attribute',
  }),
  columnHelper.accessor('src', {
    cell: (info) => {
      const vmo = info.row.original;
      const val = info.getValue() !== undefined ? String(info.getValue()): info.renderValue();
      return (
        <div
          style={{
            ...(vmo.act === ActionType.DELETE
              ? {
                  textDecoration: 'line-through',
                  color: 'red',
                }
              : {}),
          }}
        >
          {val}
        </div>
      );
    },
    header: 'Source',
  }),
  columnHelper.accessor('tar', {
    cell: (info) => {
      const vmo = info.row.original;
      const val = info.getValue() !== undefined ? String(info.getValue()): info.renderValue();
      return (
        <div
          style={{
            color:
              vmo.act === ActionType.ADD
                ? 'green'
                : vmo.act === ActionType.UPDATE
                ? 'blue'
                : vmo.mov === true
                ? '#cc9900'
                : undefined,
          }}
        >
          {val}
        </div>
      );
    },
    header: 'Target',
  }),
];

const DUMMY_DATA = [] as Preview[];

export default function DifxTable({ item }: { item: PreviewObjectTreeNode }) {
  const table = useReactTable({
    columns,
    data: item.att || DUMMY_DATA,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <>
      <Heading as="h3" size="lg" paddingTop={4} paddingLeft={2}>
        Attribute
      </Heading>
      <TableContainer paddingTop={4}>
        <Table size="sm">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      key={header.id}
                      width={header.getSize()}
                      minWidth={header.getSize()}
                      maxWidth={header.getSize()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td
                      key={cell.id}
                      width={cell.column.getSize()}
                      minWidth={cell.column.getSize()}
                      maxWidth={cell.column.getSize()}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
