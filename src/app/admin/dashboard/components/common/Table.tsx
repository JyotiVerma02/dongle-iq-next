import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data found.",
  loading = false,
  loadingMessage = "Loading...",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-[36rem] w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--border-soft)] text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-2 pb-2 pt-2.5 first:pl-3 last:pr-3 sm:first:pl-6 sm:last:pr-6 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                    ? "text-center"
                    : "text-left"
                } ${column.headerClassName || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-soft)]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-[var(--muted)] text-xs font-semibold">
                {loadingMessage}
              </td>
            </tr>
          ) : (
            <>
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="transition-colors hover:bg-[var(--background-alt)]">
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`px-2 py-2 first:pl-3 last:pr-3 sm:first:pl-6 sm:last:pr-6 ${
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                          ? "text-center"
                          : "text-left"
                      } ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item)
                        : column.accessor
                        ? (item[column.accessor] as unknown as ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-[var(--muted)] text-xs font-semibold">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
