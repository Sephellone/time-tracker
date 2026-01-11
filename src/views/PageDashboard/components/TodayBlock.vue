<template>
  <div class="today-block d-flex __align-center __space-between gap-2 px-6 py-4">
    <div class="today-block__date d-flex __column gap-2">
      <div class="today-block__date">{{ date }}</div>
      <div class="today-block__day">{{ dayOfWeek }}</div>
    </div>
    <div class="today-block__time">
      <div v-if="loading"><base-loader /></div>
      <div v-else>{{ formattedTotalTime }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatDate, getDayOfWeek, formatDuration } from "@/lib/time";
import { computed, ref, onMounted } from "vue";
import { useCurrentUser } from "vuefire";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import BaseLoader from "@/components/BaseLoader.vue";

const user = useCurrentUser();
const totalTimeForToday = ref(0);
const loading = ref(true);

const date = computed(() => formatDate(new Date()));
const dayOfWeek = computed(() => getDayOfWeek(new Date()));
const formattedTotalTime = computed(() => formatDuration(totalTimeForToday.value));

const getTotalTimeForToday = async () => {
  if (!user.value?.uid) return;

  loading.value = true;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const timeEntriesRef = collection(db, "users", user.value.uid, "timeEntries");
    const q = query(timeEntriesRef, where("date", "==", todayTimestamp));
    const entriesSnapshot = await getDocs(q);

    let totalDuration = 0;
    entriesSnapshot.forEach((doc) => {
      const data = doc.data();
      totalDuration += data.duration || 0;
    });

    totalTimeForToday.value = totalDuration;
  } catch (error) {
    console.error("Error loading today's time entries:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getTotalTimeForToday();
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";
.today-block {
  background-color: var(--palette-primary);
  color: var(--palette-white);
  border-radius: 20px;

  &__date {
    font-size: 20px;
    font-weight: 600;

    @include mixins.desktop-up {
      font-size: 28px;
    }
  }

  &__day {
    font-size: 16px;
    font-weight: 400;
    @include mixins.desktop-up {
      font-size: 20px;
    }
  }

  &__time {
    font-size: 20px;
  }
}
</style>
