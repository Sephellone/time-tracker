<template>
  <div class="project-item pa-5" :style="{ '--color': project.color }">
    <div class="project-item__body d-flex gap-3">
      <div class="project-item__content">
        <div class="project-item__title comforta mb-1">{{ project.name }}</div>
        <div class="project-item__description">{{ project.description }}</div>
      </div>
      <icon-button v-if="!project.archived" class="project-item__edit-button" color="var(--palette-primary)" @click="onEditClick">
        <edit />
      </icon-button>
    </div>
    <div class="project-item__footer d-flex __align-center gap-2 __space-between mt-4">
      <div class="project-item__footer__left">
        <div class="project-item__created">Создан: {{ createdAt }}</div>
      </div>
      <div class="project-item__footer__right">
        <base-button small :secondary="!project.archived" @click="onArchiveClick">
          {{ project.archived ? "Сделать активным" : "В архив" }}
        </base-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { Project } from "@/types.ts";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";
import IconButton from "@/components/IconButton.vue";
import { Edit } from "lucide-vue-next";
import { formatDate } from "@/lib/time.ts";
import BaseButton from "@/components/BaseButton.vue";

const props = defineProps({
  project: { type: Object as PropType<Project>, required: true },
});

const emit = defineEmits(["archive"]);

const onEditClick = () => {
  emitter.emit(EVENTS.OPEN_EDIT_PROJECT_MODAL, props.project);
};

const createdAt = computed(() => {
  return formatDate(props.project.createTime.toDate());
});

const onArchiveClick = async () => {
  emit("archive", props.project);
};
</script>

<style scoped lang="scss">
.project-item {
  --color: var(--palette-primary);
  background-color: var(--palette-bg-secondary);
  border-radius: 20px;

  border-top: 4px solid var(--color);

  &__body {
    align-items: flex-start;
  }
  &__content {
    flex-grow: 1;
  }

  &__edit-button {
   align-self: flex-start;
  }

  &__footer {
    border-top: 1px solid var(--palette-gray);
    padding-top: 16px;
  }

  &__title {
    font-size: 16px;
  }

  &__description {
    font-size: 14px;
    color: var(--palette-gray);
  }
}
</style>
