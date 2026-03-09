import type { TimeEntry } from "@/types";
import type { ProjectStats } from "./dataFetchers";
import { formatDate } from "@/lib/time.ts";

export interface PeriodOption {
  label: string;
  value: string;
  days: number;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { label: "Последняя неделя", value: "week", days: 7 },
  { label: "Последние 2 недели", value: "twoWeeks", days: 14 },
  { label: "Последний месяц", value: "month", days: 30 },
  { label: "Последний квартал", value: "quarter", days: 90 },
];

export function getPeriodDates(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}м`;
  }

  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
}

export interface ChartDataPoint {
  date: string;
  [projectId: string]: number | string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
}

export function groupEntriesByDateAndProject(
  entries: TimeEntry[],
  projects: Map<string, ProjectStats>,
  periodDays: number
): { labels: string[]; datasets: ChartDataset[] } {
  const isWeekly = periodDays > 14;
  const dateMap = new Map<string, Map<string, number>>();

  entries.forEach((entry) => {
    const date = entry.startTime.toDate();
    let dateKey: string;

    if (isWeekly) {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      dateKey = weekStart.toISOString().split("T")[0]!;
    } else {
      dateKey = date.toISOString().split("T")[0]!;
    }

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, new Map());
    }

    const projectMap = dateMap.get(dateKey)!;
    const currentDuration = projectMap.get(entry.projectId) || 0;
    projectMap.set(entry.projectId, currentDuration + entry.duration);
  });

  const sortedDates = Array.from(dateMap.keys()).sort();

  const projectIds = new Set<string>();
  entries.forEach((entry) => projectIds.add(entry.projectId));

  const datasets = Array.from(projectIds).map((projectId) => {
    const project = projects.get(projectId);
    const data = sortedDates.map((date) => {
      const duration = dateMap.get(date)?.get(projectId) || 0;
      return duration / 3600;
    });

    return {
      label: project?.name || "Unknown",
      data,
      borderColor: project?.color || "#999",
      backgroundColor: project?.color || "#999",
      tension: 0.3,
      fill: false,
    };
  });

  const labels = sortedDates.map((date) => {
    const d = new Date(date);
    return formatDate(d, { month: "numeric" });
  });

  return { labels, datasets };
}
