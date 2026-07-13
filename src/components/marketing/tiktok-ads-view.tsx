import { Music2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdAccountCard } from "@/components/marketing/ad-account-card";
import { AdMetricsTable } from "@/components/marketing/ad-metrics-table";
import { tiktokAccounts, tiktokCampaigns } from "@/mocks/marketing/tiktok-ads";

export function TikTokAdsView() {
  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col items-start gap-4 border-brand/20 bg-brand-soft/40 p-5 sm:flex-row sm:items-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
          <Music2 className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-h2 font-bold text-ink">TikTok Ads</h2>
            <Badge tone="brand" size="md">Beta</Badge>
          </div>
          <p className="mt-0.5 text-body2 text-ink-2">
            Integração em evolução — as métricas abaixo são demonstrativas. Novos recursos chegam em breve.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-caption font-medium text-ink-2">
          <Sparkles className="size-3.5 text-brand" aria-hidden /> Em breve
        </span>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tiktokAccounts.map((a) => <AdAccountCard key={a.id} account={a} />)}
      </div>

      <div>
        <p className="mb-3 font-display text-h3 font-semibold text-ink">Campanhas</p>
        <AdMetricsTable rows={tiktokCampaigns} nameHeader="Campanha" />
      </div>
    </div>
  );
}
