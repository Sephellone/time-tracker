<template>
  <base-page class="entries">
    <page-title class="pr-4 pl-2 pt-4 mb-6" title="Архив записей">
      <template #actions>
        <icon-button class="entries__add">
          <circle-plus />
        </icon-button>
      </template>
    </page-title>
    <infinite-scroll ref="infiniteScrollRef" :isLoading="loading" :enable-scroll="hasMore" @load-more="getNextPage">
      <div class="entries__list d-flex __column gap-3 px-4">
        <entry-item v-for="entry in entries" :key="entry.id" :entry="entry" @edit="onOpenEditModal" />
      </div>
    </infinite-scroll>
    <edit-time-entry-modal
      :show="showEditModal"
      :entry="entryToEdit"
      @newEntry="addItem"
      @updateEntry="updateItem"
      @close="onCloseEditModal"
    />
  </base-page>
</template>
<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import { CirclePlus } from "lucide-vue-next";
import PageTitle from "@/components/PageTitle.vue";
import IconButton from "@/components/IconButton.vue";
import { db } from "@/firebaseConfig.ts";
import { useUserStore } from "@/stores/user.ts";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  where,
  documentId,
} from "firebase/firestore";
import usePagination, { type PaginationResult } from "@/composables/usePagination.ts";
import type { TimeEntryDb, TimeEntry, Project } from "@/types.ts";
import { ref } from "vue";
import InfiniteScroll from "@/components/InfiniteScroll.vue";
import EntryItem from "@/views/PageEntries/components/EntryItem.vue";
import EditTimeEntryModal from "@/components/EditTimeEntryModal.vue";

const userStore = useUserStore();
const loading = ref(false);
const entryToEdit = ref<TimeEntry | null>(null);
const showEditModal = ref(false);

const onCloseEditModal = () => {
  showEditModal.value = false;
  entryToEdit.value = null;
};

const onOpenEditModal = (entry: TimeEntry) => {
  entryToEdit.value = entry;
  showEditModal.value = true;
};

const fetchTimeEntries = async (
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
): Promise<PaginationResult<TimeEntry>> => {
  if (!userStore.user) {
    return { docs: [], lastDoc: null };
  }

  const entriesRef = collection(db, "users", userStore.user.uid, "timeEntries");

  const q = lastDoc
    ? query(entriesRef, orderBy("date", "desc"), startAfter(lastDoc), limit(10))
    : query(entriesRef, orderBy("date", "desc"), limit(10));

  const querySnapshot = await getDocs(q);

  const timeEntriesDb = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TimeEntryDb[];

  if (timeEntriesDb.length === 0) {
    return {
      docs: [],
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
    };
  }

  const projectIds = [...new Set(timeEntriesDb.map((entry) => entry.projectId))];

  const projectsRef = collection(db, "users", userStore.user.uid, "projects");
  const projectsQuery = query(projectsRef, where(documentId(), "in", projectIds));
  const projectsSnapshot = await getDocs(projectsQuery);

  const projectsMap = new Map<string, Project>();
  projectsSnapshot.docs.forEach((doc) => {
    projectsMap.set(doc.id, { id: doc.id, ...doc.data() } as Project);
  });

  const enrichedEntries: TimeEntry[] = timeEntriesDb.map((entry) => {
    const project = projectsMap.get(entry.projectId);
    return {
      ...entry,
      projectName: project?.name || "Unknown Project",
      projectColor: project?.color,
      cost: project?.hourlyRate ? (entry.duration / 3600) * project.hourlyRate : null,
      currency: project?.currency,
    };
  });

  return {
    docs: enrichedEntries,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
  };
};

const {
  items: entries,
  getFirstPage: getEntries,
  hasMore,
  getNextPage,
  reset,
  addItem,
  updateItem,
} = usePagination<TimeEntry>(fetchTimeEntries);

const getData = async () => {
  if (!userStore.user) return;
  try {
    loading.value = true;
    reset();
    await getEntries();
  } finally {
    loading.value = false;
  }
};

getData();
</script>

<style scoped lang="scss"></style>
