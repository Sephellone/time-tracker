<template>
  <div class="time-entries">
    <header class="time-entries-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">← Назад</button>
        <h1>Записи времени</h1>
        <div></div>
      </div>
    </header>

    <main class="time-entries-main">
      <div v-if="loading && entries.length === 0" class="loading">Загрузка записей...</div>

      <div v-else-if="entries.length === 0" class="empty-state">
        <div class="empty-icon">⏱️</div>
        <h2>Нет записей времени</h2>
        <p>Добавьте первую запись времени на главной странице</p>
      </div>

      <div v-else class="entries-container">
        <div class="entries-list">
          <div v-for="entry in entries" :key="entry.id" class="entry-card">
            <div class="entry-color-bar" :style="{ backgroundColor: entry.projectColor || '#667eea' }"></div>
            <div class="entry-content">
              <div class="entry-header">
                <h3>{{ entry.projectName }}</h3>
                <span class="entry-type">{{ entry.type }}</span>
              </div>
              <div class="entry-details">
                <div class="entry-detail">
                  <span class="detail-label">📅 Дата:</span>
                  <span class="detail-value">{{ formatDate(entry.date) }}</span>
                </div>
                <div class="entry-detail">
                  <span class="detail-label">⏱️ Длительность:</span>
                  <span class="detail-value">{{ formatDuration(entry.duration) }}</span>
                </div>
                <div class="entry-detail">
                  <span class="detail-label">🕐 Время:</span>
                  <span class="detail-value">{{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}</span>
                </div>
                <div v-if="entry.cost" class="entry-detail">
                  <span class="detail-label">💰 Стоимость:</span>
                  <span class="detail-value cost">{{ entry.cost.toFixed(2) }} {{ entry.currency }}</span>
                </div>
              </div>
              <div class="entry-actions">
                <button @click="openEditModal(entry)" class="btn-action btn-edit">Редактировать</button>
                <button @click="confirmDelete(entry)" class="btn-action btn-delete">Удалить</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMore" ref="loadMoreTrigger" class="load-more">
          <div v-if="loadingMore" class="loading-more">Загрузка...</div>
        </div>

        <div v-if="!hasMore && entries.length > 0" class="end-message">
          Все записи загружены
        </div>
      </div>
    </main>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Редактировать запись времени</h2>
          <button @click="closeEditModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="handleUpdateEntry" class="modal-form">
          <div class="form-group">
            <label for="editProject">Проект *</label>
            <select id="editProject" v-model="editingEntry.projectId" required disabled>
              <option :value="editingEntry.projectId">{{ editingEntry.projectName }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editStartDate">Дата начала *</label>
              <input
                id="editStartDate"
                v-model="editingEntry.startDate"
                type="date"
                required
              />
            </div>

            <div class="form-group">
              <label for="editStartTime">Время начала *</label>
              <input
                id="editStartTime"
                v-model="editingEntry.startTime"
                type="time"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editEndDate">Дата окончания *</label>
              <input
                id="editEndDate"
                v-model="editingEntry.endDate"
                type="date"
                required
              />
            </div>

            <div class="form-group">
              <label for="editEndTime">Время окончания *</label>
              <input
                id="editEndTime"
                v-model="editingEntry.endTime"
                type="time"
                required
              />
            </div>
          </div>

          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="editLoading">
              {{ editLoading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h2>Удалить запись времени?</h2>
          <button @click="closeDeleteConfirm" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить эту запись времени? Это действие нельзя отменить.</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeDeleteConfirm" class="btn btn-secondary">Отмена</button>
          <button @click="handleDeleteEntry" class="btn btn-danger" :disabled="deleteLoading">
            {{ deleteLoading ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCurrentUser } from "vuefire";
import { db } from "@/firebaseConfig";
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

const router = useRouter();
const user = useCurrentUser();

const entries = ref<any[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const lastDoc = ref<any>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const showEditModal = ref(false);
const editLoading = ref(false);
const editError = ref("");
const editingEntry = ref<any>({
  id: "",
  projectId: "",
  projectName: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
});

const showDeleteConfirm = ref(false);
const deleteLoading = ref(false);
const deletingEntry = ref<any>(null);

const PAGE_SIZE = 20;

const goBack = () => {
  router.push("/dashboard");
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

const formatTime = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const loadTimeEntries = async (isLoadMore = false) => {
  if (!user.value?.uid) return;
  
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const projectsRef = collection(db, "users", user.value.uid, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    
    const projectsMap = new Map();
    projectsSnapshot.forEach(doc => {
      projectsMap.set(doc.id, doc.data());
    });

    const allEntries: any[] = [];
    
    for (const [projectId, projectData] of projectsMap.entries()) {
      const timeEntriesRef = collection(db, "users", user.value.uid, "projects", projectId, "timeEntries");
      let q = query(timeEntriesRef, orderBy("date", "desc"), orderBy("startTime", "desc"));
      
      const snapshot = await getDocs(q);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const duration = data.duration || 0;
        let cost = null;
        
        if (projectData.hourlyRate && projectData.currency) {
          cost = (duration / 3600) * projectData.hourlyRate;
        }
        
        allEntries.push({
          id: doc.id,
          projectId,
          projectName: projectData.name,
          projectColor: projectData.color,
          currency: projectData.currency,
          ...data,
          cost,
        });
      });
    }

    allEntries.sort((a, b) => {
      const aDate = a.date?.toMillis?.() || 0;
      const bDate = b.date?.toMillis?.() || 0;
      if (aDate !== bDate) return bDate - aDate;
      
      const aStart = a.startTime?.toMillis?.() || 0;
      const bStart = b.startTime?.toMillis?.() || 0;
      return bStart - aStart;
    });

    const startIndex = isLoadMore ? entries.value.length : 0;
    const endIndex = startIndex + PAGE_SIZE;
    const newEntries = allEntries.slice(startIndex, endIndex);
    
    if (isLoadMore) {
      entries.value.push(...newEntries);
    } else {
      entries.value = newEntries;
    }
    
    hasMore.value = endIndex < allEntries.length;
    
  } catch (error) {
    console.error("Error loading time entries:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleScroll = () => {
  if (!loadMoreTrigger.value || loadingMore.value || !hasMore.value) return;
  
  const rect = loadMoreTrigger.value.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
  
  if (isVisible) {
    loadTimeEntries(true);
  }
};

onMounted(() => {
  loadTimeEntries();
  window.addEventListener('scroll', handleScroll);
});

const openEditModal = (entry: any) => {
  const startDateTime = entry.startTime?.toDate?.() || new Date();
  const endDateTime = entry.endTime?.toDate?.() || new Date();
  
  editingEntry.value = {
    id: entry.id,
    projectId: entry.projectId,
    projectName: entry.projectName,
    startDate: startDateTime.toISOString().split('T')[0],
    startTime: startDateTime.toTimeString().slice(0, 5),
    endDate: endDateTime.toISOString().split('T')[0],
    endTime: endDateTime.toTimeString().slice(0, 5),
  };
  
  showEditModal.value = true;
  editError.value = "";
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEntry.value = {
    id: "",
    projectId: "",
    projectName: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  };
  editError.value = "";
};

const handleUpdateEntry = async () => {
  editError.value = "";
  editLoading.value = true;

  try {
    if (!user.value?.uid) {
      throw new Error("Пользователь не авторизован");
    }

    const startDateTime = new Date(`${editingEntry.value.startDate}T${editingEntry.value.startTime}`);
    const endDateTime = new Date(`${editingEntry.value.endDate}T${editingEntry.value.endTime}`);

    if (endDateTime <= startDateTime) {
      throw new Error("Время окончания должно быть позже времени начала");
    }

    const durationSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);

    const dateOnly = new Date(editingEntry.value.startDate);
    dateOnly.setHours(0, 0, 0, 0);

    const entryRef = doc(
      db,
      "users",
      user.value.uid,
      "projects",
      editingEntry.value.projectId,
      "timeEntries",
      editingEntry.value.id
    );

    const oldEntryDoc = await getDoc(entryRef);
    const oldDuration = oldEntryDoc.exists() ? (oldEntryDoc.data().duration || 0) : 0;

    await updateDoc(entryRef, {
      date: Timestamp.fromDate(dateOnly),
      startTime: Timestamp.fromDate(startDateTime),
      endTime: Timestamp.fromDate(endDateTime),
      duration: durationSeconds,
    });

    const projectRef = doc(db, "users", user.value.uid, "projects", editingEntry.value.projectId);
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const currentTotalDuration = projectDoc.data().totalDuration || 0;
      const newTotalDuration = currentTotalDuration - oldDuration + durationSeconds;
      await updateDoc(projectRef, {
        totalDuration: newTotalDuration,
      });
    }

    const updatedEntryDoc = await getDoc(entryRef);
    if (updatedEntryDoc.exists()) {
      const updatedData = updatedEntryDoc.data();
      const entryIndex = entries.value.findIndex(e => e.id === editingEntry.value.id && e.projectId === editingEntry.value.projectId);
      
      if (entryIndex !== -1) {
        const projectData = entries.value[entryIndex];
        let cost = null;
        
        if (projectData.currency && projectData.hourlyRate) {
          cost = (durationSeconds / 3600) * projectData.hourlyRate;
        }
        
        entries.value[entryIndex] = {
          ...entries.value[entryIndex],
          ...updatedData,
          cost,
        };
      }
    }

    closeEditModal();
  } catch (err: any) {
    editError.value = err.message || "Произошла ошибка при обновлении записи";
  } finally {
    editLoading.value = false;
  }
};

const confirmDelete = (entry: any) => {
  deletingEntry.value = entry;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  deletingEntry.value = null;
  deleteLoading.value = false;
};

const handleDeleteEntry = async () => {
  if (!user.value?.uid || !deletingEntry.value) return;
  
  deleteLoading.value = true;
  
  try {
    const entryRef = doc(
      db,
      "users",
      user.value.uid,
      "projects",
      deletingEntry.value.projectId,
      "timeEntries",
      deletingEntry.value.id
    );
    
    const entryDoc = await getDoc(entryRef);
    const entryDuration = entryDoc.exists() ? (entryDoc.data().duration || 0) : 0;
    
    await deleteDoc(entryRef);
    
    const projectRef = doc(db, "users", user.value.uid, "projects", deletingEntry.value.projectId);
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const currentTotalDuration = projectDoc.data().totalDuration || 0;
      await updateDoc(projectRef, {
        totalDuration: Math.max(0, currentTotalDuration - entryDuration),
      });
    }
    
    const entryIndex = entries.value.findIndex(
      e => e.id === deletingEntry.value.id && e.projectId === deletingEntry.value.projectId
    );
    
    if (entryIndex !== -1) {
      entries.value.splice(entryIndex, 1);
    }
    
    closeDeleteConfirm();
  } catch (err: any) {
    console.error("Error deleting entry:", err);
    alert("Произошла ошибка при удалении записи");
  } finally {
    deleteLoading.value = false;
  }
};

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.time-entries {
  min-height: 100vh;
  background: #f5f5f5;
}

.time-entries-header {
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

.time-entries-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  text-align: center;
}

.time-entries-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
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
  margin: 0;
  color: #666;
  font-size: 16px;
}

.entries-container {
  max-width: 800px;
  margin: 0 auto;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.entry-color-bar {
  height: 4px;
  width: 100%;
}

.entry-content {
  padding: 20px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.entry-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.entry-type {
  background: #e0e0e0;
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.entry-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.entry-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-value.cost {
  color: #48bb78;
  font-weight: 600;
}

.entry-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5568d3;
}

.btn-delete {
  background: #f56565;
  color: white;
}

.btn-delete:hover {
  background: #e53e3e;
}

.load-more {
  padding: 40px 20px;
  text-align: center;
}

.loading-more {
  color: #666;
  font-size: 16px;
}

.end-message {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.confirm-modal {
  max-width: 450px;
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

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0;
  color: #666;
  font-size: 15px;
  line-height: 1.6;
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
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group select {
  cursor: pointer;
  background-color: white;
}

.form-group select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
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

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
