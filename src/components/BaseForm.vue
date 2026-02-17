<template>
  <form class="base-form" @submit.prevent="onSubmit">
    <field-printer
      class="base-form__field"
      :class="{ __error: errorFields.includes(field.name) }"
      v-for="field in props.fields"
      :key="field.name"
      :field="field"
      :value="props.values[field.name]"
      @input="onInput"
    />
  </form>
</template>
<script setup lang="ts">
import type { FormField, FormValues } from "@/types.ts";
import type { PropType } from "vue";
import FieldPrinter from "@/components/FieldPrinter.vue";

const props = defineProps({
  fields: { type: Array as PropType<FormField[]>, required: true },
  values: { type: Object as PropType<FormValues>, required: true },
  errorFields: { type: Array as PropType<string[]>, default: () => [] },
});

const emit = defineEmits(["submit", "input"]);

const onInput = (field: string, value: any) => {
  emit("input", { ...props.values, [field]: value });
};

const onSubmit = () => {
  emit("submit", props.values);
};
</script>

<style scoped lang="scss">
.base-form {
  &__field {
    &.__error {
      :deep(input),
      :deep(select),
      :deep(textarea) {
        animation: shake-horizontal 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
        outline: 1px solid var(--palette-negative);
        color: var(--palette-negative);

        &::placeholder {
          color: var(--palette-negative);
        }
      }
    }
  }
}

@keyframes shake-horizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60% {
    transform: translateX(3px);
  }
  80% {
    transform: translateX(2px);
  }
  90% {
    transform: translateX(-2px);
  }
}
</style>
