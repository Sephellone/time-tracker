<template>
  <div class="base-page">
    <slot />
  </div>
</template>
<script setup lang="ts"></script>


<style scoped>
.base-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--container-width);
  flex-grow: 1;
  background-color: var(--palette-bg-secondary);
  padding-bottom: calc(var(--main-navigation-height) + 24px);
}
</style>
