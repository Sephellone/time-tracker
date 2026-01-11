import { useUserStore } from "@/stores/user.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig.ts";
import type { Project } from "@/types.ts";

export default function useProjects() {
  const userStore = useUserStore();


  const getProjectById = async (id: string) => {
    if (!userStore.user) return null;
    const projectsRef = doc(db, "users", userStore.user.uid, "projects", id);
    const project = await getDoc(projectsRef);
    return project?.data() as Project | null;
  };

  return {
    getProjectById,
  };
}
