<template>
  <base-page class="gap-3">
    <base-button>I'm button</base-button>
    <base-button full-width>full width</base-button>
    <base-button small>I'm small button</base-button>
    <base-button small full-width>small full width</base-button>
    <base-button large>I'm large button</base-button>
    <base-button large full-width>large full width</base-button>
    <base-button large loading>I'm large button</base-button>
    <base-button secondary>I'm secondary button</base-button>
    <base-button secondary loading>I'm secondary button</base-button>
    <base-button negative>I'm negative button</base-button>
    <base-button positive>I'm positive button</base-button>
    <base-button accent>I'm accent button</base-button>

    <div class="d-flex __wrap">
      <icon-button icon="pencil" />
      <icon-button primary icon="pencil" />
      <icon-button negative icon="pencil" />
      <icon-button positive icon="pencil" />
      <icon-button secondary icon="pencil" />
      <icon-button accent icon="pencil" />
      <icon-button primary icon="pencil" size="16px" />
      <icon-button primary icon="pencil" size="32px" />
    </div>

    <div>
      <base-switch v-model="switchOn" />
    </div>
  </base-page>
</template>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import IconButton from "@/components/IconButton.vue";
import BasePage from "@/components/BasePage.vue";
import BaseSwitch from "@/components/BaseSwitch.vue";
import { ref } from "vue";

const switchOn = ref(false);
</script>

<style scoped>

</style>
