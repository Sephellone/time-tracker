<template>
  <component :is="component" v-bind="inputProps" @update:modelValue="$emit('input', field.name, $event)" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { FormField } from "@/types.ts";
import BaseTextarea from "@/components/BaseTextarea.vue";
import BaseInput from "@/components/BaseInput.vue";
import BaseSelect from "@/components/BaseSelect.vue";
import ColorSelect from "@/components/ColorSelect.vue";

interface Props {
  field: FormField;
  value: any;
}

const props = defineProps<Props>();

defineEmits(["input"]);

const component = computed(() => {
  switch (props.field.type) {
    case "textarea":
      return BaseTextarea;
    case "select":
      return BaseSelect;
    case "colorSelect":
      return ColorSelect;
    default:
      return BaseInput;
  }
});

const inputProps = computed(() => {
  return {
    ...props.field,
    modelValue: props.value,
  };
});
</script>

<style scoped></style>
