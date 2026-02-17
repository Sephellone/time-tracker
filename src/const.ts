import type { Project, StartTimerEvent } from "@/types.ts";

export enum EVENTS {
  TOGGLE_MAIN_MENU = "TOGGLE_MAIN_MENU",
  MAIN_MENU_STATUS = "MAIN_MENU_STATUS",
  START_TIMER = "START_TIMER",
  OPEN_EDIT_PROJECT_MODAL = "OPEN_EDIT_PROJECT_MODAL",
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
}

export type EmitterEvents = {
  [EVENTS.TOGGLE_MAIN_MENU]: undefined;
  [EVENTS.MAIN_MENU_STATUS]: boolean;
  [EVENTS.START_TIMER]: StartTimerEvent;
  [EVENTS.OPEN_EDIT_PROJECT_MODAL]: Project | null;
  [EVENTS.PROJECT_CREATED]: Project;
  [EVENTS.PROJECT_UPDATED]: Project;
  [EVENTS.PROJECT_DELETED]: string;
};


export const availableCurrencies = [
  { code: "RUB", name: "Российский рубль" },
  { code: "USD", name: "Доллар США" },
  { code: "EUR", name: "Евро" },
  { code: "GBP", name: "Фунт стерлингов" },
  { code: "JPY", name: "Японская иена" },
  { code: "CNY", name: "Китайский юань" },
  { code: "CHF", name: "Швейцарский франк" },
  { code: "CAD", name: "Канадский доллар" },
  { code: "AUD", name: "Австралийский доллар" },
  { code: "INR", name: "Индийская рупия" },
  { code: "BRL", name: "Бразильский реал" },
  { code: "KRW", name: "Южнокорейская вона" },
  { code: "MXN", name: "Мексиканское песо" },
  { code: "SGD", name: "Сингапурский доллар" },
  { code: "HKD", name: "Гонконгский доллар" },
  { code: "NOK", name: "Норвежская крона" },
  { code: "SEK", name: "Шведская крона" },
  { code: "TRY", name: "Турецкая лира" },
  { code: "PLN", name: "Польский злотый" },
  { code: "THB", name: "Тайский бат" },
];

export const defaultColors = [
  "#5274e3",
  "#43e97b",
  "#fa709a",
  "#f66d39",
  "#fee140",
  "#b885f1",
  "#7c00ff",
  "#f33046",
  "#ec76f4",
  "#4facfe",
  "#30cfd0",
  "#046c2e",
  "#e1992b",
  "#04286c",
  "#710316",
  "#834f38",
  "#000000",
  "#390060",
];
