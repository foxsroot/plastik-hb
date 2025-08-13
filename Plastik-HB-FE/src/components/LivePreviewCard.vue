<template>
  <v-card variant="outlined">
    <v-card-title class="bg-grey text-white d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-eye</v-icon>
        Live Preview
      </div>
      <div class="d-flex gap-2">
        <v-btn @click="$emit('refresh')" icon="mdi-refresh" variant="text" size="small" color="white" title="Refresh preview" />
        <v-btn @click="$emit('open')" icon="mdi-open-in-new" variant="text" size="small" color="white" title="Open homepage in new tab" />
      </div>
    </v-card-title>
    <v-card-text class="pa-0">
      <div class="preview-container">
        <div :key="previewKey" class="preview-wrapper">
          <slot />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  previewKey: { type: [String, Number], required: true },
});
const emits = defineEmits(['refresh', 'open']);
</script>

<style scoped>
.preview-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ddd;
  background: #f5f5f5;
}
.preview-wrapper {
  transform: scale(0.75);
  transform-origin: top left;
  width: 133.33%;
  min-height: 100vh;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
@media (max-width: 1400px) {
  .preview-wrapper {
    transform: scale(0.65);
    width: 153.85%;
  }
}
@media (max-width: 1200px) {
  .preview-wrapper {
    transform: scale(0.55);
    width: 181.82%;
  }
}
@media (max-width: 992px) {
  .preview-wrapper {
    transform: scale(0.8);
    width: 125%;
  }
}
@media (max-width: 768px) {
  .preview-wrapper {
    transform: scale(1);
    width: 100%;
  }
}
</style>
