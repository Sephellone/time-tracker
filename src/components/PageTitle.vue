<template>
  <div class="page-title d-flex __align-center gap-2">
    <icon-button v-if="!hideBack" @click="onBack">
      <arrow-left />
    </icon-button>
    <h2 class="comforta flex-grow">{{ title }}</h2>
    <slot name="actions"></slot>
  </div>
</template>
<script setup lang="ts">
import IconButton from "@/components/IconButton.vue";
import { ArrowLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

defineProps({
  hideBack: { type: Boolean, default: false },
  title: { type: String, required: true },
});


const router = useRouter();

const onBack = () => {
  router.back();
};
</script>

<style scoped lang="scss"></style>
