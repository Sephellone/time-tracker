<template>
  <base-page class="dashboard px-5 pt-2">
    <div class="dashboard__header comforta d-flex __align-center gap-2 py-5">
      Привет, <strong>{{ userStore.user?.displayName }}</strong>
    </div>
    <today-block class="mb-11" />
    <recent-projects-block class="mb-6" />
    <recent-entries-block />
  </base-page>
</template>
<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import { useUserStore } from "@/stores/user.ts";
import TodayBlock from "@/views/PageDashboard/components/TodayBlock.vue";
import RecentProjectsBlock from "@/views/PageDashboard/components/RecentProjectsBlock.vue";
import RecentEntriesBlock from '@/views/PageDashboard/components/RecentEntriesBlock.vue'

const userStore = useUserStore();
</script>

<style scoped></style>
