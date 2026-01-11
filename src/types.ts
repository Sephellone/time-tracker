import type { Timestamp } from "firebase/firestore";

export interface NavigationItem {
  name: string;
  text: string;
  to?: string;
  onClick?: () => void;
  iconComponent?: any;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  hourlyRate: number;
  currency?: string;
  totalDuration: number;
  archived: boolean;
  lastEntryDate: Timestamp;
  createTime: Timestamp;
}

export interface TimeEntryDb {
  id: string;
  projectId: string;
  date: Timestamp;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  type: string;
  createdAt: Timestamp;
}

export interface TimeEntry extends TimeEntryDb {
  projectName: string;
  projectColor?: string;
  cost: number | null;
  currency?: string;
}


export interface TimerDb {
  id: string;
  active: boolean;
  projectId: string;
  createdAt: Timestamp;
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface StartTimerEvent {
  projectId: string;
  cb?: () => void;
}
