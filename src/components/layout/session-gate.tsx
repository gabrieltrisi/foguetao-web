"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogIn, ServerCrash, ShieldAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { SessionStateScreen } from "@/components/layout/session-state-screen";
import { useSession } from "@/providers/session-provider";
import { useLogout } from "@/hooks/auth/use-logout";

const ONBOARDING_PATH = "/onboarding";

/** Loader de página inteira enquanto o bootstrap da sessão carrega/redireciona. */
function FullPageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface">
      <Logo variant="sidebar-balanced" className="h-9 w-auto dark:hidden" />
      <Logo variant="mono" white className="hidden h-9 w-auto dark:block" />
      <span
        className="size-6 animate-spin rounded-full border-2 border-line border-t-brand"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}

/**
 * Portão de sessão da área autenticada. Traduz o `status` computado pelo
 * SessionProvider em navegação/telas concretas (antes só existia o cálculo):
 *  - loading                → loader de página inteira;
 *  - no-companies           → redireciona ao onboarding (e o renderiza lá);
 *  - ready                  → app normal (redireciona para fora do onboarding);
 *  - expired / unavailable / error / company-inaccessible → tela de estado.
 *
 * Nenhum usuário fica preso "sem empresa" nem vê uma tela quebrada.
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const { status, companies, activeCompanyId, switchCompany, isSwitchingCompany, refetch } =
    useSession();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const onOnboarding = pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`);

  // Redirecionamentos (fora da renderização).
  React.useEffect(() => {
    if (status === "no-companies" && !onOnboarding) {
      router.replace(ONBOARDING_PATH);
    } else if (status === "ready" && onOnboarding) {
      router.replace("/dashboard");
    }
  }, [status, onOnboarding, router]);

  if (status === "loading") return <FullPageLoader />;

  if (status === "expired") {
    return (
      <SessionStateScreen
        icon={LogIn}
        title="Sua sessão expirou"
        description="Por segurança, encerramos sua sessão após um período inativo. Entre novamente para continuar."
      >
        <Button asChild>
          <Link href="/login">Ir para o login</Link>
        </Button>
      </SessionStateScreen>
    );
  }

  if (status === "unavailable") {
    return (
      <SessionStateScreen
        icon={ServerCrash}
        tone="danger"
        title="Servidor indisponível"
        description="Não conseguimos falar com o servidor agora. Aguarde alguns instantes e tente novamente."
      >
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </SessionStateScreen>
    );
  }

  if (status === "error") {
    return (
      <SessionStateScreen
        icon={TriangleAlert}
        tone="danger"
        title="Algo deu errado"
        description="Ocorreu um erro inesperado ao carregar sua conta. Tente novamente ou saia e entre outra vez."
      >
        <Button onClick={() => refetch()}>Tentar novamente</Button>
        <Button variant="secondary" onClick={() => logout.mutate(false)} loading={logout.isPending}>
          Sair
        </Button>
      </SessionStateScreen>
    );
  }

  if (status === "company-inaccessible") {
    const otherCompany = companies.find((c) => c.id !== activeCompanyId);
    return (
      <SessionStateScreen
        icon={ShieldAlert}
        tone="danger"
        title="Empresa inacessível"
        description="Sua empresa ativa está suspensa ou seu acesso a ela foi removido. Troque de empresa ou fale com o administrador da conta."
      >
        {otherCompany ? (
          <Button
            onClick={() => switchCompany(otherCompany.id)}
            loading={isSwitchingCompany}
          >
            <Building2 className="size-4" aria-hidden />
            Trocar para {otherCompany.name}
          </Button>
        ) : null}
        <Button variant="secondary" onClick={() => logout.mutate(false)} loading={logout.isPending}>
          Sair
        </Button>
      </SessionStateScreen>
    );
  }

  // no-companies: só renderiza o onboarding; fora dele, aguarda o redirect.
  if (status === "no-companies") {
    return onOnboarding ? <>{children}</> : <FullPageLoader />;
  }

  // ready: no onboarding, aguarda redirect ao dashboard; senão, app normal.
  if (onOnboarding) return <FullPageLoader />;
  return <>{children}</>;
}
