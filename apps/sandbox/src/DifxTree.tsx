import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { ActionType } from '@pscale/difx';
import { ViewTreeNode } from './types';

const columnHelper = createColumnHelper<ViewTreeNode>();

export default function DifxTree({
  data,
  selected,
  onSelect,
}: {
  data: ViewTreeNode[];
  selected: ViewTreeNode;
  onSelect: (node: ViewTreeNode) => void;
}) {
  const [rows, setRows] = useState(data);
  useEffect(() => {
    setRows(data);
    onSelect({} as ViewTreeNode);
  }, [data, onSelect]);

  const toggleNode = useCallback(
    (node: ViewTreeNode) => {
      setRows((prev) => {
        const res = [...prev];
        const idx = prev.findIndex((n) => n.idx === node.idx);
        res[idx] = { ...prev[idx], expanded: !prev[idx].expanded };
        if (res[idx].expanded) {
          // expand node
          res.splice(idx + 1, 0, ...(node.sub || []));
          return [...res];
        } else {
          // collapse node
          res.splice(idx + 1, (node.sub || []).length);
          return [...res];
        }
      });
    },
    [setRows]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('src', {
        cell: (info) => {
          const vmo = info.row.original;
          const val =
            info.getValue() !== undefined
              ? String(info.getValue())
              : info.renderValue();
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
              }}
            >
              <div style={{ minWidth: 10 * (vmo.level || 0) }}></div>
              {vmo.sub?.length && val ? (
                vmo.expanded ? (
                  <ChevronDownIcon
                    cursor={'pointer'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(vmo);
                    }}
                  />
                ) : (
                  <ChevronRightIcon
                    cursor={'pointer'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(vmo);
                    }}
                  />
                )
              ) : (
                <div style={{ minWidth: 14 }}></div>
              )}
              <div
                style={{
                  ...(vmo.act === ActionType.DELETE
                    ? {
                        textDecoration: 'line-through',
                        color: 'red',
                        cursor: 'default',
                      }
                    : {
                        cursor: 'default',
                      }),
                }}
              >
                {val}
              </div>
            </div>
          );
        },
        header: 'Source',
        size: 150,
      }),
      columnHelper.accessor('tar', {
        cell: (info) => {
          const vmo = info.row.original;
          const val =
            info.getValue() !== undefined
              ? String(info.getValue())
              : info.renderValue();
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
              }}
            >
              <div style={{ minWidth: 10 * (vmo.level || 0) }}></div>
              {vmo.sub?.length && val ? (
                vmo.expanded ? (
                  <ChevronDownIcon
                    cursor={'pointer'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(vmo);
                    }}
                  />
                ) : (
                  <ChevronRightIcon
                    cursor={'pointer'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(vmo);
                    }}
                  />
                )
              ) : (
                <div style={{ minWidth: 14 }}></div>
              )}
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
                  cursor: 'default',
                }}
              >
                {val}
              </div>
            </div>
          );
        },
        header: 'Target',
        size: 150,
      }),
      columnHelper.accessor('tag', {
        cell: (info) => {
          const val =
            info.getValue() !== undefined
              ? String(info.getValue())
              : info.renderValue();
          return (
            <div
              style={{
                cursor: 'default',
              }}
            >
              {val}
            </div>
          );
        },
        header: 'Tag',
      }),
    ],
    [toggleNode]
  );

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Heading as="h3" size="lg" paddingTop={4} paddingLeft={2}>
        Element
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
          <Tbody as={motion.tbody}>
            {table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                as={motion.tr}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  onSelect(row.original);
                }}
                bgColor={
                  row.original.idx === selected.idx ? 'gray.200' : undefined
                }
              >
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
