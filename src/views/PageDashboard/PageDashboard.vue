<template>
  <base-page class="dashboard px-5 pt-2">
    <div class="dashboard__header comforta d-flex __align-center gap-2 py-5">
      Привет, <strong>{{ userStore.user?.displayName }}</strong>
    </div>
    <today-block class="mb-11" />
    <recent-projects-block class="mb-6" />
    <recent-entries-block />
    <start-timer-controller v-if="!timerStore.activeTimer" class="dashboard__start" />
  </base-page>
</template>
<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import { useUserStore } from "@/stores/user.ts";
import TodayBlock from "@/views/PageDashboard/components/TodayBlock.vue";
import RecentProjectsBlock from "@/views/PageDashboard/components/RecentProjectsBlock.vue";
import RecentEntriesBlock from "@/views/PageDashboard/components/RecentEntriesBlock.vue";
import StartTimerController from "@/components/StartTimerController.vue";
import { useTimerStore } from "@/stores/timer.ts";

const userStore = useUserStore();
const timerStore = useTimerStore();
</script>

<style scoped lang="scss">
.dashboard {
  position: relative;

  &__start {
    position: sticky;
    bottom: calc(var(--main-navigation-height) + 24px);
    right: 40px;
    z-index: 3;
  }
}
</style>
