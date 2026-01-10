<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="base-button"
    :disabled="disabled"
    :class="{
      __secondary: secondary,
      __small: small,
      __large: large,
      '__full-width': fullWidth,
      __disabled: disabled,
      __negative: negative,
      __accent: accent,
      __positive: positive,
      __loading: loading,
    }"
    @click="$emit('click')"
  >
    <base-loader
      v-if="loading"
      :color="color"
      :size="spinnerSize ? spinnerSize : small ? '14px' : '20px'"
    />
    <slot v-else />
  </component>
</template>
<script setup lang="ts">
import BaseLoader from "@/components/BaseLoader.vue";
import { computed, type PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

const props = defineProps({
  to: { type: Object as PropType<RouteLocationRaw> },
  secondary: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  large: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  negative: { type: Boolean, default: false },
  positive: { type: Boolean, default: false },
  accent: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  spinnerColor: { type: String },
  spinnerSize: { type: String },
});

defineEmits(["click"]);

const color = computed(() =>
  props.spinnerColor ? props.spinnerColor : props.secondary ? "var(--palette-primary)" : "#ffffff",
);
</script>

<style scoped lang="scss">
@use "@/assets/scss/mixins";

.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px 16px;
  width: fit-content;
  min-width: 80px;
  background-color: var(--palette-primary);
  color: #ffffff;
  border-radius: 12px;
  border: none;
  outline: none;
  box-shadow: none;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  cursor: pointer;
  user-select: none;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  &:active {
    filter: brightness(1.3);
  }

  &.__secondary {
    background-color: transparent;
    border: 1px solid var(--palette-primary);
    color: var(--palette-primary);
  }

  &.__disabled {
    pointer-events: none;
    background-color: var(--palette-gray);
    color: rgba(0, 0, 0, 0.5);
  }

  &.__negative {
    background-color: var(--palette-negative);
  }

  &.__positive {
    background-color: var(--palette-positive);
  }

  &.__accent {
    background-color: var(--palette-accent);
  }

  &.__large {
    padding: 12px 24px;
    font-size: 18px;
    border-radius: 20px;
  }

  &.__small {
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 8px;
    font-weight: 400;
  }

  &.__full-width {
    width: 100%;
  }
  &.__loading {
    pointer-events: none;
  }
}
</style>
