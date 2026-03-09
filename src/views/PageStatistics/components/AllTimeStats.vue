<template>
  <div class="all-time-stats">
    <h2 class="all-time-stats__heading">Статистика за все время</h2>

    <div v-if="loading" class="all-time-stats__loading">
      <base-loader />
    </div>

    <div v-else-if="error" class="all-time-stats__error">
      {{ error }}
    </div>

    <div v-else class="all-time-stats__content">
      <top-projects :top-projects="topProjects" :least-tracked-projects="leastTrackedProjects" />
      <projects-donut-chart :projects="topProjects" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import BaseLoader from "@/components/BaseLoader.vue";
import { fetchTopProjects, fetchLeastTrackedProjects } from "../utils/dataFetchers";
import type { ProjectStats } from "../utils/dataFetchers";
import ProjectsDonutChart from "./ProjectsDonutChart.vue";
import TopProjects from "./TopProjects.vue";

const userStore = useUserStore();
const topProjects = ref<ProjectStats[]>([]);
const leastTrackedProjects = ref<ProjectStats[]>([]);
const loading = ref(true);
const error = ref("");

async function loadData() {
  if (!userStore.user) {
    error.value = "Пользователь не авторизован";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const [topProjectsData, leastTrackedData] = await Promise.all([
      fetchTopProjects(userStore.user.uid, 100),
      fetchLeastTrackedProjects(userStore.user.uid),
    ]);

    topProjects.value = topProjectsData;
    leastTrackedProjects.value = leastTrackedData;
  } catch (err: any) {
    error.value = err.message || "Ошибка загрузки данных";
    console.error("Error loading all-time stats:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.all-time-stats {
  &__heading {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 24px 0;
    color: var(--palette-fg);
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
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}
</style>
