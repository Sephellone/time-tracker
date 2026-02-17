<template>
  <div class="recent-project-item d-flex __column" :style="{ '--color': project.color }">
    <div class="recent-project-item__name comforta mb-3">{{ project.name }}</div>
    <div class="recent-project-item__time d-flex __column gap-1 mb-3">
      <span class="recent-project-item__subtitle">Общее время:</span>
      <span class="recent-project-item__data">{{ formatElapsedTime(project.totalDuration) }}</span>
    </div>
    <div class="recent-project-item__time d-flex __column gap-1 mb-5">
      <span class="recent-project-item__subtitle">Последняя запись:</span>
      <span class="recent-project-item__data">{{ lastDate }}</span>
    </div>
    <base-button
      class="recent-project-item__start mt-auto"
      :disabled="!!timerStore.activeTimer"
      :loading="loading"
      spinner-size="24px"
      full-width
      small
      @click="onClick"
    >
      <Play :size="24" />
    </base-button>
  </div>
</template>
<script setup lang="ts">
import { computed, type PropType, ref } from "vue";
import type { Project } from "@/types.ts";
import { formatDate, formatElapsedTime } from "@/lib/time.ts";
import { Play } from "lucide-vue-next";
import BaseButton from "@/components/BaseButton.vue";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";
import { useTimerStore } from "@/stores/timer.ts";

const props = defineProps({
  project: { type: Object as PropType<Project>, required: true },
});
const loading = ref(false);
const timerStore = useTimerStore();

const lastDate = computed(() => {
  const date = props.project.lastEntryDate.toDate();
  if (date < new Date("2000-01-01")) return "Нет данных";
  return formatDate(date, { year: "numeric" });
});

const onClick = () => {
  loading.value = true;
  emitter.emit(EVENTS.START_TIMER, { projectId: props.project.id, cb: () => (loading.value = false) });
};
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";
.recent-project-item {
  --color: #ffffff;
  width: 173px;
  flex-shrink: 0;
  background-color: var(--palette-bg-secondary);
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 4px 10px var(--shadow-color);
  border-top: 4px solid var(--color);
  @include mixins.desktop-up {
    flex: 1 1 0;
  }

  &__name {
    font-size: 20px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
