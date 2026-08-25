import type { Metadata } from "next";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { SessionGate } from "@/components/layout/session-gate";
import { SessionProvider } from "@/providers/session-provider";
import { MessagingRealtimeProvider } from "@/providers/messaging-realtime-provider";

export const metadata: Metadata = {
  // Área autenticada não deve ser indexada.
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MessagingRealtimeProvider>
        <SidebarProvider>
          <SessionGate>
            <AppShell>{children}</AppShell>
          </SessionGate>
        </SidebarProvider>
      </MessagingRealtimeProvider>
    </SessionProvider>
  );
}
