"use client";

import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatList } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { SessionCard } from "@/components/admin/session-card";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { useToast } from "@/components/ui/toast";
import { memberStatusLabel, memberStatusTone } from "@/mocks/admin/team";
import { sessions, securityHistory } from "@/mocks/admin/security";
import type { TeamMember } from "@/types/admin";

const activity = [
  { id: "a1", text: "Atualizou o contato **Ana Martins**", time: "Hoje, 10:12" },
  { id: "a2", text: "Fechou a oportunidade **Deal #932**", time: "Ontem, 16:40" },
  { id: "a3", text: "Publicou a automação **Recuperação de carrinho**", time: "10 jul, 14:05" },
  { id: "a4", text: "Exportou o relatório **Desempenho de vendas**", time: "09 jul, 09:30" },
];

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

export function TeamMemberProfile({ member }: { member: TeamMember }) {
  const { toast } = useToast();
  const devices = sessions;

  return (
    <DetailPageLayout
      title={member.name}
      subtitle={member.email}
      back={{ href: "/team", label: "Equipe" }}
      actions={<Button onClick={() => toast({ title: "Editar usuário (mock)" })}><Pencil className="size-4" aria-hidden /> Editar</Button>}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <EntityAvatar name={member.name} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral" className="normal-case">{member.role}</Badge>
            <Badge tone={memberStatusTone[member.status]}>{memberStatusLabel[member.status]}</Badge>
            {member.twoFactor ? <Badge tone="success">2FA ativo</Badge> : <Badge tone="warning">2FA inativo</Badge>}
          </div>
          <p className="mt-1 text-caption text-ink-3">{member.company} · Último acesso: {member.lastAccess}</p>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="no-scrollbar overflow-x-auto">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-5">
            <StatList
              items={[
                { label: "Nome", value: member.name },
                { label: "E-mail", value: member.email },
                { label: "Cargo", value: member.role },
                { label: "Empresa", value: member.company },
                { label: "Status", value: memberStatusLabel[member.status] },
                { label: "2FA", value: member.twoFactor ? "Ativo" : "Inativo" },
                { label: "Último acesso", value: member.lastAccess },
              ]}
            />
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="flex flex-col gap-3">
            {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionMatrix readOnly />
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-5">
            <StatList items={securityHistory.map((h) => ({ label: `${h.event} · ${h.actor}`, value: h.time }))} />
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-5">
            <ol className="flex flex-col gap-4">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  <div>
                    <p className="text-body2 text-ink-2">{renderBold(a.text)}</p>
                    <p className="text-caption text-ink-3">{a.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
