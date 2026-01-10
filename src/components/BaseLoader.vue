<template>
  <div class="loader" :style="{ '--color': color, '--width': loaderSize }"></div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  color: { type: String, default: "var(--palette-primary)" },
  size: { type: [String, Number], default: "50px" },
});

const loaderSize = computed(() => {
  return typeof props.size === "number" ? `${props.size}px` : props.size;
});
</script>

<style scoped>
.loader {
  --color: var(--palette-primary);
  --width: 50px;
  width: var(--width);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(farthest-side, var(--color) 94%, #0000) top/calc(var(--width) * 0.16) calc(var(--width) * 0.16)
      no-repeat,
    conic-gradient(#0000 30%, var(--color));
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - calc(var(--width) * 0.16)), #000 0);
  animation: l13 1s infinite linear;
}
@keyframes l13 {
  100% {
    transform: rotate(1turn);
  }
}
</style>
