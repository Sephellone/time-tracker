import type { StartTimerEvent } from "@/types.ts";

export enum EVENTS {
  TOGGLE_MAIN_MENU = "TOGGLE_MAIN_MENU",
  MAIN_MENU_STATUS = "MAIN_MENU_STATUS",
  START_TIMER = "START_TIMER",
}

export type EmitterEvents = {
  [EVENTS.TOGGLE_MAIN_MENU]: undefined;
  [EVENTS.MAIN_MENU_STATUS]: boolean;
  [EVENTS.START_TIMER]: StartTimerEvent;
};
