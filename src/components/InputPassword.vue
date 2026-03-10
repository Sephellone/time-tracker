<template>
  <base-input 
    :type="type" 
    :modelValue="modelValue"
    :name="name"
    :placeholder="placeholder"
    :label="label"
    :disabled="disabled"
    :required="required"
    :autocomplete="autocomplete"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #append>
      <icon-button @click="showPassword = !showPassword">
        <eye-off v-if="!showPassword" :size="16" />
        <eye v-else :size="16" />
      </icon-button>
    </template>
  </base-input>
</template>
<script setup lang="ts">
import BaseInput from "@/components/BaseInput.vue";
import IconButton from "@/components/IconButton.vue";
import { EyeOff, Eye } from "lucide-vue-next";
import { computed, ref } from "vue";

defineProps({
  modelValue: { type: String, default: "" },
  name: { type: String, required: true },
  placeholder: { type: String, default: "" },
  label: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
});

defineEmits(['update:modelValue']);

const showPassword = ref(false);

const type = computed(() => showPassword.value ? 'text' : 'password')
</script>

<style scoped lang="scss"></style>
