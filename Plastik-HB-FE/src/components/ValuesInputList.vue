<template>
  <div>
    <div v-for="(value, idx) in localValues" :key="idx" class="mb-2">
      <v-text-field
        v-model="localValues[idx]"
        :label="`Value ${idx + 1}`"
        variant="outlined"
        density="compact"
        :maxlength="100"
        :counter="100"
        required
        @input="emitChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue';
const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits(['update:modelValue']);

const localValues = ref([...props.modelValue]);

watch(() => props.modelValue, (val) => {
  localValues.value = [...val];
});

function emitChange() {
  emit('update:modelValue', [...localValues.value]);
}
</script>
