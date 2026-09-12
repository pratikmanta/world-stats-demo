"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];

  getRowKey: (row: T) => string;

  onRowClick?: (row: T) => void;

  getRowState?: (row: T) => string | undefined;

  rowClassName?: string | ((row: T) => string);

  emptyMessage?: React.ReactNode;

  emptyColSpan?: number;

  loading?: boolean;

  skeletonRows?: number;

  renderSkeleton?: (rowIndex: number) => React.ReactNode;

  className?: string;

  "data-testid"?: string;
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  onRowClick,
  getRowState,
  rowClassName,
  emptyMessage = "No data available.",
  emptyColSpan,
  loading = false,
  skeletonRows = 3,
  renderSkeleton,
  className,
  "data-testid": dataTestId,
}: DataTableProps<T>) {
  const getRowClassName = (row: T) =>
    typeof rowClassName === "function"
      ? rowClassName(row)
      : rowClassName;

  return (
    <Table className={className} data-testid={dataTestId}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(column.headerClassName)}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {renderSkeleton ? (
                renderSkeleton(index)
              ) : (
                columns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))
              )}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={emptyColSpan ?? columns.length}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow
              key={getRowKey(row)}
              data-state={getRowState?.(row)}
              onClick={
                onRowClick
                  ? () => onRowClick(row)
                  : undefined
              }
              className={cn(
                onRowClick && "cursor-pointer",
                getRowClassName(row)
              )}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(column.cellClassName)}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}