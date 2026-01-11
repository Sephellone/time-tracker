<template>
  <transition name="slide" mode="out-in">
    <div v-if="showMenu" class="main-menu">
      <div class="main-menu__overlay" @click.stop="toggleMenu"></div>
      <div v-if="showMenu" class="main-menu__content">
        <div class="main-menu__header d-flex __align-center">
          <div class="main-menu__dark-switch d-flex __align-center gap-2 ml-auto">
            <sun />
            <base-switch :modelValue="darkModeStore.isDark" @update:modelValue="darkModeStore.toggleDarkMode" />
            <moon />
          </div>
        </div>
        <router-link class="main-menu__link d-flex __align-center pa-3 gap-2" to="/profile" @click="toggleMenu">
          <user />
          Настройки профиля
        </router-link>
        <router-link class="main-menu__link __logout d-flex __align-center pa-3 gap-2" to="/logout" @click="toggleMenu">
          <log-out />
          Выйти
        </router-link>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import emitter from "@/lib/emitter.ts";
import { onBeforeUnmount, ref } from "vue";
import { EVENTS } from "@/const.ts";
import BaseSwitch from "@/components/BaseSwitch.vue";
import { useDarkMode } from "@/stores/darkMode.ts";
import { Moon, Sun, LogOut, User } from "lucide-vue-next";

const darkModeStore = useDarkMode();
const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
  emitter.emit(EVENTS.MAIN_MENU_STATUS, showMenu.value);
};

emitter.on(EVENTS.TOGGLE_MAIN_MENU, toggleMenu);

onBeforeUnmount(() => {
  emitter.off(EVENTS.TOGGLE_MAIN_MENU, toggleMenu);
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";

.main-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--overlay-color);
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: var(--container-width);
    background-color: var(--palette-bg-secondary);
    padding: 24px 24px calc(var(--main-navigation-height) + 24px) 24px;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 2px 10px var(--shadow-color);
    transform: translateX(-50%);

    @include mixins.desktop-up {
      left: 0;
      top: 0;
      padding: 24px 24px 24px calc((100% - var(--container-width)) / 2 + 24px);
      border-radius: 0 20px 20px 0;
      transform: translateX(0);
    }
  }

  &__link {
    font-size: 16px;
    font-weight: 500;
    border-radius: 12px;

    &:hover {
      background-color: var(--palette-bg);
    }

    &:active {
      opacity: 0.6;
    }

    &.__logout {
      color: var(--palette-negative);
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  .main-menu__content {
    transition: all 0.2s ease-out;
  }

  .main-menu__overlay {
    transition: all 0.2s ease-out;
  }
}

.slide-enter-from,
.slide-leave-to {
  .main-menu__content {
    transform: translateX(-50%)  translateY(100%);
    opacity: 0;

    @include mixins.desktop-up {
      transform: translateX(-100%);
      opacity: 1;
    }
  }

  .main-menu__overlay {
    opacity: 0;
  }
}
</style>
