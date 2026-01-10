<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="icon-button no-shrink"
    :class="{
      __negative: negative,
      __primary: primary,
      __secondary: secondary,
      __accent: accent,
      __positive: positive,
    }"
    :style="`color: ${iconColor}`"
    @click="$emit('click')"
  >
    <base-loader
      v-if="loading"
      :color="color"
      :size="size"
    />
    <slot>
      <mdicon :name="icon" :size="size" />
    </slot>
  </component>
</template>
<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";
import BaseLoader from "@/components/BaseLoader.vue";

const props = defineProps({
  loading: { type: Boolean, default: false },
  to: { type: Object as PropType<RouteLocationRaw> },
  icon: { type: String, required: true },
  size: { type: [String, Number], default: 28 },
  color: { type: String },
  negative: { type: Boolean },
  primary: { type: Boolean },
  secondary: { type: Boolean },
  accent: { type: Boolean },
  positive: { type: Boolean },
});

defineEmits(["click"]);

const iconColor = computed(() =>
  props.color
    ? props.color
    : props.positive || props.primary || props.negative || props.accent
      ? "var(--palette-bg-secondary)"
      : props.secondary
        ? "var(--palette-primary)"
        : "var(--palette-fg)",
);
</script>

<style scoped lang="scss">
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  &:active {
    filter: brightness(1.3);
  }

  &.__negative {
    background-color: var(--palette-negative);
  }

  &.__positive {
    background-color: var(--palette-positive);
  }

  &.__primary {
    background-color: var(--palette-primary);
  }

  &.__secondary {
    background-color: var(--palette-secondary);
  }
  &.__accent {
    background-color: var(--palette-accent);
  }
}
</style>
