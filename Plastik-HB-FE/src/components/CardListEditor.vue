<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mr-4">{{ title }}</h3>
      <v-btn @click="$emit('add')" icon="mdi-plus" variant="outlined" size="small" color="primary"
        class="icon-btn-square" />
    </div>
    <div :class="listClass" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
      <div v-for="(item, index) in items" :key="itemKey(item, index)" class="mb-3">
        <v-card :class="[
          cardClass,
          'd-flex',
          'align-center',
          'pa-2',
          localDragOverIndex === index ? cardClass + '--dragover' : ''
        ]" variant="outlined" draggable="true" @dragstart="$emit('dragstart', index)"
          @dragover.prevent="onDragOver(index)" @drop.prevent="onDrop(index)" @dragend="onDragEnd"
          :style="'transition: background 0.2s, border 0.2s;'">
          <v-btn icon="mdi-drag" variant="text" size="small" class="mr-2 drag-btn"
            style="cursor: grab; color: var(--v-theme-on-surface, #888);" />
          <slot name="avatar" :item="item" :index="index" />
          <div class="flex-grow-1">
            <slot name="content" :item="item" :index="index" />
          </div>
          <v-menu :model-value="menuOpenIndex === index"
            @update:model-value="val => $emit('update:menuOpenIndex', val ? index : null)"
            :close-on-content-click="false" location="bottom right">
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"
                @click.stop="$emit('openMenu', index)" class="menu-btn" />
            </template>
            <v-list>
              <v-list-item @click="$emit('edit', index)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('delete', index)">
                <v-list-item-title class="text-error">Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits } from 'vue';
const props = defineProps({
  title: String,
  items: { type: Array, required: true },
  menuOpenIndex: Number,
  listClass: { type: String, default: '' },
  cardClass: { type: String, default: '' },
  itemKey: { type: Function, default: (item: any, index: number) => index },
});
const emit = defineEmits(['dragstart', 'dragover', 'drop', 'dragend', 'add', 'edit', 'delete', 'openMenu', 'update:menuOpenIndex']);
const localDragOverIndex = ref<number | null>(null);
function onDragOver(index: number) {
  localDragOverIndex.value = index;
}
function onDrop(index: number) {
  emit('drop', index);
  localDragOverIndex.value = null;
}
function onDragEnd() {
  emit('dragend');
  localDragOverIndex.value = null;
}
</script>

<style scoped>
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.pa-2 {
  padding: 8px !important;
}

.mr-2 {
  margin-right: 8px !important;
}

.flex-grow-1 {
  flex-grow: 1;
}

.mb-3 {
  margin-bottom: 16px !important;
}

.menu-btn {
  margin-left: auto;
}

.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}
</style>
