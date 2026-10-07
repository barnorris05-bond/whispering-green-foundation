"use client";

import dynamic from "next/dynamic";

/**
 * Recharts is the heaviest client dependency in the admin bundle and is only
 * needed once the dashboard has verified records. Splitting it into its own
 * chunk keeps it out of the dashboard's initial JavaScript; the placeholder
 * reserves the same height so the card does not jump while it loads.
 */
const ImpactChart = dynamic(() => import("./impact-chart").then((m) => m.ImpactChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full skeleton rounded-xl" aria-hidden />,
});

export function LazyImpactChart({
  data,
}: {
  data: Array<{ date: string; quantity: number; estimated: boolean }>;
}) {
  return <ImpactChart data={data} />;
}
