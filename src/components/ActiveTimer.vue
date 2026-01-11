<template>
  <transition name="slide">
    <div
      v-if="timerStore.activeTimer"
      class="timer__wrapper py-4"
      :style="{ '--color': activeProject ? activeProject.color : '#d9d9d9' }"
    >
      <div class="timer d-flex __align-center __space-between px-4 py-1">
        <div>
          <div class="timer__time">{{ formattedElapsedTime }}</div>
          <div class="timer__name comforta">{{ activeProject ? activeProject.name : "" }}</div>
        </div>

        <icon-button accent :loading="saving" @click="stopTimer">
          <square />
        </icon-button>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import IconButton from "@/components/IconButton.vue";
import { Square } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Project, TimerDb } from "@/types.ts";
import { db } from "@/firebaseConfig.ts";
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { useUserStore } from "@/stores/user.ts";
import useProjects from "@/composables/useProjects.ts";
import { useTimerStore } from "@/stores/timer.ts";
import { formatElapsedTime } from "@/lib/time.ts";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";

const { getProjectById } = useProjects();
const userStore = useUserStore();

const timerStore = useTimerStore();
const activeProject = ref<Project | null>(null);

const saving = ref(false);

const formattedElapsedTime = computed(() => {
  return formatElapsedTime(timerStore.elapsedSeconds);
});

const getActiveTimer = async () => {
  if (!userStore.user) return;

  const timersRef = collection(db, "users", userStore.user.uid, "timers");
  const q = query(timersRef, where("active", "==", true));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const timerDoc = snapshot.docs[0]!;
    const timer = { ...timerDoc.data(), id: timerDoc.id } as TimerDb;
    timerStore.setActiveTimer(timer);
    timerStore.startTimerInterval();
    activeProject.value = await getProjectById(timer.projectId);
  }
};

// const handleCreateTimeEntry = async () => {
//   if (!userStore.user) return;
//   try {
//     saving.value = true;
//   } catch (error) {
//     console.error("Error creating time entry:", error);
//   } finally {
//     saving.value = false;
//   }
// };

const startTimer = async ({projectId, cb}: {projectId: string; cb?: () => void}) => {
  if (!userStore.user) return;

  activeProject.value = await getProjectById(projectId);
  const timersRef = collection(db, "users", userStore.user.uid, "timers");
  const timerData = {
    projectId: projectId,
    startTime: Timestamp.now(),
    active: true,
    createdAt: Timestamp.now(),
  };
  const timerDoc = await addDoc(timersRef, timerData);
  const timer = { ...timerData, id: timerDoc.id } as TimerDb;
  timerStore.setActiveTimer(timer);
  timerStore.startTimerInterval();
  if (cb) cb();
};

const stopTimer = async () => {
  if (!timerStore.activeTimer || !userStore.user) return;

  try {
    saving.value = true;
    const endTime = Timestamp.now();
    const startTime = timerStore.activeTimer.startTime;
    const startDateTime = startTime.toDate();
    const endDateTime = endTime.toDate();

    const durationSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);

    const dateOnly = new Date(startDateTime);
    dateOnly.setHours(0, 0, 0, 0);

    const timeEntriesRef = collection(db, "users", userStore.user.uid, "timeEntries");

    await addDoc(timeEntriesRef, {
      projectId: timerStore.activeTimer.projectId,
      date: Timestamp.fromDate(dateOnly),
      startTime: startTime,
      endTime: endTime,
      duration: durationSeconds,
      type: "TIMER",
      createdAt: Timestamp.now(),
    });

    const projectRef = doc(db, "users", userStore.user.uid, "projects", timerStore.activeTimer.projectId);
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const currentTotalDuration = projectDoc.data().totalDuration || 0;
      await updateDoc(projectRef, {
        totalDuration: currentTotalDuration + durationSeconds,
        lastEntryDate: Timestamp.fromDate(dateOnly),
      });
    }

    const timerRef = doc(db, "users", userStore.user.uid, "timers", timerStore.activeTimer.id);
    await updateDoc(timerRef, {
      active: false,
      endTime: endTime,
    });

    timerStore.stopTimerInterval();
    timerStore.clearActiveTimer();
  } catch (err) {
    console.error("Error stopping timer:", err);
  } finally {
    saving.value = false;
  }
};

emitter.on(EVENTS.START_TIMER, startTimer);

onMounted(() => {
  getActiveTimer();
});

onUnmounted(() => {
  emitter.off(EVENTS.START_TIMER, startTimer);
  timerStore.stopTimerInterval();
  timerStore.clearActiveTimer();
});
</script>

<style scoped lang="scss">
.timer {
  --color: var(--palette-primary);

  width: 270px;
  max-height: 100px;
  border-radius: 20px;
  border-top: 4px solid var(--color);
  background-color: var(--palette-bg-secondary);
  box-shadow: 0 2px 8px var(--shadow-color);

  &__wrapper {
    display: grid;
    grid-template-rows: 1fr;
    justify-content: center;
    background-color: var(--palette-bg);
    width: 100%;
    max-width: var(--container-width);
  }

  &__time {
    font-family: "Roboto Mono", monospace;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--palette-fg);
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  grid-template-rows: 0;
}
</style>
