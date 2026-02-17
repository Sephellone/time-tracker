<template>
  <div class="color-select">
    <div v-if="label" class="color-select__label mb-1">{{ label }}</div>
    <div class="d-flex __align-center __wrap gap-2">
      <div
        v-for="color in defaultColors"
        :key="color"
        class="color-select__item d-center"
        :class="{ __selected: isSelected(color) }"
        :style="{ backgroundColor: color }"
        @click="onColorClick(color)"
      >
        <Check class="color-select__check" v-if="isSelected(color)" />
      </div>
      <div
        class="color-select__item d-center __custom"
        :style="{
          background: customColor
            ? customColor
            : 'linear-gradient(45deg, rgb(255,0,0) 0%, rgb(255,154,0) 10%, rgb(208,222,33) 20%, rgb(79,220,74) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%)',
        }"
        @click="onCustomColorClick"
      >
        <Check class="color-select__check" v-if="isSelected(customColor)" />
        <input ref="customColorRef" class="visually-hidden" type="color" v-model="customColor" @input="onInputCustom" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defaultColors } from "@/const.ts";
import { Check } from "lucide-vue-next";
import { onMounted, ref } from "vue";

const props = defineProps({
  modelValue: { type: String, default: defaultColors[0] },
  label: { type: String },
});

const emit = defineEmits(["update:modelValue"]);

const customColor = ref("");
const customColorRef = ref();

const isSelected = (color: string) => {
  return color === props.modelValue;
};

const onCustomColorClick = () => {
  if (customColorRef.value) {
    customColorRef.value.click();
  }
};

const onInputCustom = (event: Event) => {
  const target = event.target as HTMLInputElement;
  customColor.value = target.value;
  emit("update:modelValue", target.value);
};

const onColorClick = (color: string) => {
  emit("update:modelValue", color);
};

onMounted(() => {
  if (!defaultColors.includes(props.modelValue)) {
    customColor.value = props.modelValue;
  }
});
</script>

<style scoped lang="scss">
.color-select {
  &__item {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    cursor: pointer;

    &.__selected {
      box-shadow: inset 0 4px 4px rgba(0, 0, 0, 0.35);
    }
  }

  &__label {
    display: block;
    margin-bottom: 2px;
    margin-left: 4px;
    font-size: 11px;
  }

  &__check {
    color: var(--palette-white);
  }
}
</style>
