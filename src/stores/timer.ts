import { defineStore } from "pinia";
import type { TimerDb } from "@/types.ts";
import { ref } from "vue";

export const useTimerStore = defineStore('timer', () => {
  const elapsedSeconds = ref(0);
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const activeTimer = ref<TimerDb | null>(null);

  const updateElapsed = () => {
    if (activeTimer.value?.startTime) {
      const now = Date.now();
      const start = activeTimer.value.startTime.toMillis();
      elapsedSeconds.value = Math.floor((now - start) / 1000);
    }
  };

  const startTimerInterval = () => {
    if (timerInterval.value) return;
    updateElapsed();
    timerInterval.value = setInterval(updateElapsed, 1000);
  };

  const stopTimerInterval = () => {
    if (!timerInterval.value) return;
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  };

  const setActiveTimer = (timer: TimerDb) => {
    activeTimer.value = timer;
    startTimerInterval();
  };

  const clearActiveTimer = () => {
    activeTimer.value = null;
    elapsedSeconds.value = 0;
  };

  return {
    activeTimer,
    elapsedSeconds,
    setActiveTimer,
    clearActiveTimer,
    startTimerInterval,
    stopTimerInterval,
  };
})
