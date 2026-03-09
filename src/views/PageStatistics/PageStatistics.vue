<template>
  <base-page class="statistics px-5">
    <page-title class="pt-4 mb-6" title="Статистика" />
    
    <div class="statistics__content">
      <all-time-stats class="statistics__section" />
      <period-stats class="statistics__section" />
    </div>
  </base-page>
</template>

<script setup lang="ts">
import BasePage from "@/components/BasePage.vue";
import PageTitle from "@/components/PageTitle.vue";
import AllTimeStats from "./components/AllTimeStats.vue";
import PeriodStats from "./components/PeriodStats.vue";
</script>

<style scoped lang="scss">
.statistics {
  min-height: 100vh;
  color: var(--palette-fg);

  &__content {
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding-bottom: 40px;
  }

  &__section {
    width: 100%;
  }
}
</style>
