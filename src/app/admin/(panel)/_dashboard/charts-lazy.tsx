"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/admin/chart-card";

/*
  Recharts is around 90kB of the dashboard's JavaScript and nothing above the
  fold needs it — the KPI row and the live order board are what an admin looks
  at first. Loading the figures separately lets the numbers paint immediately
  and keeps recharts out of the shared admin chunk.

  ssr: false because recharts measures its container to size the plot, so there
  is nothing useful to render on the server. Each chart keeps its own
  card-shaped skeleton, so the dashboard does not shift when one arrives.

  Every call is spelled out in full. next/dynamic is read by the compiler, not
  at runtime: it rejects a shared options object ("options must be an object
  literal"), and a generic helper around it collapses the component's props
  to `never`.
*/

export const RevenueChart = dynamic(
  () => import("./charts").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const OrdersByHourChart = dynamic(
  () => import("./charts").then((m) => m.OrdersByHourChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const TopItemsChart = dynamic(
  () => import("./charts").then((m) => m.TopItemsChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const OrderTypeSplitChart = dynamic(
  () => import("./charts").then((m) => m.OrderTypeSplitChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const PaymentSplitChart = dynamic(
  () => import("./charts").then((m) => m.PaymentSplitChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const OnTimeCard = dynamic(
  () => import("./charts").then((m) => m.OnTimeCard),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
