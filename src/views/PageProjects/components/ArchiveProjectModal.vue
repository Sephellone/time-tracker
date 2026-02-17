<template>
  <base-modal :value="show" class="archive-project-modal" @close="$emit('close')">
    <template v-if="project">
      <div class="archive-project-modal__title comforta mb-4 pr-6">{{ modalTitle }}</div>
      <div class="archive-project-modal__content">
        <template v-if="project.archived">
          <p>Вы снова сможете добавлять записи времени в этот проект</p>
        </template>
        <template v-else>
          <p>Вы не сможете добавлять записи времени для заархивированного проекта.</p>
          <p class="mt-3">Статистика по проекту останется доступной.</p>
        </template>
      </div>
      <div v-if="project" class="archive-project-modal__actions d-flex __align-center __justify-end gap-3 mt-5">
        <base-button small secondary @click="$emit('close')">Отмена</base-button>
        <base-button small :loading="loading" @click="onArchive">{{
          project.archived ? "Восстановить" : "В архив"
        }}</base-button>
      </div>
    </template>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "@/components/BaseModal.vue";
import { computed, type PropType, ref } from "vue";
import type { Project } from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";

const props = defineProps({
  project: { type: Object as PropType<Project | null> },
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "archive"]);

const loading = ref(false);

const modalTitle = computed(() => {
  return props.project?.archived
    ? `Сделать проект "${props.project?.name}" активным?`
    : `Отправить проект "${props.project?.name}" в архив?`;
});

const onArchive = () => {
  loading.value = true;
  emit("archive", () => {
    loading.value = false;
  });
};
</script>

<style scoped lang="scss">
.archive-project-modal {
  &__title {
    font-size: 18px;
  }
}
</style>
