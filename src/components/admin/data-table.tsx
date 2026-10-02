"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useT } from "@/i18n";
import { toCsv } from "@/services/reports";
import { cn } from "@/lib/utils";

/*
  A small table of our own rather than TanStack Table v9.

  v9's generics do not thread through a reusable `<DataTable<TRow>>` wrapper —
  the row type collapses to RowData at the component boundary — and everything
  these admin lists need (sort, search, paginate, export, cards on mobile) is
  the sixty lines below. The dataset is already in the browser, so there is no
  server-side paging to model either.
*/

export interface AdminColumn<TRow> {
  id: string;
  header: string;
  cell: (row: TRow) => React.ReactNode;
  /** Makes the column sortable. Return a string or number. */
  sortValue?: (row: TRow) => string | number;
  /** Text the search box matches against. */
  searchValue?: (row: TRow) => string;
  align?: "left" | "right";
  /** Applied to both the header and the cells. */
  className?: string;
}

export interface DataTableProps<TRow> {
  data: TRow[];
  columns: AdminColumn<TRow>[];
  getRowId: (row: TRow) => string;
  isLoading?: boolean;
  /** Selects and chips rendered beside the search box. */
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  /** One CSV row. Omitted = no export button. */
  toCsvRow?: (row: TRow) => Record<string, string | number>;
  csvName?: string;
  /** Card for one row below `md`; without it the table scrolls sideways. */
  renderCard?: (row: TRow) => React.ReactNode;
  onRowClick?: (row: TRow) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  className?: string;
}

export function DataTable<TRow>({
  data,
  columns,
  getRowId,
  isLoading = false,
  filters,
  searchPlaceholder,
  hideSearch = false,
  toCsvRow,
  csvName = "export",
  renderCard,
  onRowClick,
  pageSize = 20,
  emptyTitle,
  emptyBody,
  className,
}: DataTableProps<TRow>) {
  const t = useT();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null);
  const [page, setPage] = useState(0);

  const searchable = useMemo(
    () => columns.filter((column) => column.searchValue),
    [columns],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || searchable.length === 0) return data;
    return data.filter((row) =>
      searchable.some((column) =>
        column.searchValue!(row).toLowerCase().includes(term),
      ),
    );
  }, [data, search, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return filtered;

    const rows = [...filtered].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (typeof left === "number" && typeof right === "number") return left - right;
      return String(left).localeCompare(String(right), undefined, { numeric: true });
    });
    return sort.desc ? rows.reverse() : rows;
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // A filter can shrink the list under the current page.
  const safePage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const firstRow = sorted.length === 0 ? 0 : safePage * pageSize + 1;
  const lastRow = Math.min(sorted.length, (safePage + 1) * pageSize);

  const toggleSort = (id: string) =>
    setSort((current) =>
      current?.id === id
        ? current.desc
          ? null
          : { id, desc: true }
        : { id, desc: false },
    );

  /** Exports what the filters left on screen, not the whole collection. */
  const exportCsv = () => {
    if (!toCsvRow) return;
    const blob = new Blob([toCsv(sorted.map(toCsvRow))], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${csvName}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t.adm.table.exported(sorted.length));
  };

  const toolbar = (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {!hideSearch && searchable.length > 0 && (
        <div className="relative min-w-44 flex-1 sm:max-w-xs">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder ?? t.adm.table.searchPlaceholder}
            aria-label={t.adm.table.search}
            className="h-9 pl-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t.adm.table.clear}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-control p-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {filters}
      {toCsvRow && (
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={sorted.length === 0}
          className="ml-auto"
        >
          <Download aria-hidden="true" />
          <span className="hidden sm:inline">{t.adm.table.exportCsv}</span>
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className={cn("grid min-w-0 gap-3 [&>*]:min-w-0", className)}>
        {toolbar}
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className={cn("grid min-w-0 gap-3 [&>*]:min-w-0", className)}>
      {toolbar}

      {rows.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? t.adm.table.empty}
          description={emptyBody ?? t.adm.table.emptyBody}
        />
      ) : (
        <>
          {/* Cards below md — an admin holding a phone at the counter. */}
          {renderCard && (
            <ul className="grid gap-2 md:hidden [&>li]:min-w-0">
              {rows.map((row) => (
                <li key={getRowId(row)}>
                  {onRowClick ? (
                    <button
                      type="button"
                      onClick={() => onRowClick(row)}
                      className="w-full text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                    >
                      {renderCard(row)}
                    </button>
                  ) : (
                    renderCard(row)
                  )}
                </li>
              ))}
            </ul>
          )}

          <Card flush className={cn(renderCard && "hidden md:block")}>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => {
                    const isSorted = sort?.id === column.id;
                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          column.align === "right" && "text-right",
                          column.className,
                        )}
                      >
                        {column.sortValue ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.id)}
                            aria-label={t.adm.table.sortBy(column.header)}
                            className={cn(
                              "inline-flex items-center gap-1 font-semibold transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand",
                              column.align === "right" && "flex-row-reverse",
                            )}
                          >
                            {column.header}
                            {isSorted ? (
                              sort.desc ? (
                                <ArrowDown size={13} aria-hidden="true" />
                              ) : (
                                <ArrowUp size={13} aria-hidden="true" />
                              )
                            ) : (
                              <ArrowUpDown
                                size={13}
                                aria-hidden="true"
                                className="text-ink-muted/50"
                              />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === "right" && "text-right",
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {sorted.length > pageSize && (
            <div className="flex items-center justify-between gap-3">
              <p className="nums text-xs text-ink-muted">
                {t.adm.table.of(firstRow, lastRow, sorted.length)}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  aria-label={t.adm.table.previous}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                  aria-label={t.adm.table.next}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
