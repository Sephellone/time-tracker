<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Трекер времени</h1>
        <div class="user-info">
          <button @click="goToProfile" class="user-name-btn">{{ displayName }}</button>
          <button @click="handleLogout" class="btn-logout">Выйти</button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="welcome-section">
        <h2>Добро пожаловать, {{ displayName }}!</h2>
        <p>Здесь будет ваша панель управления проектами и трекинг времени.</p>
      </div>

      <div v-if="activeTimer" class="timer-section">
        <div class="timer-card">
          <div class="timer-header">
            <div class="timer-project">
              <div class="timer-color-dot" :style="{ backgroundColor: activeTimer.projectColor || '#667eea' }"></div>
              <h3>{{ activeTimer.projectName }}</h3>
            </div>
            <button @click="stopTimer" class="btn-stop">⏹ Стоп</button>
          </div>
          <div class="timer-display">
            <span class="timer-time">{{ formattedElapsedTime }}</span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <div class="action-card">
          <h3>Проекты</h3>
          <p>Управление вашими проектами</p>
          <button @click="goToProjects" class="btn btn-primary">Перейти к проектам</button>
        </div>

        <div class="action-card">
          <h3>Трекер времени</h3>
          <p v-if="!activeTimer">Запустить таймер или добавить вручную</p>
          <p v-else>Таймер запущен</p>
          <div class="timer-actions">
            <button v-if="!activeTimer" @click="openTimerStartModal" class="btn btn-success">▶ Запустить таймер</button>
            <button @click="openTimeEntryModal" class="btn btn-secondary" :class="{ 'btn-small': !activeTimer }">+ Добавить вручную</button>
          </div>
        </div>

        <div class="action-card">
          <h3>Записи времени</h3>
          <p>Просмотр всех записей времени</p>
          <button @click="goToTimeEntries" class="btn btn-secondary">Посмотреть</button>
        </div>
      </div>
    </main>

    <div v-if="showTimerStartModal" class="modal-overlay" @click="closeTimerStartModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Запустить таймер</h2>
          <button @click="closeTimerStartModal" class="btn-close">×</button>
        </div>

        <div class="modal-form">
          <div class="form-group">
            <label for="timerProject">Выберите проект *</label>
            <select id="timerProject" v-model="selectedTimerProject" required>
              <option value="">Выберите проект</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div v-if="activeProjects.length === 0" class="info-message">
            У вас пока нет активных проектов. Создайте проект, чтобы начать отслеживание времени.
          </div>

          <div v-if="timerError" class="error-message">
            {{ timerError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="goToProjects" class="btn btn-secondary">+ Добавить проект</button>
            <button
              v-if="activeProjects.length > 0"
              @click="startTimer"
              class="btn btn-primary"
              :disabled="!selectedTimerProject || timerLoading"
            >
              {{ timerLoading ? 'Запуск...' : '▶ Старт' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTimeEntryModal" class="modal-overlay" @click="closeTimeEntryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Добавить запись времени</h2>
          <button @click="closeTimeEntryModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="handleCreateTimeEntry" class="modal-form">
          <div class="form-group">
            <label for="project">Проект *</label>
            <select id="project" v-model="newTimeEntry.projectId" required>
              <option value="">Выберите проект</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Дата начала *</label>
              <input
                id="startDate"
                v-model="newTimeEntry.startDate"
                type="date"
                required
              />
            </div>

            <div class="form-group">
              <label for="startTime">Время начала *</label>
              <input
                id="startTime"
                v-model="newTimeEntry.startTime"
                type="time"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="endDate">Дата окончания *</label>
              <input
                id="endDate"
                v-model="newTimeEntry.endDate"
                type="date"
                required
              />
            </div>

            <div class="form-group">
              <label for="endTime">Время окончания *</label>
              <input
                id="endTime"
                v-model="newTimeEntry.endTime"
                type="time"
                required
              />
            </div>
          </div>

          <div v-if="timeEntryError" class="error-message">
            {{ timeEntryError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeTimeEntryModal" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="timeEntryLoading">
              {{ timeEntryLoading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCurrentUser, useCollection } from "vuefire";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

const router = useRouter();
const user = useCurrentUser();

const displayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "Пользователь";
});

const showTimeEntryModal = ref(false);
const timeEntryLoading = ref(false);
const timeEntryError = ref("");

const newTimeEntry = ref({
  projectId: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
});

const showTimerStartModal = ref(false);
const selectedTimerProject = ref("");
const timerLoading = ref(false);
const timerError = ref("");
const activeTimer = ref<any>(null);
const elapsedSeconds = ref(0);
const timerInterval = ref<any>(null);

const projectsQuery = computed(() => {
  if (!user.value?.uid) return null;
  const projectsRef = collection(db, "users", user.value.uid, "projects");
  return query(projectsRef, where("archived", "==", false));
});

const { data: projects } = useCollection(projectsQuery);

const activeProjects = computed(() => {
  return projects.value || [];
});

const formattedElapsedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600);
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60);
  const seconds = elapsedSeconds.value % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const goToProfile = () => {
  router.push("/profile");
};

const goToProjects = () => {
  router.push("/projects");
};

const goToTimeEntries = () => {
  router.push("/time-entries");
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const openTimeEntryModal = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  newTimeEntry.value = {
    projectId: "",
    startDate: dateStr!,
    startTime: timeStr,
    endDate: dateStr!,
    endTime: timeStr,
  };
  showTimeEntryModal.value = true;
  timeEntryError.value = "";
};

const closeTimeEntryModal = () => {
  showTimeEntryModal.value = false;
  newTimeEntry.value = {
    projectId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  };
  timeEntryError.value = "";
};

const openTimerStartModal = () => {
  selectedTimerProject.value = "";
  showTimerStartModal.value = true;
  timerError.value = "";
};

const closeTimerStartModal = () => {
  showTimerStartModal.value = false;
  selectedTimerProject.value = "";
  timerError.value = "";
};

const startTimer = async () => {
  if (!selectedTimerProject.value || !user.value?.uid) return;

  timerLoading.value = true;
  timerError.value = "";

  try {
    const project = activeProjects.value.find(p => p.id === selectedTimerProject.value);
    if (!project) {
      throw new Error("Проект не найден");
    }

    const timersRef = collection(db, "users", user.value.uid, "timers");
    const timerDoc = await addDoc(timersRef, {
      projectId: selectedTimerProject.value,
      startTime: Timestamp.now(),
      active: true,
      createdAt: Timestamp.now(),
    });

    activeTimer.value = {
      id: timerDoc.id,
      projectId: selectedTimerProject.value,
      projectName: project.name,
      projectColor: project.color,
      startTime: Timestamp.now(),
      active: true,
    };

    startTimerInterval();
    closeTimerStartModal();
  } catch (err: any) {
    timerError.value = err.message || "Произошла ошибка при запуске таймера";
  } finally {
    timerLoading.value = false;
  }
};

const stopTimer = async () => {
  if (!activeTimer.value || !user.value?.uid) return;

  try {
    const endTime = Timestamp.now();
    const startTime = activeTimer.value.startTime;
    const startDateTime = startTime.toDate();
    const endDateTime = endTime.toDate();

    const durationSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);

    const dateOnly = new Date(startDateTime);
    dateOnly.setHours(0, 0, 0, 0);

    const timeEntriesRef = collection(db, "users", user.value.uid, "timeEntries");

    await addDoc(timeEntriesRef, {
      projectId: activeTimer.value.projectId,
      date: Timestamp.fromDate(dateOnly),
      startTime: startTime,
      endTime: endTime,
      duration: durationSeconds,
      type: "TIMER",
      createdAt: Timestamp.now(),
    });

    const projectRef = doc(db, "users", user.value.uid, "projects", activeTimer.value.projectId);
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const currentTotalDuration = projectDoc.data().totalDuration || 0;
      await updateDoc(projectRef, {
        totalDuration: currentTotalDuration + durationSeconds,
        lastEntryDate: Timestamp.fromDate(dateOnly),
      });
    }

    const timerRef = doc(db, "users", user.value.uid, "timers", activeTimer.value.id);
    await updateDoc(timerRef, {
      active: false,
      endTime: endTime,
    });

    stopTimerInterval();
    activeTimer.value = null;
    elapsedSeconds.value = 0;
  } catch (err: any) {
    console.error("Error stopping timer:", err);
    alert("Произошла ошибка при остановке таймера");
  }
};

const startTimerInterval = () => {
  if (timerInterval.value) return;

  const updateElapsed = () => {
    if (activeTimer.value?.startTime) {
      const now = Date.now();
      const start = activeTimer.value.startTime.toMillis();
      elapsedSeconds.value = Math.floor((now - start) / 1000);
    }
  };

  updateElapsed();
  timerInterval.value = setInterval(updateElapsed, 1000);
};

const stopTimerInterval = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const loadActiveTimer = async () => {
  if (!user.value?.uid) return;

  try {
    const timersRef = collection(db, "users", user.value.uid, "timers");
    const q = query(timersRef, where("active", "==", true));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const timerDoc = snapshot.docs[0];
      const timerData = timerDoc.data();

      const projectsRef = collection(db, "users", user.value.uid, "projects");
      const projectQuery = query(projectsRef, where("archived", "==", false));
      const projectsSnapshot = await getDocs(projectQuery);

      const project = projectsSnapshot.docs.find(doc => doc.id === timerData.projectId);

      if (project) {
        const projectData = project.data();
        activeTimer.value = {
          id: timerDoc.id,
          projectId: timerData.projectId,
          projectName: projectData.name,
          projectColor: projectData.color,
          startTime: timerData.startTime,
          active: true,
        };

        startTimerInterval();
      }
    }
  } catch (err) {
    console.error("Error loading active timer:", err);
  }
};

onMounted(() => {
  loadActiveTimer();
});

onUnmounted(() => {
  stopTimerInterval();
});

const handleCreateTimeEntry = async () => {
  timeEntryError.value = "";
  timeEntryLoading.value = true;

  try {
    if (!user.value?.uid) {
      throw new Error("Пользователь не авторизован");
    }

    const startDateTime = new Date(`${newTimeEntry.value.startDate}T${newTimeEntry.value.startTime}`);
    const endDateTime = new Date(`${newTimeEntry.value.endDate}T${newTimeEntry.value.endTime}`);

    if (endDateTime <= startDateTime) {
      throw new Error("Время окончания должно быть позже времени начала");
    }

    const durationSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);

    const dateOnly = new Date(newTimeEntry.value.startDate);
    dateOnly.setHours(0, 0, 0, 0);

    const timeEntriesRef = collection(db, "users", user.value.uid, "timeEntries");

    await addDoc(timeEntriesRef, {
      projectId: newTimeEntry.value.projectId,
      date: Timestamp.fromDate(dateOnly),
      startTime: Timestamp.fromDate(startDateTime),
      endTime: Timestamp.fromDate(endDateTime),
      duration: durationSeconds,
      type: "MANUAL",
      createdAt: Timestamp.now(),
    });

    const projectRef = doc(db, "users", user.value.uid, "projects", newTimeEntry.value.projectId);
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const currentTotalDuration = projectDoc.data().totalDuration || 0;
      await updateDoc(projectRef, {
        totalDuration: currentTotalDuration + durationSeconds,
        lastEntryDate: Timestamp.fromDate(dateOnly),
      });
    }

    closeTimeEntryModal();
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      timeEntryError.value = "Ошибка доступа к базе данных. Проверьте правила безопасности Firestore.";
    } else {
      timeEntryError.value = err.message || "Произошла ошибка при создании записи";
    }
  } finally {
    timeEntryLoading.value = false;
  }
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: color 0.3s;
}

.user-name-btn:hover {
  color: #5568d3;
  text-decoration: underline;
}

.btn-logout {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-section h2 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #333;
}

.welcome-section p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-card h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.action-card p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 10px 16px;
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

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
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
  width: auto;
  padding: 10px 20px;
  font-size: 14px;
}

.timer-section {
  margin-bottom: 40px;
}

.timer-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.timer-project {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.timer-project h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-stop {
  padding: 10px 20px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-stop:hover {
  background: #e53e3e;
}

.timer-display {
  text-align: center;
  padding: 40px 0;
}

.timer-time {
  font-size: 64px;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
}

.timer-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.timer-actions .btn {
  flex: 1;
  min-width: 150px;
}

.btn-small {
  width: 100%;
}

.info-message {
  background: #e6f7ff;
  color: #0066cc;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}
</style>
