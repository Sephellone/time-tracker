<template>
  <base-page class="projects">
    <page-title class="pr-4 pl-2 pt-4 mb-6" title="Проекты">
      <template #actions>
        <base-button small @click="onCreateProject">
          <plus class="mr-1" :size="16" />
          Создать проект
        </base-button>
      </template>
    </page-title>
    <base-tabs class="mb-6 mx-4" :items="tabs" v-model="activeTab" />
    <infinite-scroll ref="infiniteScrollRef" :isLoading="loading" :enable-scroll="hasMore" @load-more="handleLoadMore">
      <div class="projects__list d-flex __column gap-6 px-4">
        <project-item
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @archive="projectToArchive = $event"
        />
      </div>
    </infinite-scroll>
    <archive-project-modal
      :show="!!projectToArchive"
      :project="projectToArchive"
      @close="projectToArchive = null"
      @archive="toggleArchive"
    />
  </base-page>
</template>
<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import PageTitle from "@/components/PageTitle.vue";
import BaseButton from "@/components/BaseButton.vue";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";
import { Plus } from "lucide-vue-next";
import type { TabItem, Project } from "@/types.ts";
import { onBeforeUnmount, ref, watch } from "vue";
import BaseTabs from "@/components/BaseTabs.vue";
import { db } from "@/firebaseConfig.ts";
import { useUserStore } from "@/stores/user.ts";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  doc,
  updateDoc,
} from "firebase/firestore";
import InfiniteScroll from "@/components/InfiniteScroll.vue";
import usePagination, { type PaginationResult } from "@/composables/usePagination.ts";
import ProjectItem from "@/views/PageProjects/components/ProjectItem.vue";
import ArchiveProjectModal from "@/views/PageProjects/components/ArchiveProjectModal.vue";

const userStore = useUserStore();

const onCreateProject = () => {
  emitter.emit(EVENTS.OPEN_EDIT_PROJECT_MODAL, null);
};

const loading = ref(false);
const activeTab = ref<"active" | "archive">("active");

const tabs: TabItem[] = [
  {
    name: "active",
    text: "Активные",
  },
  {
    name: "archive",
    text: "Архив",
  },
];

const projectToArchive = ref<Project | null>(null);

const fetchProjects = async (
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
): Promise<PaginationResult<Project>> => {
  if (!userStore.user) {
    return { docs: [], lastDoc: null };
  }

  const projectsRef = collection(db, "users", userStore.user.uid, "projects");
  const isArchived = activeTab.value === "archive";

  const q = lastDoc
    ? query(
        projectsRef,
        where("archived", "==", isArchived),
        orderBy("lastEntryDate", "desc"),
        orderBy("createTime", "desc"),
        startAfter(lastDoc),
        limit(10),
      )
    : query(
        projectsRef,
        where("archived", "==", isArchived),
        orderBy("lastEntryDate", "desc"),
        orderBy("createTime", "desc"),
        limit(10),
      );

  const querySnapshot = await getDocs(q);

  const docs = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];

  return {
    docs,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
  };
};

const {
  items: projects,
  getFirstPage: getProjects,
  hasMore,
  getNextPage,
  reset,
  addItem,
  removeItem,
  updateItem,
} = usePagination<Project>(fetchProjects);
const infiniteScrollRef = ref<InstanceType<typeof InfiniteScroll> | null>(null);

const handleLoadMore = async () => {
  try {
    loading.value = true;
    await getNextPage();
  } finally {
    loading.value = false;
  }
};

const toggleArchive = async (cb: () => void) => {
  if (!projectToArchive.value || !userStore.user) return;
  try {
    const projectRef = doc(db, "users", userStore.user.uid, "projects", projectToArchive.value.id);
    await updateDoc(projectRef, {
      archived: !projectToArchive.value.archived,
    });
    removeItem(projectToArchive.value.id)
    projectToArchive.value = null;
  } finally {
    cb();
  }
};

watch(
  activeTab,
  async () => {
    try {
      loading.value = true;
      reset();
      await getProjects();
    } finally {
      loading.value = false;
    }
  },
  {
    immediate: true,
  },
);

emitter.on(EVENTS.PROJECT_CREATED, addItem);
emitter.on(EVENTS.PROJECT_DELETED, removeItem);
emitter.on(EVENTS.PROJECT_UPDATED, updateItem);

onBeforeUnmount(() => {
  emitter.off(EVENTS.PROJECT_CREATED, addItem);
  emitter.off(EVENTS.PROJECT_DELETED, removeItem);
  emitter.off(EVENTS.PROJECT_UPDATED, updateItem);
});
</script>

<style scoped lang="scss"></style>
