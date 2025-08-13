<template>
  <v-text-field
    v-model="modelValue"
    label="Cari produk..."
    placeholder="Masukkan nama produk"
    variant="outlined"
    density="compact"
    hide-details
    color="white"
    class="dark-search-input"
    prepend-inner-icon="mdi-magnify"
    clearable
    :error="modelValue.length > maxLength"
    :counter="maxLength"
    @input="onInput"
  >
    <template v-slot:append-inner>
      <v-fade-transition>
        <v-icon v-if="modelValue" color="white">mdi-filter-check</v-icon>
      </v-fade-transition>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
const props = defineProps<{ modelValue: string; maxLength?: number }>();
const emit = defineEmits(["update:modelValue"]);

const modelValue = ref(props.modelValue);
const maxLength = props.maxLength ?? 50;

watch(
  () => props.modelValue,
  (val) => (modelValue.value = val),
);

function onInput(e: Event) {
  const input = (e.target as HTMLInputElement).value;
  if (input.length > maxLength) {
    modelValue.value = input.slice(0, maxLength);
  } else {
    modelValue.value = input;
  }
  emit("update:modelValue", modelValue.value);
}
</script>
