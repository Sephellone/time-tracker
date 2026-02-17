<template>
  <div class="base-tabs d-flex __align-center">
    <template v-for="item in items" :key="item.name">
      <component
        :is="item.to ? 'router-link' : 'button'"
        class="base-tabs__item d-center comforta fw-700 px-2 py-1"
        :class="{ __active: item.name === modelValue }"
        :to="item.to"
        replace
        @click="onClick(item.name)"
      >
        {{ item.text }}
      </component>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { TabItem } from "@/types.ts";
import type { PropType } from "vue";

const props = defineProps({
  items: { type: Array as PropType<TabItem[]>, required: true },
  modelValue: { type: String, required: true },
});

const emit = defineEmits(["update:modelValue"]);

const onClick = (name: string) => {
  if (name === props.modelValue) return;
  emit("update:modelValue", name);
};
</script>

<style scoped lang="scss">
.base-tabs {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px var(--shadow-color);
  background: var(--palette-bg-secondary);
  &__item {
    border-radius: 20px;
    text-align: center;
    flex: 1 1 0;
    appearance: none;
    border: none;
    box-shadow: none;
    background: transparent;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &.__active {
      background: var(--palette-primary);
      color: var(--palette-white);
      box-shadow: 0 2px 4px var(--shadow-color);
    }
  }
}
</style>
