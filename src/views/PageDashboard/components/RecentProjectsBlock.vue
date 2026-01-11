<template>
  <div class="recent-projects-block">
    <div class="recent-projects-block__header d-flex __align-center __space-between">
      <h2 class="comforta fw-400">Недавние проекты</h2>
      <base-button class="recent-projects-block__all no-shrink" secondary to="/projects">К проектам →</base-button>
    </div>
    <div class="d-center">
      <base-loader v-if="loading" class="mt-5" />
      <div v-else-if="projects.length === 0" class="d-flex __align-center __column gap-2 pa-10">
        <div class="recent-projects-block__empty mb-3">Пока у вас нет проектов</div>
        <base-button class="recent-projects-block__new">
          <circle-plus class="mr-2" />
          Создать проект
        </base-button>
      </div>
      <div class="recent-projects-block__list d-flex flex-grow __space-between gap-3 px-2 py-4" v-else>
        <recent-project-item v-for="project in projects" :key="project.id" :project="project" />
        <div v-if="projects.length < 3" class="recent-projects-block__add-reminder d-center">
          <circle-plus :size="52" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Project } from "@/types.ts";
import { ref } from "vue";
import { useUserStore } from "@/stores/user.ts";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import RecentProjectItem from "@/components/RecentProjectItem.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseLoader from "@/components/BaseLoader.vue";
import { CirclePlus } from "lucide-vue-next";

const userStore = useUserStore();
const loading = ref(false);
const projects = ref<Project[]>([]);

const loadRecentProjects = async () => {
  if (!userStore.user?.uid) return;

  loading.value = true;
  try {
    const projectsRef = collection(db, "users", userStore.user.uid, "projects");
    const q = query(
      projectsRef,
      where("archived", "==", false),
      orderBy("lastEntryDate", "desc"),
      orderBy("createTime", "desc"),
      limit(3),
    );

    const snapshot = await getDocs(q);
    console.log(snapshot);
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
  } catch (error) {
    console.error("Error loading recent projects:", error);
  } finally {
    loading.value = false;
  }
};

loadRecentProjects();
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";
.recent-projects-block {
  &__list {
    max-width: 100%;
    overflow: scroll;

    @include mixins.desktop-up {
      overflow: hidden;
    }
  }

  &__add-reminder {
    width: 173px;
    background-color: var(--palette-bg-secondary);
    color: var(--palette-primary);
    border-radius: 20px;
    padding: 16px 20px;
    box-shadow: 0 4px 10px var(--shadow-color);
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: var(--palette-primary);
      color: var(--palette-bg-secondary);
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
