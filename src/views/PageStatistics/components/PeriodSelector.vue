<template>
  <div class="period-selector">
    <base-select
      name="period"
      label="Период"
      :options="selectOptions"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PERIOD_OPTIONS } from "../utils/chartHelpers";
import BaseSelect from "@/components/BaseSelect.vue";
import type { SelectOption } from "@/types";

defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectOptions = computed<SelectOption[]>(() => 
  PERIOD_OPTIONS.map(option => ({
    value: option.value,
    text: option.label,
  }))
);
</script>

<style scoped lang="scss">
.period-selector {
  max-width: 300px;
}
</style>
