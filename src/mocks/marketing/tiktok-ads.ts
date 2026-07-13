import type { AdAccount } from "@/types/marketing";
import { makeAdRows } from "@/mocks/marketing/ads-shared";

export const tiktokAccounts: AdAccount[] = [
  { id: "tt-acc-1", name: "Foguetão · TikTok", platform: "tiktok", externalId: "tt_7382910475", status: "connected", spend: 8600, campaigns: 2, lastSync: "há 20 min" },
];

export const tiktokCampaigns = makeAdRows("tt-camp", [
  "TikTok Criadores", "Spark Ads — Depoimentos", "Awareness Gen Z", "Conversão App",
]);
