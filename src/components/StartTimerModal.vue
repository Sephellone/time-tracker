<template>
  <base-modal
    :value="show"
    class="start-timer"
    title="Запустить таймер"
    :style="{ '--color': color }"
    @close="$emit('close')"
  >
    <div v-if="loading" class="d-center pa-10">
      <base-loader />
    </div>
    <template v-else>
      <base-select
        class="start-timer__select mb-5"
        v-model="selectedProject"
        :options="selectOptions"
        label="Проект"
        name="select"
      />
      <div class="start-timer__hint d-flex __column pa-4 mb-8 gap-1">
        <span>Если в списке нет нужного проекта, возможно, он был перемещен в архив.</span>
        <router-link class="start-timer__link" to="/projects">Посмотреть и настроить проекты</router-link>
      </div>
      <base-button full-width :loading="starting" :disabled="!selectedProject" @click="onClick">Старт</base-button>
    </template>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "@/components/BaseModal.vue";
import { useUserStore } from "@/stores/user.ts";
import { computed, ref } from "vue";
import type { Project, SelectOption } from "@/types.ts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig.ts";
import BaseSelect from "@/components/BaseSelect.vue";
import BaseButton from "@/components/BaseButton.vue";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";
import BaseLoader from "@/components/BaseLoader.vue";

defineProps({
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const userStore = useUserStore();
const loading = ref(false);
const starting = ref(false);
const projects = ref<Project[]>([]);

const selectedProject = ref("");

const color = computed(() => {
  if (selectedProject.value) {
    const project = projects.value.find((project) => project.id === selectedProject.value);
    return project?.color ?? "var(--palette-bg)";
  }
  return "var(--palette-bg)";
});

const selectOptions = computed<SelectOption[]>(() =>
  projects.value.map((i) => ({
    value: i.id,
    text: i.name,
  })),
);

const onClick = () => {
  if (!selectedProject.value) return;
  starting.value = true;
  emitter.emit(EVENTS.START_TIMER, {
    projectId: selectedProject.value,
    cb: () => {
      starting.value = false;
      emit("close");
    },
  });
};

const getData = async () => {
  if (!userStore.user) return;

  loading.value = true;
  try {
    const projectsRef = collection(db, "users", userStore.user.uid, "projects");
    const q = query(projectsRef, where("archived", "==", false));

    const snapshot = await getDocs(q);
    projects.value = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        color: data.color,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
        totalDuration: data.totalDuration || 0,
        archived: data.archived,
        lastEntryDate: data.lastEntryDate,
        createTime: data.createTime,
      };
    });
  } finally {
    loading.value = false;
  }
};

getData();
</script>

<style scoped lang="scss">
.start-timer {
  --color: var(--palette-bg);
  :deep(.base-modal__content) {
    max-width: 400px;
    border-top: 7px solid var(--color);
    transition: all 0.3s ease;
  }

  &__hint {
    background-color: var(--palette-secondary);
    border-radius: 10px;
  }

  &__link {
    color: var(--palette-primary);
  }
}
</style>
