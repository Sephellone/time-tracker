<template>
  <div class="base-input">
    <label :for="`id_${name}`" v-if="!!label" class="base-input__label">
      {{ label }} <span v-if="required" class="base-input__required">*</span>
    </label>
    <div class="base-input__wrapper d-flex __align-center gap-1 px-3 py-1">
      <input
        :id="`id_${name}`"
        class="base-input__input comforta"
        :autocomplete="autocomplete"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      />
      <span class="base-input__append">
        <slot name="append"></slot>
      </span>
    </div>
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
});

const emit = defineEmits(["update:modelValue"]);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<style scoped lang="scss">
.base-input {
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

  &__wrapper {
    position: relative;
    border-radius: 12px;
    background-color: var(--palette-bg-secondary);
    box-shadow: inset 0 2px 4px var(--shadow-color);
    overflow: hidden;

    &:focus-within {
      outline: 1px solid var(--palette-primary);
    }
  }

  &__input {
    display: flex;
    width: 100%;
    padding: 4px 0;
    font-size: 14px;
    cursor: text;
    outline: none;
    border: none;
    background: transparent;
    color: var(--palette-fg);

    &::placeholder {
      color: var(--palette-gray);
    }
  }
}
</style>
