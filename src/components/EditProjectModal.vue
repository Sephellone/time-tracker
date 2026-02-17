<template>
  <base-modal
    class="edit-project-modal"
    :value="showModal"
    :title="title"
    :style="{ '--color': formValues.color }"
    @close="onCloseModal"
  >
    <base-form
      class="edit-project-modal__form"
      :fields="formFields"
      :values="formValues"
      :errorFields="errorFields"
      @input="onInput"
    >
    </base-form>
    <div class="span-2 d-flex __align-center __justify-end gap-3">
      <base-button secondary :disabled="processing" @click="onCloseModal">Отмена</base-button>
      <base-button :loading="processing" @click="project ? onUpdateProject() : onCreateProject()">
        {{ project ? "Сохранить" : "Создать" }}
      </base-button>
    </div>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "@/components/BaseModal.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import type { FormField, FormValues, Project, SelectOption } from "@/types.ts";
import emitter from "@/lib/emitter.ts";
import { availableCurrencies, defaultColors, EVENTS } from "@/const.ts";
import BaseForm from "@/components/BaseForm.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useUserStore } from "@/stores/user.ts";
import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig.ts";

const showModal = ref(false);
const processing = ref(false);

const userStore = useUserStore();

const project = ref<Project | null>(null);
const errorFields = ref<string[]>([]);

const formValues = ref<FormValues>({
  name: "",
  description: "",
  color: defaultColors[0]!,
  hourlyRate: 0,
  currency: "",
});

const currencies = computed<SelectOption[]>(() =>
  availableCurrencies.map((currency) => ({ value: currency.code, text: `${currency.code} ${currency.name}` })),
);

const formFields = computed<FormField[]>(() => [
  {
    name: "name",
    label: "Название проекта",
    type: "text",
    required: true,
    placeholder: "Введите название проекта",
    class: "span-2",
  },
  {
    name: "description",
    label: "Описание проекта",
    type: "textarea",
    placeholder: "Введите описание проекта (необязательно)",
    class: "span-2",
  },
  {
    name: "hourlyRate",
    label: "Стоимость в час",
    type: "number",
    placeholder: "0",
  },
  {
    name: "currency",
    type: "select",
    label: "Валюта",
    options: currencies.value,
  },
  {
    name: "color",
    type: "colorSelect",
    label: "Цвет",
    class: "span-2",
  },
]);

const title = computed(() => {
  return project.value ? "Изменить проект" : "Новый проект";
});

const onOpenModal = (p: Project | null) => {
  project.value = p;
  if (!!p) {
    formValues.value = {
      name: p.name,
      description: p.description,
      color: p.color,
      hourlyRate: p.hourlyRate,
      currency: p.currency,
    };
  }
  showModal.value = true;
};

const onValidate = () => {
  errorFields.value = formFields.value.filter((i) => i.required && !formValues.value[i.name]).map((i) => i.name);
};

const onInput = (values: FormValues) => {
  formValues.value = values;
  errorFields.value = [];
};

const onCloseModal = () => {
  showModal.value = false;
  project.value = null;
  errorFields.value = [];
  formValues.value = {
    name: "",
    description: "",
    color: defaultColors[0]!,
    hourlyRate: 0,
    currency: "",
  };
};

const onCreateProject = async () => {
  if (!userStore.user) return;
  onValidate();
  if (errorFields.value.length > 0) return;

  try {
    processing.value = true;
    const projectsRef = collection(db, "users", userStore.user.uid, "projects");
    const docRef = await addDoc(projectsRef, {
      name: formValues.value.name,
      description: formValues.value.description || "",
      color: formValues.value.color,
      hourlyRate: formValues.value.hourlyRate || null,
      currency: formValues.value.currency || "",
      createTime: serverTimestamp(),
      archived: false,
      totalDuration: 0,
      lastEntryDate: Timestamp.fromDate(new Date(0)),
    });

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const newProject: Project = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Project;

      emitter.emit(EVENTS.PROJECT_CREATED, newProject);
    }

    onCloseModal();
  } catch (error) {
    console.error(error);
  } finally {
    processing.value = false;
  }
};

const onUpdateProject = async () => {
  if (!userStore.user || !project.value) return;
  onValidate();
  if (errorFields.value.length > 0) return;

  try {
    processing.value = true;
    const projectRef = doc(db, "users", userStore.user.uid, "projects", project.value.id);
    await updateDoc(projectRef, {
      name: formValues.value.name,
      description: formValues.value.description || "",
      color: formValues.value.color,
      hourlyRate: formValues.value.hourlyRate || null,
      currency: formValues.value.currency || "",
    });

    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      const updatedProject: Project = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Project;

      emitter.emit(EVENTS.PROJECT_UPDATED, updatedProject);
    }

    onCloseModal();
  } catch (error) {
    console.error(error);
  } finally {
    processing.value = false;
  }
};

emitter.on(EVENTS.OPEN_EDIT_PROJECT_MODAL, onOpenModal);

onBeforeUnmount(() => {
  emitter.off(EVENTS.OPEN_EDIT_PROJECT_MODAL, onOpenModal);
});
</script>

<style scoped lang="scss">
.edit-project-modal {
  --color: var(--palette-white);

  :deep(.base-modal__content) {
    border-top: 7px solid var(--color);
    transition: all 0.3s ease;
  }

  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
</style>
