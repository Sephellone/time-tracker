<template>
  <div class="top-projects">
    <div class="top-projects__section">
      <h3 class="top-projects__title mb-4">Топ-3 проектов</h3>
      <div v-if="topProjects.length === 0" class="top-projects__empty">Нет данных</div>
      <div v-else class="top-projects__list">
        <projects-top-list-item
          v-for="(project, index) in topProjects.slice(0, 3)"
          :key="project.id"
          :index="index"
          :project="project"
        />
      </div>
    </div>

    <div class="top-projects__section">
      <h3 class="top-projects__title mb-4">Анти-топ-3</h3>
      <div v-if="leastTrackedProjects.length === 0" class="top-projects__empty">Нет данных</div>
      <div v-else class="top-projects__list">
        <projects-top-list-item
          v-for="(project, index) in leastTrackedProjects"
          :key="project.id"
          :index="index"
          :project="project"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectStats } from "../utils/dataFetchers";
import ProjectsTopListItem from "@/views/PageStatistics/components/ProjectsTopListItem.vue";

defineProps<{
  topProjects: ProjectStats[];
  leastTrackedProjects: ProjectStats[];
}>();
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";
.top-projects {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @include mixins.tablet-up {
    grid-template-columns: 1fr 1fr;
  }


  &__section {
    background: var(--palette-bg-secondary);
    border-radius: 12px;
    padding: 20px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__empty {
    color: var(--palette-gray);
    text-align: center;
    padding: 20px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--palette-bg);
    border-radius: 8px;
  }

  &__rank {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--palette-primary);
    color: var(--palette-white);
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
  }

  &__color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  &__info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-weight: 500;
    color: var(--palette-fg);
  }

  &__duration {
    color: var(--palette-gray);
    font-size: 14px;
  }
}
</style>
