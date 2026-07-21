import { defineSegment } from "./define";

/**
 * "Outro" — usa a versão GERAL. Só existe como opção do seletor (para quem não
 * se encaixa nos nichos); herda todo o conteúdo default e não mostra selo.
 */
export const OUTRO = defineSegment({ id: "outro", label: "Outro", emoji: "🌎" });
