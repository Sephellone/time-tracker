<template>
  <div class="base-textarea">
    <label>
      <span class="base-textarea__label"
        >{{ label }} <span v-if="required" class="base-textarea__required">*</span></span
      >
      <textarea
        class="base-textarea__input"
        :autocomplete="autocomplete"
        :name="name"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :rows="rows"
        @input="onInput"
      />
    </label>
  </div>
</template>
<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: "" },
  name: { type: String, required: true },
  placeholder: { type: String, default: "" },
  type: { type: String, default: "text" },
  label: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
  rows: { type: Number, default: 3 },
});

const emit = defineEmits(["update:modelValue"]);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<style scoped lang="scss">
.base-textarea {
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
    cursor: text;
    outline: none;
    border: none;
    resize: none;

    &::placeholder {
      font-family: "Comfortaa", sans-serif;
      color: var(--palette-gray);
    }

    &:focus {
      outline: 1px solid var(--palette-primary);
    }
  }
}
</style>
