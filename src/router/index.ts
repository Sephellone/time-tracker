import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "vuefire";
import { useUserStore } from "@/stores/user";
import LoginView from "@/views/LoginView.vue";
import ProfileView from "@/views/ProfileView.vue";
import ProjectsView from "@/views/ProjectsView.vue";
import TimeEntriesView from "@/views/TimeEntriesView.vue";
import StoryBook from "@/views/StoryBook.vue";
import PageLogout from "@/views/PageLogout.vue";
import { auth } from "@/firebaseConfig.ts";
import { signOut } from "firebase/auth";
import PageDashboard from '@/views/PageDashboard/PageDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: PageDashboard,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/projects",
      name: "projects",
      component: ProjectsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/time-entries",
      name: "timeEntries",
      component: TimeEntriesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/storybook",
      name: "storybook",
      component: StoryBook,
      meta: { requiresAuth: true },
    },
    {
      path: "/logout",
      name: "logout",
      component: PageLogout,
      meta: { requiresAuth: true },
    }
  ],
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (!userStore.user) {
    const user = await getCurrentUser();
    userStore.setUser(user);
  }

  if (to.name === "logout") {
    await signOut(auth);
    userStore.setUser(null);
    return { name: "login" };
  }

  if (to.meta.requiresAuth && !userStore.user) {
    return { name: "login" };
  }

  if (to.meta.requiresGuest && userStore.user) {
    return { name: "dashboard" };
  }
});

export default router;
