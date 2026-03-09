import { collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import type { Project, TimeEntry } from "@/types";

export interface ProjectStats extends Project {
  percentage?: number;
}

export async function fetchTopProjects(userId: string, maxProjects: number = 100): Promise<ProjectStats[]> {
  const projectsRef = collection(db, "users", userId, "projects");
  const q = query(
    projectsRef,
    orderBy("totalDuration", "desc"),
    limit(maxProjects)
  );

  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProjectStats[];

  const totalDuration = projects.reduce((sum, p) => sum + p.totalDuration, 0);

  return projects.map(p => ({
    ...p,
    percentage: totalDuration > 0 ? (p.totalDuration / totalDuration) * 100 : 0
  }));
}

export async function fetchLeastTrackedProjects(userId: string): Promise<ProjectStats[]> {
  const projectsRef = collection(db, "users", userId, "projects");
  const q = query(
    projectsRef,
    orderBy("totalDuration", "asc"),
    limit(3)
  );

  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProjectStats[];

  return projects;
}

export async function fetchTimeEntriesInPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeEntry[]> {
  const entriesRef = collection(db, "users", userId, "timeEntries");
  const q = query(
    entriesRef,
    where("startTime", ">=", Timestamp.fromDate(startDate)),
    where("startTime", "<=", Timestamp.fromDate(endDate)),
    orderBy("startTime", "asc")
  );

  const querySnapshot = await getDocs(q);


  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TimeEntry[];
}
