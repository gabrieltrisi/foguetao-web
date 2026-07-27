"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { persistSegment, withSegment } from "@/lib/landing/segment";
import type { SegmentId } from "@/config/landing/segments";

/**
 * Overlay carregado sob demanda (lazy, client-only) — mantém o quiz FORA do
 * bundle inicial da landing. O hero renderiza só o gatilho leve abaixo.
 */
const QuizOverlay = dynamic(() => import("./QuizOverlay").then((m) => m.QuizOverlay), {
  ssr: false,
});

/**
 * Gatilho do quiz no hero (substitui o antigo seletor de segmento e unifica os
 * fluxos). Ao concluir, o segmento escolhido na Pergunta 1 é persistido e a
 * landing por trás é personalizada ao fechar o overlay.
 */
export function QuizEntry({ active }: { active: SegmentId }) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.02] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
      >
        <Sparkles className="size-4 text-brand" aria-hidden />
        Descobrir meu plano em 60s
      </button>

      {open ? (
        <QuizOverlay active={active} onClose={handleClose} onSegmentResolved={handleSegmentResolved} />
      ) : null}
    </>
  );
}
