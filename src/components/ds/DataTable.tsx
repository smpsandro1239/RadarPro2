import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  numeric?: boolean;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  caption?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  caption,
  className,
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className ?? ""}`}>
      <table className="w-full border-collapse text-[14px]">
        {caption ? (
          <caption className="rp-eyebrow pb-2 text-left text-[var(--rp-muted)]">{caption}</caption>
        ) : null}
        <thead>
          <tr className="border-b border-[var(--rp-line)]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`rp-eyebrow px-3 py-2 text-[var(--rp-muted)] ${
                  column.numeric ? "text-right" : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-[var(--rp-muted)]"
              >
                Sem dados
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[var(--rp-line)] last:border-b-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2.5 align-middle ${
                      column.numeric ? "text-right" : "text-left"
                    }`}
                  >
                    {column.numeric ? (
                      <span className="rp-num">{column.render(row)}</span>
                    ) : (
                      column.render(row)
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
