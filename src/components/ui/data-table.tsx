"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  BulkActionBar,
  ColumnVisibilityMenu,
  SortButton,
  TableEmpty,
  TableSkeleton,
  TableToolbar,
  type SortDirection,
} from "@/components/ui/data-table-parts";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortAccessor?: (row: T) => string | number;
  sortable?: boolean;
  hideable?: boolean;
  defaultHidden?: boolean;
  className?: string;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  pageSize = 10,
  searchAccessor,
  searchPlaceholder = "Buscar…",
  selectable = false,
  bulkActions,
  toolbarActions,
  empty,
  enableColumnVisibility = true,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  searchAccessor?: (row: T) => string;
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: (ids: string[], clear: () => void) => React.ReactNode;
  toolbarActions?: React.ReactNode;
  empty: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode };
  enableColumnVisibility?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ id: string; dir: SortDirection }>({ id: "", dir: false });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  const filtered = React.useMemo(() => {
    if (!searchAccessor || !query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) => searchAccessor(row).toLowerCase().includes(q));
  }, [data, query, searchAccessor]);

  const sorted = React.useMemo(() => {
    if (!sort.dir) return filtered;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortAccessor) return filtered;
    const acc = col.sortAccessor;
    return [...filtered].sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (id: string) => {
    setSort((prev) =>
      prev.id !== id
        ? { id, dir: "asc" }
        : prev.dir === "asc"
          ? { id, dir: "desc" }
          : prev.dir === "desc"
            ? { id: "", dir: false }
            : { id, dir: "asc" },
    );
  };

  const clearSelection = () => setSelected(new Set());
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pageIds = pageRows.map(getRowId);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const headerChecked: boolean | "indeterminate" = allPageSelected
    ? true
    : somePageSelected
      ? "indeterminate"
      : false;

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });

  const colSpan = visibleColumns.length + (selectable ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <TableToolbar
        left={
          searchAccessor ? (
            <SearchInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              containerClassName="w-full max-w-xs"
            />
          ) : null
        }
        right={
          <>
            {toolbarActions}
            {enableColumnVisibility ? (
              <ColumnVisibilityMenu
                columns={columns.map((c) => ({
                  id: c.id,
                  label: c.header,
                  visible: !hidden.has(c.id),
                  canHide: c.hideable !== false,
                }))}
                onToggle={(id, visible) =>
                  setHidden((prev) => {
                    const next = new Set(prev);
                    if (visible) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              />
            ) : null}
          </>
        }
      />

      {selectable && selected.size > 0 ? (
        <BulkActionBar count={selected.size} onClear={clearSelection}>
          {bulkActions?.(Array.from(selected), clearSelection)}
        </BulkActionBar>
      ) : null}

      {loading ? (
        <TableSkeleton rows={pageSize} columns={colSpan} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                {selectable ? (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={headerChecked}
                      onCheckedChange={togglePage}
                      aria-label="Selecionar página"
                    />
                  </TableHead>
                ) : null}
                {visibleColumns.map((c) => (
                  <TableHead key={c.id} className={c.className}>
                    {c.sortable ? (
                      <SortButton
                        label={c.header}
                        direction={sort.id === c.id ? sort.dir : false}
                        onClick={() => toggleSort(c.id)}
                      />
                    ) : (
                      c.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colSpan} className="p-0">
                    <TableEmpty
                      icon={empty.icon}
                      title={empty.title}
                      description={empty.description}
                      action={empty.action}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => {
                  const id = getRowId(row);
                  const isSelected = selected.has(id);
                  return (
                    <TableRow key={id} data-state={isSelected ? "selected" : undefined}>
                      {selectable ? (
                        <TableCell className="w-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(id)}
                            aria-label="Selecionar linha"
                          />
                        </TableCell>
                      ) : null}
                      {visibleColumns.map((c) => (
                        <TableCell key={c.id} className={cn(c.className)}>
                          {c.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-small text-ink-3">
            {sorted.length} resultado(s) · página {safePage} de {totalPages}
          </span>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
