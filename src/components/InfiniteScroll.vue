<template>
  <div class="infinite-scroll">
    <slot></slot>
    <div ref="sentinel" class="infinite-scroll__sentinel"></div>
    <div v-if="isLoading" class="infinite-scroll__loader d-center pa-10">
      <base-loader />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import BaseLoader from "@/components/BaseLoader.vue";

const props = defineProps({
  enableScroll: { type: Boolean, default: true },
  isLoading: { type: Boolean, default: false },
})
const emit = defineEmits(["loadMore"]);
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  const entry = entries[0];
  if (entry && entry.isIntersecting && !props.isLoading && props.enableScroll) {
    emit("loadMore");
  }
};

onMounted(() => {
  if (sentinel.value) {
    observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });
    observer.observe(sentinel.value);
    
    const rect = sentinel.value.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
    if (isVisible && !props.isLoading && props.enableScroll) {
      emit("loadMore");
    }
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

</script>


<style scoped lang="scss"></style>
