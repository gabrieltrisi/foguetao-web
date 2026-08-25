"use client";

import * as React from "react";

const BOTTOM_TOLERANCE_PX = 80;

/**
 * Comportamento de SCROLL da timeline (F2A). Detecta "está no final" (com tolerância),
 * preserva a posição ao carregar mensagens ANTERIORES (prepend) e conta mensagens não
 * vistas quando o usuário está lendo histórico. Sem setState por pixel — usa rAF.
 *
 * O componente orquestra: `beforePrepend()` antes de buscar antigas; posicionamento
 * inicial via `scrollToBottom`/elemento âncora; novas mensagens via `isAtBottom`.
 */
export function useTimelineScroll(opts: { topItemId: string | undefined }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [unseenCount, setUnseenCount] = React.useState(0);
  const atBottomRef = React.useRef(true);

  // Prepend (carregar antigas): guarda a altura antes e compensa depois.
  const prependRef = React.useRef<{ pending: boolean; height: number }>({ pending: false, height: 0 });

  const computeAtBottom = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance <= BOTTOM_TOLERANCE_PX;
    atBottomRef.current = atBottom;
    setIsAtBottom((prev) => (prev === atBottom ? prev : atBottom));
    if (atBottom) setUnseenCount((c) => (c === 0 ? c : 0));
  }, []);

  // Listener de scroll throttled por rAF (sem estado por pixel).
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        computeAtBottom();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [computeAtBottom]);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "auto") => {
    const el = ref.current;
    if (!el) return;
    // F2D M3: respeita prefers-reduced-motion — o `behavior:"smooth"` do JS não é
    // afetado pelo override CSS de reduced-motion; degradamos para "auto".
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : behavior });
    atBottomRef.current = true;
    setIsAtBottom(true);
    setUnseenCount(0);
  }, []);

  /** Registra a altura atual antes de carregar mensagens anteriores (prepend). */
  const beforePrepend = React.useCallback(() => {
    const el = ref.current;
    prependRef.current = { pending: true, height: el ? el.scrollHeight : 0 };
  }, []);

  // Ao mudar a mensagem do TOPO (antigas carregadas), compensa o scrollTop para
  // manter a MESMA mensagem visível (sem salto).
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !prependRef.current.pending) return;
    const delta = el.scrollHeight - prependRef.current.height;
    if (delta > 0) el.scrollTop += delta;
    prependRef.current = { pending: false, height: 0 };
  }, [opts.topItemId]);

  /** Sinaliza novas mensagens não vistas (usuário lendo histórico). */
  const addUnseen = React.useCallback((n: number) => {
    if (atBottomRef.current) return;
    setUnseenCount((c) => c + n);
  }, []);
  const resetUnseen = React.useCallback(() => setUnseenCount(0), []);

  return { ref, isAtBottom, unseenCount, scrollToBottom, beforePrepend, addUnseen, resetUnseen };
}
