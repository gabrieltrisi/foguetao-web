import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { routeMeta } from "@/config/routes";

const path = "/integrations";

export const metadata: Metadata = {
  title: routeMeta[path].title,
  description: routeMeta[path].description,
};

export default function Page() {
  return <RoutePlaceholder path={path} />;
}
