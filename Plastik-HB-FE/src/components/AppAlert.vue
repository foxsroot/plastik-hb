<template>
  <v-alert
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    :type="type"
    :title="title"
    :text="text"
    closable
    class="mb-4 app-alert"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  modelValue: Boolean,
  type: { type: String as () => 'success' | 'info' | 'warning' | 'error', default: 'success' },
  title: String,
  text: String,
});
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.app-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}
</style>
