<template>
  <base-input
    type="date"
    :modelValue="modelValue"
    :name="name"
    :placeholder="placeholder"
    :label="label"
    :disabled="disabled"
    :required="required"
    :autocomplete="autocomplete"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>
<script setup lang="ts">
import BaseInput from "@/components/BaseInput.vue";

defineProps({
  modelValue: { type: String, default: "" },
  name: { type: String, required: true },
  placeholder: { type: String, default: "" },
  label: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped lang="scss">
:deep(.base-input__input) {
  &::-webkit-calendar-picker-indicator {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    display: block;
    cursor: pointer;
    width: 20px;
    height: 20px;
    scale: 0.8;
    mask-image: url("/icons/calendar.svg");
    background-repeat: no-repeat;
    background-image: none;
    background-color: currentColor;
    margin-left: auto;
  }
}
</style>
