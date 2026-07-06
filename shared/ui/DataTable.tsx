import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
  className?: string;
  minWidth?: string;
};

export function DataTable({
  children,
  className = "",
  minWidth = "42rem",
}: DataTableProps) {
  return (
    <div className={`data-table-wrap scrollbar-thin ${className}`}>
      <table className="data-table" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}
