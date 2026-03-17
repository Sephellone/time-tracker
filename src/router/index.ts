import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "vuefire";
import { useUserStore } from "@/stores/user";
import LoginView from "@/views/LoginView.vue";
import PasswordResetView from "@/views/PasswordResetView.vue";
import ProfileView from "@/views/ProfileView.vue";
import StoryBook from "@/views/StoryBook.vue";
import PageLogout from "@/views/PageLogout.vue";
import { auth, db } from "@/firebaseConfig.ts";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import PageDashboard from '@/views/PageDashboard/PageDashboard.vue'
import PageProjects from "@/views/PageProjects/PageProjects.vue";
import PageEntries from "@/views/PageEntries/PageEntries.vue";
import PageStatistics from "@/views/PageStatistics/PageStatistics.vue";

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
      path: "/password-reset",
      name: "passwordReset",
      component: PasswordResetView,
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
      component: PageProjects,
      meta: { requiresAuth: true },
    },
    {
      path: "/time-entries",
      name: "timeEntries",
      component: PageEntries,
      meta: { requiresAuth: true },
    },
    {
      path: "/storybook",
      name: "storybook",
      component: StoryBook,
      meta: { requiresAuth: true },
    },
    {
      path: "/statistics",
      name: "statistics",
      component: PageStatistics,
      meta: { requiresAuth: true },
    },
    {
      path: "/logout",
      name: "logout",
      component: PageLogout,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      redirect: { name: "home" },
    }
  ],
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (!userStore.user) {
    const user = await getCurrentUser();
    
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        Object.assign(user, {
          displayName: firestoreData.displayName || user.displayName
        });
      }
    }
    
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
