<template>
  <div class="recent-entry-item d-flex __align-center __space-between pa-3" :style="{'--color': entry.projectColor}">
    <div class="recent-entry-item__info">
      <div class="recent-entry-item__project-name comforta fw-600 mb-1">
        {{ entry.projectName }}
      </div>
      <div class="recent-entry-item__date">
        {{
          formatDate(entry.startTime, {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </div>
    </div>
    <div class="recent-entry-item__duration">
      {{ formatElapsedTime(entry.duration) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TimeEntry } from "@/types.ts";
import type { PropType } from "vue";
import { formatDate, formatElapsedTime } from "@/lib/time.ts";

defineProps({
  entry: { type: Object as PropType<TimeEntry>, required: true },
});
</script>

<style scoped lang="scss">
.recent-entry-item {
  --color: var(--palette-primary);
  width: 100%;
  border-radius: 12px;
  background-color: var(--palette-bg-secondary);

  border-left: 4px solid var(--color);

  &__project-name {
   font-size: 14px;
  }

  &__date {
    font-size: 12px;
    color: var(--palette-gray);
  }

  &__duration {
    font-size: 16px;
  }
}
</style>
