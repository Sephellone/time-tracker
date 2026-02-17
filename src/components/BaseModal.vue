<template>
  <transition name="fade-grow">
    <div v-if="value" class="base-modal d-center" @click="$emit('close')">
      <div class="base-modal__content" @click.stop>
        <icon-button v-if="showCloseButton" class="base-modal__close" @click="$emit('close')">
          <x />
        </icon-button>
        <div v-if="title" class="base-modal__title comforta fw-600 mb-4">{{ title }}</div>
        <slot />
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import { X } from "lucide-vue-next";
import IconButton from "@/components/IconButton.vue";

defineProps({
  value: { type: Boolean, default: false },
  showCloseButton: { type: Boolean, default: true },
  title: { type: String },
});

defineEmits(["close"]);
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: var(--overlay-color);
  z-index: 15;

  &__content {
    position: relative;
    background-color: var(--palette-bg-secondary);
    border-radius: 20px;
    padding: 20px;
    width: 100%;
    max-width: var(--container-width);
    max-height: 100%;

    @include mixins.desktop-up {
      max-height: 90vh;
      overflow: auto;
    }
  }

  &__title {
    font-size: 20px;
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

.fade-grow-enter-active,
.fade-grow-leave-active {
  transition: all 0.3s ease-out;
  .base-modal__content {
    transition: all 0.3s ease-out;
  }
}

.fade-grow-enter-from,
.fade-grow-leave-to {
  opacity: 0;
  .base-modal__content {
    scale: 0.5;
    opacity: 0;
  }
}
</style>
