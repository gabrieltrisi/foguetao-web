import type { Metadata } from "next";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "@/providers/session-provider";

export const metadata: Metadata = {
  // Área autenticada não deve ser indexada.
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppShell>{children}</AppShell>
      </SidebarProvider>
    </SessionProvider>
  );
}
