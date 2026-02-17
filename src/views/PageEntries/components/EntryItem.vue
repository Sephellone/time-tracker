<template>
  <div class="entry-item d-flex __align-center __space-between" :style="{ '--color': entry.projectColor }">
    <div class="entry-item__body d-flex __column">
      <h3 class="entry-item__title comforta mb-1">{{ entry.projectName }}</h3>
      <div class="entry-item__date mb-2">
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
      <div class="entry-item__duration mt-auto">
        {{ formatElapsedTime(entry.duration) }}
      </div>
    </div>
    <div class="entry-item__actions d-flex __column __space-between">
      <icon-button class="entry-item__edit" color="var(--palette-primary)" @click="$emit('edit', entry)">
        <edit />
      </icon-button>
      <icon-button class="entry-item__delete" color="var(--palette-negative)" @click="$emit('delete', entry)">
        <trash-2 />
      </icon-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from "vue";
import type { TimeEntry } from "@/types.ts";
import IconButton from "@/components/IconButton.vue";
import { Edit, Trash2 } from "lucide-vue-next";
import { formatDate, formatElapsedTime } from "@/lib/time.ts";

defineProps({
  entry: { type: Object as PropType<TimeEntry>, required: true },
});

defineEmits(["edit", "delete"]);
</script>

<style scoped lang="scss">
.entry-item {
  --color: var(--palette-primary);
  width: 100%;
  background-color: var(--palette-bg-secondary);
  border-radius: 20px;
  border-top: 4px solid var(--color);
  padding: 16px;

  &__body {
    flex-grow: 1;
    min-width: 0;
  }
  &__title {
    text-overflow: ellipsis;
    overflow: hidden;
    min-width: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--palette-fg);
  }
  &__date {
    font-size: 14px;
    color: var(--palette-gray);
  }
  &__duration {
    font-family: "Roboto Mono", monospace;
    font-size: 20px;
    color: var(--palette-primary);
  }
}
</style>
