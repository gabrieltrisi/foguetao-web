"use client";

import * as React from "react";
import { linkify } from "@/features/inbox/message-format";

/**
 * Texto de mensagem SEGURO (F2B): preserva quebras, quebra palavras/URLs longas,
 * permite seleção. NUNCA usa dangerouslySetInnerHTML. Links só http/https, em nova
 * aba com `rel="noopener noreferrer nofollow"`. Memoizado (linkify por texto).
 */
export const MessageText = React.memo(function MessageText({ text, onLink }: { text: string; onLink?: string }) {
  const segments = React.useMemo(() => linkify(text), [text]);
  return (
    <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
      {segments.map((s, i) =>
        s.type === "link" ? (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={onLink ?? "underline underline-offset-2 hover:opacity-80"}
          >
            {s.value}
          </a>
        ) : (
          <React.Fragment key={i}>{s.value}</React.Fragment>
        ),
      )}
    </span>
  );
});
