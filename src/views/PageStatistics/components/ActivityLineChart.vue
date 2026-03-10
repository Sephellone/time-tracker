<template>
  <div class="activity-chart">
    <div v-if="hasData" class="activity-chart__container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="activity-chart__empty">
      Нет данных за выбранный период
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { TimeEntry } from "@/types";
import type { ProjectStats } from "../utils/dataFetchers";
import { groupEntriesByDateAndProject } from "../utils/chartHelpers";
import { formatDurationString } from "@/lib/time.ts";
import { useDarkMode } from "@/stores/darkMode.ts";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  entries: TimeEntry[];
  projects: ProjectStats[];
  periodDays: number;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
const darkMode = useDarkMode();

const hasData = computed(() => {
  return props.entries.length > 0;
});

const projectsMap = computed(() => {
  const map = new Map<string, ProjectStats>();
  props.projects.forEach(p => map.set(p.id, p));
  return map;
});

function createChart() {
  if (!chartCanvas.value || !hasData.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  const { labels, datasets } = groupEntriesByDateAndProject(
    props.entries,
    projectsMap.value,
    props.periodDays
  );

  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--palette-fg')
    .trim();
  const grayColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--palette-gray')
    .trim();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            color: grayColor,
            maxRotation: 45,
            minRotation: 0,
          },
          grid: {
            color: grayColor + '20',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: grayColor,
          },
          grid: {
            color: grayColor + '20',
          },
          title: {
            display: true,
            text: "Время, ч",
            color: grayColor,
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: textColor,
            padding: 12,
            usePointStyle: true,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return formatDurationString(value! * 3600)
            },
          },
        },
      },
    },
  });
}

onMounted(() => {
  createChart();
});

watch(
  () => [props.entries, props.projects, props.periodDays],
  () => {
    createChart();
  },
  { deep: true }
);

watch(
  () => darkMode.isDark,
  () => {
    createChart();
  },
);
</script>

<style scoped lang="scss">
.activity-chart {
  &__container {
    max-width: 100%;
    margin: 0 auto;
  }

  &__empty {
    color: var(--palette-gray);
    text-align: center;
    padding: 60px 20px;
    background: var(--palette-bg-secondary);
    border-radius: 12px;
  }
}
</style>
