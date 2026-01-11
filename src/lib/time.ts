import { Timestamp } from "firebase/firestore";

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatDate = (
  timestamp: Timestamp | Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!timestamp) return "Неизвестно";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    day: "numeric",
    ...options,
  });
};

export const getDayOfWeek = (timestamp: Timestamp | Date | string | null | undefined, short: boolean = false) => {
  if (!timestamp) return "Неизвестно";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleDateString("ru-RU", {
    weekday: short ? "short" : "long",
  });
};

export const formatTime = (
  timestamp: Timestamp | Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!timestamp) return "";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatElapsedTime = (elapsedSeconds: number) => {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
