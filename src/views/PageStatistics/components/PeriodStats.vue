<template>
  <div class="period-stats">
    <h2 class="period-stats__heading">Активность за период</h2>
    
    <period-selector v-model="selectedPeriod" class="period-stats__selector" />
    
    <div v-if="loading" class="period-stats__loading">
      <base-loader />
    </div>
    
    <div v-else-if="error" class="period-stats__error">
      {{ error }}
    </div>
    
    <div v-else class="period-stats__content">
      <activity-line-chart 
        :entries="entries" 
        :projects="projects"
        :period-days="currentPeriodDays"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { fetchTimeEntriesInPeriod, fetchTopProjects } from "../utils/dataFetchers";
import type { ProjectStats } from "../utils/dataFetchers";
import type { TimeEntry } from "@/types";
import { PERIOD_OPTIONS, getPeriodDates } from "../utils/chartHelpers";
import PeriodSelector from "./PeriodSelector.vue";
import ActivityLineChart from "./ActivityLineChart.vue";
import BaseLoader from "@/components/BaseLoader.vue";

const userStore = useUserStore();
const selectedPeriod = ref("week");
const entries = ref<TimeEntry[]>([]);
const projects = ref<ProjectStats[]>([]);
const loading = ref(true);
const error = ref("");

const currentPeriodDays = computed(() => {
  const option = PERIOD_OPTIONS.find(o => o.value === selectedPeriod.value);
  return option?.days || 7;
});

async function loadData() {
  if (!userStore.user) {
    error.value = "Пользователь не авторизован";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    
    const { startDate, endDate } = getPeriodDates(currentPeriodDays.value);
    
    const [entriesData, projectsData] = await Promise.all([
      fetchTimeEntriesInPeriod(userStore.user.uid, startDate, endDate),
      fetchTopProjects(userStore.user.uid, 100),
    ]);
    
    entries.value = entriesData;
    projects.value = projectsData;
  } catch (err: any) {
    error.value = err.message || "Ошибка загрузки данных";
    console.error("Error loading period stats:", err);
  } finally {
    loading.value = false;
  }
}

watch(selectedPeriod, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.period-stats {
  &__heading {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 24px 0;
    color: var(--palette-fg);
  }

  &__selector {
    margin-bottom: 24px;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 60px 20px;
  }

  &__error {
    background: var(--palette-bg-secondary);
    color: var(--palette-negative);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
  }

  &__content {
    background: var(--palette-bg-secondary);
    border-radius: 12px;
    padding: 20px;
  }
}
</style>
