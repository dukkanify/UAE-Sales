"use client";

import * as React from "react";
import { Download, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  loading?: boolean;
  onExport?: (rows: T[]) => void;
  bulkActions?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  filters?: React.ReactNode;
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKeys,
  pageSize = 10,
  loading,
  onExport,
  bulkActions,
  emptyMessage = "No results found",
  className,
  filters,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const filtered = React.useMemo(() => {
    let rows = data;
    if (query.trim() && searchKeys?.length) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? "");
        const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? "");
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, query, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allSelected =
    pageRows.length > 0 && pageRows.every((row) => selected.has(row.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {selected.size > 0 ? bulkActions : null}
          {onExport ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onExport(filtered)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col.id}
                    className={cn(col.className, col.sortable && "cursor-pointer select-none")}
                    onClick={() => {
                      if (!col.sortable) return;
                      if (sortKey === col.id) {
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setSortKey(col.id);
                        setSortDir("asc");
                      }
                    }}
                  >
                    {col.header}
                    {sortKey === col.id ? (sortDir === "asc" ? " ↑" : " ↓") : null}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length + 1}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          });
                        }}
                        aria-label={`Select row ${row.id}`}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.id} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
          {selected.size ? ` · ${selected.size} selected` : ""}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export { DataTable };
