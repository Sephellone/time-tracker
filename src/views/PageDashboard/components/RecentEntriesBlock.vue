<template>
  <div class="recent-entries-block">
    <div class="recent-entries-block__header d-flex __align-center __space-between">
      <h2 class="comforta fw-400">Последние записи</h2>
      <base-button class="recent-entries-block__all no-shrink" secondary to="/entries">Показать все →</base-button>
    </div>
    <div class="d-center">
      <base-loader v-if="loading" class="mt-5" />
      <div v-else-if="timeEntries.length === 0" class="d-flex __align-center __column gap-2 pa-10">
        <div class="recent-entries-block__empty mb-3">Пока нет записей</div>
      </div>
      <div v-else class="recent-entries-block__list d-flex __column __space-between gap-3 py-4">
        <!--        <recent-project-item v-for="project in timeEntries" :key="project.id" :project="project" />-->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { ref } from "vue";
import type { Project, TimeEntry, TimeEntryDb } from "@/types.ts";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig.ts";
import { useUserStore } from "@/stores/user.ts";
import BaseLoader from "@/components/BaseLoader.vue";

const userStore = useUserStore();

const loading = ref(false);
const timeEntries = ref<TimeEntry[]>([]);

const getTimeEntries = async () => {
  if (!userStore.user) return;
  try {
    loading.value = true;
    const timeEntriesRef = collection(db, "users", userStore.user.uid, "timeEntries");
    const q = query(timeEntriesRef, orderBy("date", "desc"), orderBy("startTime", "desc"), limit(10));
    const entries = await getDocs(q);

    if (entries.empty) {
      timeEntries.value = [];
      return;
    }

    const projectIds = entries.docs.map((doc) => doc.data().projectId);

    const projectsRef = collection(db, "users", userStore.user.uid, "projects");
    const projectsQ = query(projectsRef, where("id", "in", projectIds));
    const projectsSnapshot = await getDocs(projectsQ);
    const projects = projectsSnapshot.docs.reduce(
      (acc, doc) => {
        acc[doc.id] = doc.data() as Project;
        return acc;
      },
      {} as Record<string, Project>,
    );

    timeEntries.value = entries.docs.map((doc) => {
      const project = projects[doc.data().projectId];
      const entry = doc.data() as TimeEntryDb;
      let cost = null;

      if (project?.hourlyRate && project.currency) {
        cost = (entry.duration / 3600) * project.hourlyRate;
      }
      return {
        id: entry.id,
        projectId: entry.projectId,
        projectName: project?.name ?? "Проект удален",
        projectColor: project?.color ?? "#d9d9d9",
        currency: project?.currency,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        type: entry.type,
        createdAt: entry.createdAt,
        cost,
      };
    });
  } finally {
    loading.value = false;
  }
};

getTimeEntries();
</script>

<style scoped></style>
