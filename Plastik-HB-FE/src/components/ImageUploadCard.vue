<template>
  <v-card
    :height="height"
    variant="outlined"
    class="d-flex align-center justify-center image-upload-card"
    @click="onClick"
    @dragover.prevent
    @drop="onDrop"
  >
    <div v-if="!image" class="text-center">
      <v-icon :size="iconSize" :color="iconColor" class="mb-1">{{
        placeholderIcon
      }}</v-icon>
      <p class="text-caption text-grey-darken-1">{{ placeholderText }}</p>
    </div>
    <div v-else class="banner-image-wrapper">
      <v-img :src="image" cover height="100%" class="rounded" />
    </div>
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      style="display: none"
      @change="onUpload"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  image: String,
  placeholderIcon: { type: String, default: "mdi-camera" },
  placeholderText: { type: String, default: "Upload Image" },
  height: { type: [String, Number], default: 150 },
  iconSize: { type: [String, Number], default: 32 },
  iconColor: { type: String, default: "grey-lighten-1" },
  accept: { type: String, default: "image/*" },
});
const emits = defineEmits(["upload", "clear", "drop"]);
const fileInputRef = ref<HTMLInputElement | null>(null);

function onClick() {
  fileInputRef.value?.click();
}
function onUpload(event: Event) {
  emits("upload", event);
}
function onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  emits("drop", event);
}
</script>

<style scoped>
.image-upload-card {
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}
.image-upload-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}
.banner-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.clear-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: white;
}
</style>
