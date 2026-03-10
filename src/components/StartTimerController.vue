<template>
  <div class="start-timer-controller">
    <icon-button class="start-timer-controller__button ml-auto" primary :size="72" @click="showModal = true">
      <Play :size="54" />
    </icon-button>
    <start-timer-modal :show="showModal" @close="showModal = false" />
  </div>
</template>
<script setup lang="ts">
import IconButton from "@/components/IconButton.vue";
import StartTimerModal from "@/components/StartTimerModal.vue";
import { ref } from "vue";
import { Play } from "lucide-vue-next";

const showModal = ref(false);
</script>

<style scoped lang="scss"></style>
