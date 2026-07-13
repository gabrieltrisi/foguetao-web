import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { recentActivities } from "@/mocks/dashboard";

/** Renderiza texto com trechos em **negrito**. */
function RichText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function RecentActivities() {
  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Atividades recentes"
        action={<span className="text-body2 font-medium text-brand">Ver tudo</span>}
      />
      <ul className="mt-4 flex flex-col gap-4">
        {recentActivities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <Avatar initials={item.actorInitials} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-body2 text-ink-2">
                <RichText text={item.text} />
              </p>
              <p className="mt-0.5 text-caption text-ink-3">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
