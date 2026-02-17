<template>
  <base-modal class="edit-time-entry-modal" :value="show" :title="title" @close="$emit('close')">
    <div class="edit-time-entry-modal__loading d-center pa-5" v-if="loading">
      <base-loader />
    </div>
    <base-form
      class="edit-time-entry-modal__form"
      :fields="formFields"
      :values="formValues"
      :errorFields="errorFields"
      @input="onInput"
    />
    <div class="d-flex __align-center __justify-end gap-3 mt-5">
      <base-button secondary :disabled="processing" @click="onCloseModal">Отмена</base-button>
      <base-button :loading="processing" @click="entry ? onUpdateEntry() : onCreateEntry()">
        {{ entry ? "Сохранить" : "Создать" }}
      </base-button>
    </div>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "@/components/BaseModal.vue";
import { computed, type PropType, ref, watch } from "vue";
import type { FormField, FormValues, Project, SelectOption, TimeEntry } from "@/types.ts";
import BaseForm from "@/components/BaseForm.vue";
import { db } from "@/firebaseConfig.ts";
import { useUserStore } from "@/stores/user.ts";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  addDoc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import BaseLoader from "@/components/BaseLoader.vue";
import BaseButton from "@/components/BaseButton.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  entry: { type: Object as PropType<TimeEntry | null>, default: null },
});

const emit = defineEmits(["close", "newEntry", "updateEntry"]);

const userStore = useUserStore();
const loading = ref(false);
const processing = ref(false);
const projects = ref<Project[]>([]);
const errorFields = ref<string[]>([]);

const title = computed(() => {
  return props.entry ? "Изменить запись" : "Новая запись";
});

const projectOptions = computed<SelectOption[]>(() =>
  projects.value.map((project) => ({ value: project.id, text: project.name })),
);

const formValues = ref<FormValues>({
  project: props.entry?.projectId ?? "",
  startDate: props.entry?.startTime.toDate().toISOString().split("T")[0] ?? "",
  startTime: props.entry?.startTime.toDate().toTimeString().slice(0, 5) ?? "",
  endDate: props.entry?.endTime.toDate().toISOString().split("T")[0] ?? "",
  endTime: props.entry?.endTime.toDate().toTimeString().slice(0, 5) ?? "",
});

const formFields = computed<FormField[]>(() => [
  {
    name: "project",
    label: "Проект",
    type: "select",
    required: true,
    options: projectOptions.value,
    class: "span-2",
  },
  {
    name: "startDate",
    label: "Дата начала",
    type: "date",
    required: true,
  },
  {
    name: "startTime",
    label: "Время начала",
    type: "time",
    required: true,
  },
  {
    name: "endDate",
    label: "Дата окончания",
    type: "date",
    required: true,
  },
  {
    name: "endTime",
    label: "Время окончания",
    type: "time",
    required: true,
  },
]);

const onInput = (values: FormValues) => {
  formValues.value = values;
  errorFields.value = [];
};

const onCloseModal = () => {
  emit("close");
  errorFields.value = [];
  formValues.value = {
    project: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  };
};

const formEntryData = () => {
  const startDateObj = new Date(formValues.value.startDate);
  const [startHours, startMinutes] = formValues.value.startTime.split(":").map(Number);
  startDateObj.setHours(startHours, startMinutes, 0, 0);
  const startTimeTimestamp = Timestamp.fromDate(startDateObj);

  const endDateObj = new Date(formValues.value.endDate);
  const [endHours, endMinutes] = formValues.value.endTime.split(":").map(Number);
  endDateObj.setHours(endHours, endMinutes, 0, 0);
  const endTimeTimestamp = Timestamp.fromDate(endDateObj);

  const durationSeconds = (endDateObj.getTime() - startDateObj.getTime()) / 1000;

  const dateOnly = new Date(formValues.value.startDate);
  dateOnly.setHours(0, 0, 0, 0);
  const dateTimestamp = Timestamp.fromDate(dateOnly);

  return {
    date: dateTimestamp,
    startTime: startTimeTimestamp,
    endTime: endTimeTimestamp,
    duration: durationSeconds,
  };
};

const findLastEntryForProject = async (projectId: string): Promise<Timestamp | null> => {
  if (!userStore.user) return null;

  const entriesRef = collection(db, "users", userStore.user.uid, "timeEntries");
  const q = query(entriesRef, where("projectId", "==", projectId), orderBy("startTime", "desc"), limit(1));

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return Timestamp.fromDate(new Date(0));
  }

  const lastEntry = querySnapshot.docs[0]!.data();
  return lastEntry.startTime as Timestamp;
};

const onUpdateEntry = async () => {
  if (!userStore.user || !props.entry) return;

  try {
    processing.value = true;

    const entryData = formEntryData();
    const oldEntry = props.entry;

    const hasProjectChanged = formValues.value.project !== oldEntry.projectId;
    const hasStartDateChanged = formValues.value.startDate !== oldEntry.startTime.toDate().toISOString().split("T")[0];
    const hasStartTimeChanged = formValues.value.startTime !== oldEntry.startTime.toDate().toTimeString().slice(0, 5);
    const hasEndDateChanged = formValues.value.endDate !== oldEntry.endTime.toDate().toISOString().split("T")[0];
    const hasEndTimeChanged = formValues.value.endTime !== oldEntry.endTime.toDate().toTimeString().slice(0, 5);

    const hasAnyFieldChanged =
      hasProjectChanged || hasStartDateChanged || hasStartTimeChanged || hasEndDateChanged || hasEndTimeChanged;

    if (!hasAnyFieldChanged) {
      onCloseModal();
      return;
    }

    const entryRef = doc(db, "users", userStore.user.uid, "timeEntries", oldEntry.id);
    await updateDoc(entryRef, entryData);

    if (hasProjectChanged) {
      const oldProjectRef = doc(db, "users", userStore.user.uid, "projects", oldEntry.projectId);
      const oldProjectSnap = await getDoc(oldProjectRef);

      if (oldProjectSnap.exists()) {
        const oldProjectData = oldProjectSnap.data() as Project;
        const newOldTotalDuration = oldProjectData.totalDuration - oldEntry.duration;

        const oldProjectLastEntry = await findLastEntryForProject(oldEntry.projectId);
        await updateDoc(oldProjectRef, {
          totalDuration: newOldTotalDuration,
          lastEntryDate: oldProjectLastEntry,
        });
      }

      const newProjectRef = doc(db, "users", userStore.user.uid, "projects", formValues.value.project);
      const newProjectSnap = await getDoc(newProjectRef);

      if (newProjectSnap.exists()) {
        const newProjectData = newProjectSnap.data() as Project;
        const newTotalDuration = newProjectData.totalDuration + entryData.duration;

        const shouldUpdateLastEntryDate = entryData.startTime.toMillis() > newProjectData.lastEntryDate.toMillis();
        await updateDoc(newProjectRef, {
          totalDuration: newTotalDuration,
          ...(shouldUpdateLastEntryDate && { lastEntryDate: entryData.startTime }),
        });
      }
    } else {
      const projectRef = doc(db, "users", userStore.user.uid, "projects", oldEntry.projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const projectData = projectSnap.data() as Project;
        const newTotalDuration = projectData.totalDuration - oldEntry.duration + entryData.duration;

        const isNewEntryLater = entryData.startTime.toMillis() > projectData.lastEntryDate.toMillis();
        const isOldEntryWasLast = oldEntry.startTime.toMillis() === projectData.lastEntryDate.toMillis();

        if (isNewEntryLater) {
          await updateDoc(projectRef, {
            totalDuration: newTotalDuration,
            lastEntryDate: entryData.startTime,
          });
        } else if (isOldEntryWasLast) {
          const actualLastEntry = await findLastEntryForProject(oldEntry.projectId);
          await updateDoc(projectRef, {
            totalDuration: newTotalDuration,
            lastEntryDate: actualLastEntry,
          });
        } else {
          await updateDoc(projectRef, {
            totalDuration: newTotalDuration,
          });
        }
      }
    }

    const docSnap = await getDoc(entryRef);
    if (docSnap.exists()) {
      const projectRef = doc(db, "users", userStore.user.uid, "projects", formValues.value.project);
      const projectSnap = await getDoc(projectRef);

      let enrichedEntry: TimeEntry;
      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
        enrichedEntry = {
          ...docSnap.data(),
          id: docSnap.id,
          projectName: project.name,
          projectColor: project.color,
          cost: project.hourlyRate ? (entryData.duration / 3600) * project.hourlyRate : null,
          currency: project.currency,
        } as TimeEntry;
      } else {
        enrichedEntry = {
          ...docSnap.data(),
          id: docSnap.id,
          projectName: "Unknown Project",
          projectColor: undefined,
          cost: null,
          currency: undefined,
        } as TimeEntry;
      }

      emit("updateEntry", enrichedEntry);
    }

    onCloseModal();
  } catch (error) {
    console.error(error);
  } finally {
    processing.value = false;
  }
};

const onCreateEntry = async () => {
  if (!userStore.user) return;

  try {
    processing.value = true;

    const entryData = formEntryData();

    const entriesRef = collection(db, "users", userStore.user.uid, "timeEntries");
    const docRef = await addDoc(entriesRef, {
      projectId: formValues.value.project,
      ...entryData,
      type: "MANUAL",
      createdAt: Timestamp.now(),
    });

    const projectRef = doc(db, "users", userStore.user.uid, "projects", formValues.value.project);
    const projectSnap = await getDoc(projectRef);

    let project: Project | null = null;
    if (projectSnap.exists()) {
      const projectData = projectSnap.data() as Project;
      project = { ...projectData, id: projectSnap.id };
      await updateDoc(projectRef, {
        totalDuration: projectData.totalDuration + entryData.duration,
        lastEntryDate: entryData.startTime,
      });
    }

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const enrichedEntry: TimeEntry = {
        ...docSnap.data(),
        id: docSnap.id,
        projectName: project?.name || "Unknown Project",
        projectColor: project?.color,
        cost: project?.hourlyRate ? (entryData.duration / 3600) * project!.hourlyRate : null,
        currency: project?.currency,
      } as TimeEntry;

      emit("newEntry", enrichedEntry);
    }
    onCloseModal();
  } catch (error) {
    console.error(error);
  } finally {
    processing.value = false;
  }
};

const getData = async () => {
  if (!userStore.user) return;

  const projectsRef = collection(db, "users", userStore.user.uid, "projects");
  const q = query(projectsRef, where("archived", "==", false));
  const querySnapshot = await getDocs(q);

  projects.value = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
};

getData();

watch(
  () => props.entry,
  (value) => {
    formValues.value = {
      project: value?.projectId ?? "",
      startDate: value?.startTime.toDate().toISOString().split("T")[0] ?? "",
      startTime: value?.startTime.toDate().toTimeString().slice(0, 5) ?? "",
      endDate: value?.endTime.toDate().toISOString().split("T")[0] ?? "",
      endTime: value?.endTime.toDate().toTimeString().slice(0, 5) ?? "",
    };
  },
);
</script>

<style scoped lang="scss">
.edit-time-entry-modal {
  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
</style>
