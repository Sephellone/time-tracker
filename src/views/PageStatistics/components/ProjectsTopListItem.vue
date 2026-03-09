<template>
  <div class="top-projects-item d-flex __align-center gap-2">
    <div class="top-projects-item__rank d-center" :style="{ backgroundColor: project.color }">{{ index + 1 }}</div>
    <div class="top-projects-item__info d-flex __align-center __space-between gap-2">
      <div class="top-projects-item__name">{{ project.name }}</div>
      <div class="top-projects-item__duration">{{ formatDurationString(project.totalDuration) }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatDurationString } from "@/lib/time.ts";
import type { PropType } from "vue";
import type { Project } from "@/types.ts";
defineProps({
  project: { type: Object as PropType<Project>, required: true },
  index: { type: Number, required: true },
});
</script>

<style scoped lang="scss">
.top-projects-item {
  &__rank {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    background: var(--palette-primary);
    color: var(--palette-white);
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
  }

  &__info {
    flex-grow: 1;
  }

  &__name {
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__duration {
    flex-shrink: 0;
    text-align: right;
    color: var(--palette-gray);
  }
}
</style>
