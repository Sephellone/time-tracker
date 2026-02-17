<template>
  <active-timer v-if="userStore.user" />
  <router-view />
  <main-navigation v-if="userStore.user" />
  <main-menu v-if="userStore.user" />
  <edit-project-modal v-if="userStore.user" />
</template>
<script setup lang="ts">
import MainNavigation from "@/components/MainNavigation.vue";
import MainMenu from "@/components/MainMenu.vue";
import { useUserStore } from "@/stores/user.ts";
import { useDarkMode } from "@/stores/darkMode.ts";
import ActiveTimer from "@/components/ActiveTimer.vue";
import EditProjectModal from "@/components/EditProjectModal.vue";

const userStore = useUserStore();
const darkModeStore = useDarkMode();

darkModeStore.init();
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
