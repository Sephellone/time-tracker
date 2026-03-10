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
import InputPassword from "@/components/InputPassword.vue";

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
    case "password":
      return InputPassword;
    default:
      return BaseInput;
  }
});

const inputProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...fieldProps } = props.field;
  return {
    ...fieldProps,
    modelValue: props.value,
  };
});
</script>

<style scoped></style>
