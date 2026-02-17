<template>
  <div class="base-select">
    <label>
      <span v-if="label" class="base-select__label">
        {{ label }} <span v-if="required" class="base-input__required">*</span>
      </span>
      <select
        class="base-select__input"
        :name="name"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        @change="onInput"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <component :is="modelValue ? X : ChevronDown" class="base-select__icon" :size="16" />
    </label>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from "vue";
import type { SelectOption } from "@/types.ts";
import { X, ChevronDown } from "lucide-vue-next";

defineProps({
  name: { type: String, required: true },
  options: { type: Array as PropType<SelectOption[]>, required: true },
  label: { type: String, default: "" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  modelValue: { type: String },
});

const emit = defineEmits(["update:modelValue"]);

const onInput = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
};
</script>

<style scoped lang="scss">
.base-select {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  &__label {
    display: block;
    margin-bottom: 2px;
    margin-left: 4px;
    font-size: 11px;
  }

  &__required {
    color: var(--palette-primary);
  }

  &__input {
    display: flex;
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 12px;
    background-color: var(--palette-bg-secondary);
    box-shadow: inset 0 2px 4px var(--shadow-color);
    cursor: pointer;
    outline: none;
    border: none;
    appearance: none;
    -webkit-appearance: none;

    &::placeholder {
      color: var(--palette-gray);
    }

    &:focus {
      outline: 1px solid var(--palette-primary);
    }
  }
  &__icon {
    position: absolute;
    z-index: 1;
    right: 12px;
    bottom: 8px;
    cursor: pointer;
  }
}
</style>
