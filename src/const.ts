export enum EVENTS {
  TOGGLE_MAIN_MENU = "TOGGLE_MAIN_MENU",
  MAIN_MENU_STATUS = "MAIN_MENU_STATUS",
}

export type EmitterEvents = {
  [EVENTS.TOGGLE_MAIN_MENU]: undefined;
  [EVENTS.MAIN_MENU_STATUS]: boolean;
};
