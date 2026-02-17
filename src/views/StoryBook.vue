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
    <base-button accent @click="modalOpen = true">I'm accent button. I'll open modal</base-button>

    <div class="d-flex __wrap">
      <icon-button>
        <pencil />
      </icon-button>
      <icon-button primary>
        <pencil />
      </icon-button>
      <icon-button negative>
        <pencil />
      </icon-button>
      <icon-button positive>
        <pencil />
      </icon-button>
      <icon-button secondary>
        <pencil />
      </icon-button>
      <icon-button accent>
        <pencil />
      </icon-button>
      <icon-button primary>
        <pencil :size="16" />
      </icon-button>
      <icon-button primary>
        <x :size="32" />
      </icon-button>
    </div>

    <div>
      <base-switch v-model="switchOn" />
    </div>
    <base-modal :value="modalOpen" title="Modal title" @close="modalOpen = false">
      <div>Modal content</div>
    </base-modal>
  </base-page>
</template>
<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import IconButton from "@/components/IconButton.vue";
import BasePage from "@/components/BasePage.vue";
import BaseSwitch from "@/components/BaseSwitch.vue";
import { ref } from "vue";
import { Pencil, X } from "lucide-vue-next";
import BaseModal from "@/components/BaseModal.vue";

const switchOn = ref(false);
const modalOpen = ref(false);
</script>

<style scoped></style>
