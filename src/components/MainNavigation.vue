<template>
  <nav class="main-navigation">
    <ul class="main-navigation__list">
      <li
        v-for="item in navigationList"
        :key="item.name"
        class="main-navigation__item"
        :class="{ __active: isActive(item), [`__${item.name}`]: true }"
        @click="item.onClick"
      >
        <component :is="item.to ? 'router-link' : 'button'" class="main-navigation__link d-center pa-2" :to="item.to">
          <component :is="item.iconComponent" />
          <span class="main-navigation__text">{{ item.text }}</span>
        </component>
      </li>
    </ul>
  </nav>
</template>
<script setup lang="ts">
import { Server, Home, ChartPie, Settings, Clock } from "lucide-vue-next";
import type { NavigationItem } from "@/types.ts";
import { useRoute } from "vue-router";
import { ref } from "vue";
import emitter from "@/lib/emitter.ts";
import { EVENTS } from "@/const.ts";

const route = useRoute();

const isMenuOpen = ref(false);

const isActive = (item: NavigationItem) => {
  return (item.to && route.path === item.to) || (item.name === "menu" && isMenuOpen.value);
};

const navigationList: NavigationItem[] = [
  {
    name: "projects",
    text: "Мои проекты",
    to: "/projects",
    iconComponent: Server,
  },
  {
    name: "timeEntries",
    text: "Записи времени",
    to: "/time-entries",
    iconComponent: Clock,
  },
  {
    name: "home",
    text: "Главная",
    to: "/",
    iconComponent: Home,
  },
  {
    name: "stats",
    text: "Статистика",
    to: "/",
    iconComponent: ChartPie,
  },

  {
    name: "menu",
    text: "Меню",
    iconComponent: Settings,
    onClick: () => {
      isMenuOpen.value = !isMenuOpen.value;
      emitter.emit(EVENTS.TOGGLE_MAIN_MENU);
    },
  },
];

emitter.on(EVENTS.MAIN_MENU_STATUS, (status: boolean) => {
  isMenuOpen.value = status;
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";

.main-navigation {
  position: fixed;
  width: calc(100% - 40px);
  left: 50%;
  max-width: calc(var(--container-width) - 40px);
  bottom: 24px;
  z-index: 10;
  display: flex;

  background-color: var(--palette-bg-secondary);
  padding: 4px 24px;
  border-radius: 20px;
  box-shadow: 0 2px 10px var(--shadow-color);

  transform: translateX(-50%);

  @include mixins.desktop-up {
    width: auto;
    max-width: none;
    box-shadow: none;
    background-color: transparent;
    top: 0;
    left: calc(50% - var(--container-width) / 2);
    bottom: auto;
    padding: 20px 0;
    transform: translateX(-110%);
  }

  &__list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    flex-grow: 1;

    @include mixins.desktop-up {
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 16px;
    }
  }

  &__text {
    display: none;

    @include mixins.desktop-up {
      display: block;
    }
  }

  &__item {
    color: var(--palette-fg);

    &.__active {
      color: var(--palette-primary);
    }

    @include mixins.desktop-up {
      &.__home {
        order: -1;
      }
    }
  }

  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: transparent;
    box-shadow: none;
    font-family: "Roboto", sans-serif;
    font-weight: 500;
    font-size: 14px;
    line-height: 1.1;
    cursor: pointer;
    user-select: none;
    gap: 8px;
  }
}
</style>
