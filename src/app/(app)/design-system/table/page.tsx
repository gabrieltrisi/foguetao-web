import type { Metadata } from "next";
import { TableShowcase } from "@/components/design-system/table-showcase";

export const metadata: Metadata = {
  title: "Tabelas & dados",
  description: "DataTable, paginação e estados de tabela.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TableShowcase />;
}
