<template>
  <div class="base-switch" :class="{ __active: model }" @click="updateModel">
    <div class="base-switch__knob"></div>
    <input class="visually-hidden" type="checkbox" :value="model" />
  </div>
</template>
<script setup lang="ts">
const model = defineModel<boolean>();

const updateModel = () => {
  model.value = !model.value;
};
</script>

<style scoped lang="scss">
.base-switch {
  display: flex;
  align-items: center;
  width: 60px;
  padding: 4px;
  border-radius: 20px;
  background-color: var(--palette-bg);
  box-shadow: inset 0 2px 4px var(--inner-shadow-color);
  transition: all 0.3s ease-in-out;

  &__knob {
    margin-left: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--palette-gray);
    transition: all 0.3s ease-in-out;
    flex-shrink: 0;
    box-shadow: 0 2px 8px var(--inner-shadow-color);
  }

  &.__active {
    background-color: var(--palette-secondary);

    .base-switch__knob {
      background-color: var(--palette-primary);
      margin-left: 28px;
    }
  }
}
</style>
