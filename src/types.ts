import type { Timestamp } from "firebase/firestore";
import type { RouteLocationRaw } from "vue-router";

export interface NavigationItem {
  name: string;
  text: string;
  to?: string;
  onClick?: () => void;
  iconComponent?: any;
}

export interface InputProjectCreate {
  name: string;
  description?: string;
  color: string;
  hourlyRate: number;
  currency?: string;
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
export interface SelectOption {
  value: string;
  text: string;
}

export interface FormField {
  name: string;
  label?: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  class?: string;
  options?: SelectOption[];
}

export type FormValues = Record<string, any>;

export interface TabItem {
  name: string;
  text: string;
  to?: RouteLocationRaw | string;
}
