"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { persistSegment, withSegment } from "@/lib/landing/segment";
import type { SegmentId } from "@/config/landing/segments";

/**
 * Overlay carregado sob demanda (lazy, client-only) — mantém o quiz FORA do
 * bundle inicial da landing. O provider só o monta quando aberto.
 */
const QuizOverlay = dynamic(() => import("./QuizOverlay").then((m) => m.QuizOverlay), {
  ssr: false,
});

interface QuizContextValue {
  /** Abre o overlay do quiz (a partir de qualquer gatilho da página). */
  open: () => void;
}

const QuizContext = React.createContext<QuizContextValue | null>(null);

export function useQuiz(): QuizContextValue {
  const ctx = React.useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz precisa estar dentro de <QuizProvider>");
  return ctx;
}

/**
 * Camada ADITIVA de LP2: um único overlay compartilhado por todos os CTAs de
 * quiz da landing (hero, strip contextual, CTA final). O overlay/máquina/score
 * da LP1 permanecem intactos — o provider só centraliza abertura e a aplicação
 * do segmento diagnosticado ao fechar.
 */
export function QuizProvider({
  active,
  children,
}: {
  active: SegmentId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const resolvedSegment = React.useRef<SegmentId | null>(null);

  const handleSegmentResolved = React.useCallback((id: SegmentId) => {
    resolvedSegment.current = id;
    persistSegment(id);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    const id = resolvedSegment.current;
    // Personaliza a landing por trás com o segmento diagnosticado (se mudou).
    if (id && id !== "default" && id !== active) {
      router.replace(withSegment("/", id), { scroll: false });
    }
  }, [active, router]);

  const value = React.useMemo<QuizContextValue>(() => ({ open: () => setOpen(true) }), []);

  return (
    <QuizContext.Provider value={value}>
      {children}
      {open ? (
        <QuizOverlay active={active} onClose={handleClose} onSegmentResolved={handleSegmentResolved} />
      ) : null}
    </QuizContext.Provider>
  );
}
