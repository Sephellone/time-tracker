<template>
  <div class="projects-donut">
    <h3 class="projects-donut__title mb-4">Распределение времени по проектам</h3>
    <div v-if="hasData" class="projects-donut__container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="projects-donut__empty">Нет данных для отображения</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from "chart.js";
import type { ProjectStats } from "../utils/dataFetchers";
import { formatDurationString } from "@/lib/time.ts";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const props = defineProps<{
  projects: ProjectStats[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const hasData = computed(() => {
  return props.projects.some((p) => p.totalDuration > 0);
});

const projectsWithTime = computed(() => {
  return props.projects.filter((p) => p.totalDuration > 0);
});

function createChart() {
  if (!chartCanvas.value || !hasData.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  const data = projectsWithTime.value.map((p) => p.totalDuration);
  const labels = projectsWithTime.value.map((p) => p.name);
  const colors = projectsWithTime.value.map((p) => p.color);

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e0e0e0",
            padding: 12,
            font: {
              size: 12,
            },
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0]!.data[i] as number;
                  const timeStr = formatDurationString(Math.floor(value));

                  return {
                    text: `${label}: ${timeStr}`,
                    fillStyle: (data.datasets[0]!.backgroundColor as string[])[i],
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              return formatDurationString(value);
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
  () => props.projects,
  () => {
    createChart();
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.projects-donut {
  background: var(--palette-bg-secondary);
  border-radius: 12px;
  padding: 20px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--palette-fg);
  }

  &__empty {
    color: var(--palette-gray);
    text-align: center;
    padding: 40px 20px;
  }
}
</style>
