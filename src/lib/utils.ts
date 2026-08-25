import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge precisa conhecer os tokens de tipografia customizados
 * (text-display, text-body, text-small…) para não confundi-los com utilitários
 * de cor de texto (text-success, text-ink…) e acabar descartando a cor.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "body",
            "body2",
            "small",
            "caption",
            "micro",
          ],
        },
      ],
    },
  },
});

/** Combina classes condicionais e resolve conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
