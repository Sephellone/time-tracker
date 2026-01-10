<template>
  <div class="projects">
    <header class="projects-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">← Назад</button>
        <h1>Проекты</h1>
        <div></div>
      </div>
    </header>

    <main class="projects-main">
      <div class="projects-actions">
        <button @click="openCreateModal" class="btn btn-primary">+ Создать проект</button>
        <div class="filter-toggle">
          <button
            @click="showArchived = false"
            class="filter-btn"
            :class="{ active: !showArchived }">
            Активные
          </button>
          <button
            @click="showArchived = true"
            class="filter-btn"
            :class="{ active: showArchived }">
            Архив
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">Загрузка проектов...</div>

      <div v-else-if="!projects || projects.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h2>Пока нет проектов</h2>
        <p>Создайте свой первый проект, чтобы начать отслеживать время</p>
        <button @click="openCreateModal" class="btn btn-primary">Создать проект</button>
      </div>

      <div v-else class="projects-grid">
        <div v-for="project in filteredProjects" :key="project.id" class="project-card" :class="{ archived: project.archived }">
          <div class="project-color-bar" :style="{ backgroundColor: project.color || '#667eea' }"></div>
          <div class="project-content">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <span v-if="project.archived" class="badge-archived">Архив</span>
            </div>
            <p v-if="project.description" class="project-description">{{ project.description }}</p>
            <p v-else class="project-description empty">Нет описания</p>
            <p v-if="project.currency && project.hourlyRate" class="project-rate">
              💰 {{ project.hourlyRate }} {{ project.currency }}/час
            </p>
            <div class="project-footer">
              <span class="project-date">Создан: {{ formatDate(project.createTime) }}</span>
              <div class="project-actions">
                <button @click="openEditModal(project)" class="btn-edit">Редактировать</button>
                <button @click="confirmArchiveToggle(project)" class="btn-archive">
                  {{ project.archived ? 'Сделать активным' : 'В архив' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Редактировать проект' : 'Создать проект' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="showEditModal ? handleUpdateProject() : handleCreateProject()" class="modal-form">
          <div class="form-group">
            <label for="projectName">Название проекта *</label>
            <input
              id="projectName"
              v-model="newProject.name"
              type="text"
              required
              placeholder="Введите название проекта"
              autofocus
            />
          </div>

          <div class="form-group">
            <label for="projectDescription">Описание</label>
            <textarea
              id="projectDescription"
              v-model="newProject.description"
              rows="4"
              placeholder="Опишите проект (необязательно)"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Цвет проекта</label>
            <div class="color-picker">
              <div
                v-for="color in availableColors"
                :key="color"
                class="color-option"
                :class="{ selected: newProject.color === color }"
                :style="{ backgroundColor: color }"
                @click="newProject.color = color"
              >
                <span v-if="newProject.color === color" class="checkmark">✓</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="hourlyRate">Стоимость в час</label>
              <input
                id="hourlyRate"
                v-model.number="newProject.hourlyRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div class="form-group">
              <label for="currency">Валюта</label>
              <select id="currency" v-model="newProject.currency">
                <option value="">Не выбрано</option>
                <option v-for="curr in availableCurrencies" :key="curr.code" :value="curr.code">
                  {{ curr.code }} - {{ curr.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="createError" class="error-message">
            {{ createError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="createLoading">
              {{ createLoading ? (showEditModal ? 'Сохранение...' : 'Создание...') : (showEditModal ? 'Сохранить' : 'Создать') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showArchiveConfirm" class="modal-overlay" @click="closeArchiveConfirm">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ archivingProject?.archived ? 'Сделать проект активным?' : 'Поместить проект в архив?' }}</h2>
          <button @click="closeArchiveConfirm" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>{{ archivingProject?.archived ? 'Проект "' + archivingProject?.name + '" станет активным и будет отображаться в основном списке.' : 'Проект "' + archivingProject?.name + '" будет помещен в архив.' }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeArchiveConfirm" class="btn btn-secondary">Отмена</button>
          <button @click="handleArchiveToggle" class="btn btn-primary" :disabled="archiveLoading">
            {{ archiveLoading ? 'Сохранение...' : 'Подтвердить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCurrentUser, useCollection } from "vuefire";
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const router = useRouter();
const user = useCurrentUser();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const createLoading = ref(false);
const createError = ref("");
const editingProjectId = ref<string | null>(null);
const showArchived = ref(false);
const showArchiveConfirm = ref(false);
const archivingProject = ref<any>(null);
const archiveLoading = ref(false);

const availableColors = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#4facfe",
  "#43e97b",
  "#fa709a",
  "#fee140",
  "#30cfd0",
  "#a8edea",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
];

const availableCurrencies = [
  { code: "RUB", name: "Российский рубль" },
  { code: "USD", name: "Доллар США" },
  { code: "EUR", name: "Евро" },
  { code: "GBP", name: "Фунт стерлингов" },
  { code: "JPY", name: "Японская иена" },
  { code: "CNY", name: "Китайский юань" },
  { code: "CHF", name: "Швейцарский франк" },
  { code: "CAD", name: "Канадский доллар" },
  { code: "AUD", name: "Австралийский доллар" },
  { code: "INR", name: "Индийская рупия" },
  { code: "BRL", name: "Бразильский реал" },
  { code: "KRW", name: "Южнокорейская вона" },
  { code: "MXN", name: "Мексиканское песо" },
  { code: "SGD", name: "Сингапурский доллар" },
  { code: "HKD", name: "Гонконгский доллар" },
  { code: "NOK", name: "Норвежская крона" },
  { code: "SEK", name: "Шведская крона" },
  { code: "TRY", name: "Турецкая лира" },
  { code: "PLN", name: "Польский злотый" },
  { code: "THB", name: "Тайский бат" },
];

const newProject = ref({
  name: "",
  description: "",
  color: "#667eea",
  hourlyRate: null as number | null,
  currency: "",
});

const projectsQuery = computed(() => {
  if (!user.value?.uid) return null;
  const projectsRef = collection(db, "users", user.value.uid, "projects");
  return query(projectsRef, orderBy("createTime", "desc"));
});

const { data: projects, pending: loading } = useCollection(projectsQuery);

const filteredProjects = computed(() => {
  if (!projects.value) return [];
  return projects.value
    .filter(p => showArchived.value ? p.archived : !p.archived)
    .sort((a, b) => {
      if (a.archived === b.archived) {
        const aTime = a.createTime?.toMillis?.() || 0;
        const bTime = b.createTime?.toMillis?.() || 0;
        return bTime - aTime;
      }
      return a.archived ? 1 : -1;
    });
});

const goBack = () => {
  router.push("/dashboard");
};

const openCreateModal = () => {
  showCreateModal.value = true;
  newProject.value = { name: "", description: "", color: "#667eea", hourlyRate: null, currency: "" };
  createError.value = "";
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  newProject.value = { name: "", description: "", color: "#667eea", hourlyRate: null, currency: "" };
  createError.value = "";
};

const openEditModal = (project: any) => {
  showEditModal.value = true;
  editingProjectId.value = project.id;
  newProject.value = {
    name: project.name,
    description: project.description || "",
    color: project.color || "#667eea",
    hourlyRate: project.hourlyRate || null,
    currency: project.currency || "",
  };
  createError.value = "";
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingProjectId.value = null;
  newProject.value = { name: "", description: "", color: "#667eea", hourlyRate: null, currency: "" };
  createError.value = "";
};

const handleCreateProject = async () => {
  createError.value = "";
  createLoading.value = true;

  try {
    if (!user.value?.uid) {
      throw new Error("Пользователь не авторизован");
    }

    const projectsRef = collection(db, "users", user.value.uid, "projects");
    await addDoc(projectsRef, {
      name: newProject.value.name,
      description: newProject.value.description || "",
      color: newProject.value.color,
      hourlyRate: newProject.value.hourlyRate || null,
      currency: newProject.value.currency || "",
      createTime: serverTimestamp(),
      archived: false,
      totalDuration: 0,
    });

    closeCreateModal();
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      createError.value = "Ошибка доступа к базе данных. Проверьте правила безопасности Firestore.";
    } else {
      createError.value = err.message || "Произошла ошибка при создании проекта";
    }
  } finally {
    createLoading.value = false;
  }
};

const handleUpdateProject = async () => {
  createError.value = "";
  createLoading.value = true;

  try {
    if (!user.value?.uid || !editingProjectId.value) {
      throw new Error("Пользователь не авторизован или проект не выбран");
    }

    const projectRef = doc(db, "users", user.value.uid, "projects", editingProjectId.value);
    await updateDoc(projectRef, {
      name: newProject.value.name,
      description: newProject.value.description || "",
      color: newProject.value.color,
      hourlyRate: newProject.value.hourlyRate || null,
      currency: newProject.value.currency || "",
    });

    closeModal();
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      createError.value = "Ошибка доступа к базе данных. Проверьте правила безопасности Firestore.";
    } else {
      createError.value = err.message || "Произошла ошибка при обновлении проекта";
    }
  } finally {
    createLoading.value = false;
  }
};

const confirmArchiveToggle = (project: any) => {
  archivingProject.value = project;
  showArchiveConfirm.value = true;
};

const closeArchiveConfirm = () => {
  showArchiveConfirm.value = false;
  archivingProject.value = null;
  archiveLoading.value = false;
};

const handleArchiveToggle = async () => {
  if (!user.value?.uid || !archivingProject.value) return;

  archiveLoading.value = true;

  try {
    const projectRef = doc(db, "users", user.value.uid, "projects", archivingProject.value.id);
    await updateDoc(projectRef, {
      archived: !archivingProject.value.archived,
    });

    closeArchiveConfirm();
  } catch (err: any) {
    console.error("Error toggling archive:", err);
    alert("Произошла ошибка при обновлении проекта");
  } finally {
    archiveLoading.value = false;
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Неизвестно";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
.projects {
  min-height: 100vh;
  background: #f5f5f5;
}

.projects-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.btn-back {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  justify-self: start;
}

.btn-back:hover {
  background: #e0e0e0;
}

.projects-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  text-align: center;
}

.projects-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.projects-actions {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.filter-btn {
  padding: 10px 20px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
  border-right: 1px solid #ddd;
}

.filter-btn:last-child {
  border-right: none;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-state h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  color: #333;
}

.empty-state p {
  margin: 0 0 32px 0;
  color: #666;
  font-size: 16px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;
  overflow: hidden;
  position: relative;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.project-card.archived {
  opacity: 0.7;
  background: #f9f9f9;
}

.project-card.archived .project-color-bar {
  filter: grayscale(50%);
}

.project-card.archived h3,
.project-card.archived .project-description,
.project-card.archived .project-rate,
.project-card.archived .project-date {
  color: #999;
}

.project-color-bar {
  height: 4px;
  width: 100%;
}

.project-content {
  padding: 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.project-card h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  word-break: break-word;
}

.badge-archived {
  background: #999;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.project-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.project-description.empty {
  font-style: italic;
  color: #999;
}

.project-rate {
  margin: 0 0 16px 0;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
}

.project-footer {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.project-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.project-date {
  font-size: 12px;
  color: #999;
}

.btn-edit {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-edit:hover {
  background: #5568d3;
}

.btn-archive {
  padding: 6px 12px;
  background: #999;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-archive:hover {
  background: #777;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #333;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group select {
  cursor: pointer;
  background-color: white;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions .btn {
  padding: 10px 20px;
  font-size: 14px;
}

.confirm-modal {
  max-width: 450px;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0;
  color: #666;
  font-size: 15px;
  line-height: 1.6;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-option.selected {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
}

.color-option .checkmark {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
