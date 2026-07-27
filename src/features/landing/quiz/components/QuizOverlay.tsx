"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { withSegment } from "@/lib/landing/segment";
import type { SegmentId } from "@/config/landing/segments";
import { useQuizMachine } from "../hooks/useQuizMachine";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { QuizHeader } from "./QuizHeader";
import { QuestionScreen } from "./QuestionScreen";
import { AnalyzingScreen } from "./AnalyzingScreen";
import { ResultScreen } from "./ResultScreen";
import { LeadForm } from "./LeadForm";

/**
 * Shell fullscreen do quiz (dialog acessível). Monta a máquina de estados e
 * apresenta a fase atual com transições suaves. Fullscreen no mobile, cartão
 * centrado no desktop; respeita safe-area, dvh, focus-trap, ESC e reduced-motion.
 *
 * Carregado sob demanda (lazy) — não entra no bundle inicial da landing.
 */
export function QuizOverlay({
  active,
  onClose,
  onSegmentResolved,
}: {
  active: SegmentId;
  onClose: () => void;
  onSegmentResolved: (segmentId: SegmentId) => void;
}) {
  const reduced = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const machine = useQuizMachine();
  const { markAbandonedIfIncomplete, diagnosis } = machine;

  const handleClose = React.useCallback(() => {
    markAbandonedIfIncomplete();
    onClose();
  }, [markAbandonedIfIncomplete, onClose]);

  useFocusTrap(panelRef, handleClose);

  // Ao gerar o diagnóstico, resolve o segmento escolhido (persistência/landing).
  const resolvedRef = React.useRef(false);
  React.useEffect(() => {
    if (diagnosis && !resolvedRef.current) {
      resolvedRef.current = true;
      onSegmentResolved(diagnosis.segmentId);
    }
  }, [diagnosis, onSegmentResolved]);

  const phaseKey = machine.phase === "question" ? `q-${machine.stepIndex}` : machine.phase;

  const registerLink = withSegment("/register", diagnosis?.segmentId ?? active);

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        aria-hidden
        onPointerDown={handleClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div className="pointer-events-none relative flex min-h-full items-stretch justify-center sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pt-safe pb-safe pointer-events-auto relative flex h-[100dvh] w-full flex-col bg-[#0f0f12] text-left shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:max-w-xl sm:rounded-2xl sm:border sm:border-white/10"
        >
          <h2 id={titleId} className="sr-only">
            Diagnóstico comercial do Foguetão
          </h2>

          <QuizHeader
            canGoBack={machine.canGoBack}
            onBack={machine.goBack}
            onClose={handleClose}
            showProgress={machine.phase === "question"}
            progress={machine.progress}
            stepNumber={machine.stepNumber}
            totalSteps={machine.totalSteps}
          />

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phaseKey}
                initial={reduced ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {machine.phase === "question" && machine.currentQuestion ? (
                  <QuestionScreen
                    question={machine.currentQuestion}
                    selected={machine.answers[machine.currentQuestion.id]}
                    onSelect={machine.select}
                  />
                ) : null}

                {machine.phase === "analyzing" ? <AnalyzingScreen /> : null}

                {machine.phase === "result" && diagnosis ? (
                  <ResultScreen diagnosis={diagnosis} onContinue={machine.startLead} />
                ) : null}

                {machine.phase === "lead" ? (
                  <LeadForm
                    onSubmit={machine.submitLead}
                    submitting={machine.leadStatus === "submitting"}
                    error={machine.leadError}
                  />
                ) : null}

                {machine.phase === "success" ? (
                  <div className="py-8 text-center">
                    <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#16a34a]/12 text-[#4ade80]">
                      <CheckCircle2 className="size-8" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-bold text-white">Tudo pronto! 🎉</h3>
                    <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-white/55">
                      Recebemos seus dados. Agora é dar o primeiro passo: crie sua conta e organize
                      sua operação em minutos — com o teste de 14 dias, sem cartão.
                    </p>
                    <Link
                      href={registerLink}
                      className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12]"
                    >
                      Criar minha conta grátis <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-3 min-h-11 text-[13.5px] font-medium text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      Explorar a landing personalizada
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
