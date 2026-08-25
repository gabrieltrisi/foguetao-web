"use client";

import { ApiError, apiErrorFromResponse, unavailableError } from "@/types/api/error";

/**
 * Cliente HTTP do browser → BFF do Next (/api/*). O browser nunca fala
 * diretamente com o backend; os tokens ficam em cookies httpOnly no servidor.
 * Erros do BFF (formato estável) são convertidos em ApiError.
 */
export async function clientFetch<T = unknown>(
  path: string,
  init?: { method?: string; body?: unknown; signal?: AbortSignal },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init?.signal,
      credentials: "same-origin",
    });
  } catch {
    throw unavailableError("Não foi possível conectar ao servidor");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    throw apiErrorFromResponse(response.status, payload);
  }
  return payload as T;
}

export { ApiError };
