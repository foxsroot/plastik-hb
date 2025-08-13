<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 mr-4">History</h3>
      <v-btn
        @click="addHistory"
        icon="mdi-plus"
        variant="outlined"
        size="small"
        color="primary"
        class="icon-btn-square"
      />
    </div>
    <div v-for="(item, idx) in localHistory" :key="idx" class="mb-2">
      <v-text-field
        v-model="localHistory[idx]"
        :label="`History ${idx + 1}`"
        variant="outlined"
        density="compact"
        @input="emitChange"
      >
        <template #append-inner>
          <v-btn
            @click="removeHistory(idx)"
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="localHistory.length <= 1"
            class="delete-btn-inside"
          />
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits(['update:modelValue']);

const localHistory = ref([...props.modelValue]);

watch(() => props.modelValue, (val) => {
  localHistory.value = [...val];
});

function emitChange() {
  emit('update:modelValue', [...localHistory.value]);
}
function addHistory() {
  localHistory.value.push("");
  emitChange();
}
function removeHistory(idx: number) {
  if (localHistory.value.length > 1) {
    localHistory.value.splice(idx, 1);
    emitChange();
  }
}
</script>
