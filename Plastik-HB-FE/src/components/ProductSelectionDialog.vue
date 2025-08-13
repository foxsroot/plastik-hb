<template>
  <v-dialog :model-value="modelValue" @update:model-value="emits('update:modelValue', $event)" max-width="800px" scrollable>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon class="mr-2">mdi-package-variant</v-icon>
        Pilih Produk untuk Featured
      </v-card-title>
      <v-card-text class="pa-0">
        <v-container class="pa-4">
          <v-text-field
            v-model="search"
            label="Cari Produk"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            class="mb-4"
          />
          <v-row v-if="loading" class="justify-center">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-2">Memuat katalog produk...</p>
            </v-col>
          </v-row>
          <v-row v-else-if="filteredProducts.length === 0" class="justify-center">
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
              <p class="text-grey-darken-1 mt-2">Tidak ada produk yang tersedia untuk dipilih</p>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col v-for="product in filteredProducts" :key="product.id" cols="12" md="6">
              <v-card
                variant="outlined"
                class="mb-2 product-select-card"
                :class="{'v-card--selected': isSelected(product.id), 'cursor-pointer': true}"
                @click="toggleSelection(product.id)"
              >
                <v-row no-gutters align="center">
                  <v-col cols="4" class="d-flex align-center">
                    <v-img :src="product.assets[0]?.url || '/placeholder.jpg'" height="100" cover />
                  </v-col>
                  <v-col cols="8" class="position-relative">
                    <v-card-title class="text-subtitle-2">{{ product.name }}</v-card-title>
                    <v-card-text class="text-caption text-grey-darken-1">{{ product.description }}</v-card-text>
                    <v-icon
                      v-if="isSelected(product.id)"
                      color="primary"
                      size="28"
                      class="position-absolute"
                      style="top: 8px; right: 8px; z-index: 2; background: white; border-radius: 50%;"
                    >mdi-check-circle</v-icon>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn :disabled="localSelectedIds.length === 0" color="primary" variant="elevated" @click="addSelected">
          Tambahkan
        </v-btn>
        <v-btn @click="$emit('close')" variant="outlined">Batal</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from 'vue';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  specification: string;
  category_id: string;
  discount?: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  assets: Asset[];
  category: CategoryObj;
}

interface Asset {
  id: string;
  url: string;
  alt: string;
  type: "IMAGE" | "VIDEO";
  created_at: string;
  updated_at: string;
  product_id: string;
}

interface CategoryObj {
  id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{
  modelValue: boolean;
  loading: boolean;
  products: Product[];
  selectedIds: (number | string)[];
}>();

const emits = defineEmits(['update:modelValue', 'add', 'close', 'search', 'update:selectedIds']);
const search = ref('');
const localSelectedIds = ref<(string | number)[]>([]);

// Sync local selection with parent when dialog opens
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localSelectedIds.value = Array.isArray(props.selectedIds) ? [...props.selectedIds] : [];
    }
  },
  { immediate: true }
);

const filteredProducts = computed<Product[]>(() => {
  if (!search.value) return props.products;
  return props.products.filter((product) =>
    product.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.value.toLowerCase()))
  );
});
watch(search, val => emits('search', val));

function isSelected(id: string | number) {
  return localSelectedIds.value.includes(id);
}

function toggleSelection(id: string | number) {
  const idx = localSelectedIds.value.indexOf(id);
  if (idx === -1) {
    localSelectedIds.value.push(id);
  } else {
    localSelectedIds.value.splice(idx, 1);
  }
  emits('update:selectedIds', [...localSelectedIds.value]);
}

function addSelected() {
  emits('add');
}
</script>

<style scoped>
.product-select-card.v-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.15) !important;
}
</style>
