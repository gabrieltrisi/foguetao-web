"use client";

import * as React from "react";

const STORAGE_KEY = "foguetao:sidebar-collapsed";

/* --------------------------------------------------------------------------
 * Store externo para o estado "recolhida" (persistido em localStorage).
 * Usa useSyncExternalStore para ler a preferência sem setState em effect e
 * sem gerar hydration mismatch (o snapshot do servidor é sempre "false").
 * ------------------------------------------------------------------------ */
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage indisponível — ignora a persistência.
  }
  emit();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

type SidebarContextValue = {
  /** Sidebar recolhida (apenas ícones) — desktop. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  /** Drawer aberto — mobile. */
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = React.useSyncExternalStore(subscribe, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setCollapsed = React.useCallback((value: boolean) => writeCollapsed(value), []);
  const toggleCollapsed = React.useCallback(() => writeCollapsed(!readCollapsed()), []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, toggleCollapsed, setCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, toggleCollapsed, setCollapsed, mobileOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar deve ser usado dentro de <SidebarProvider>.");
  }
  return ctx;
}
