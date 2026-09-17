export const DASHBOARD_RANGES = [7, 30, 90] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export function parseDashboardRange(
  value: string | string[] | undefined,
): DashboardRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);

  return DASHBOARD_RANGES.includes(parsed as DashboardRange)
    ? (parsed as DashboardRange)
    : 30;
}

export function dashboardWindow(days: DashboardRange, now = new Date()) {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  return { start, end };
}

export function dashboardRangeLabel(days: DashboardRange) {
  return `Last ${days} days`;
}
