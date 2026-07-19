import { NextResponse, type NextRequest } from "next/server";

/** Rotas públicas (não exigem sessão). */
const PUBLIC_PATHS = new Set<string>(["/", "/login", "/register"]);

/** Rotas de autenticação: já logado, não faz sentido revê-las. */
const AUTH_PATHS = new Set<string>(["/login", "/register"]);

const ACCESS_COOKIE = "fg_at";
const REFRESH_COOKIE = "fg_rt";

/**
 * Proteção das rotas internas (Next 16 "proxy", antigo middleware):
 * qualquer rota fora das públicas exige um cookie de sessão (access ou
 * refresh). Sem sessão → redireciona para /login preservando o destino em
 * `next`. Usuário autenticado que acessa /login é levado ao /dashboard.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasSession =
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  if (AUTH_PATHS.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    const target = `${pathname}${search}`;
    if (target && target !== "/") {
      loginUrl.searchParams.set("next", target);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protege tudo, exceto API (BFF), assets estáticos e arquivos de marca.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|brand|.*\\.(?:png|jpg|jpeg|svg|ico|webmanifest)$).*)",
  ],
};
