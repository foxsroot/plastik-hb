<template>
  <v-card class="pa-3 elevation-2 rounded-lg filter-sidebar" color="white">
    <!-- Header with Filter Count Badge -->
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <v-icon size="18" class="mr-2" color="grey-darken-2">mdi-filter</v-icon>
        <span class="text-subtitle-2 font-weight-medium text-grey-darken-2"
          >Filter Produk</span
        >
      </div>
      <v-badge
        v-if="totalActiveFilters > 0"
        :content="totalActiveFilters"
        color="primary"
        inline
      >
        <v-icon size="16" color="primary">mdi-filter-check</v-icon>
      </v-badge>
    </div>

    <!-- Active Filters Summary -->
    <div class="active-filters-section mb-3">
      <!-- Category Filters -->
      <div class="filter-group">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption text-grey-darken-1 font-weight-medium">
            <v-icon size="10" class="mr-1">mdi-tag-multiple</v-icon>
            Kategori
            {{
              selectedCategories.length > 0
                ? `(${selectedCategories.length})`
                : ""
            }}
          </span>
          <v-btn
            v-if="selectedCategories.length > 0"
            size="x-small"
            color="grey"
            variant="text"
            icon="mdi-close"
            @click="emit('clearCategoryFilter')"
          />
        </div>
        <div
          class="filter-chips-container category-chips"
          :class="{ 'empty-state': selectedCategories.length === 0 }"
        >
          <template v-if="selectedCategories.length > 0">
            <v-chip
              v-for="categoryId in selectedCategories"
              :key="categoryId"
              size="small"
              color="primary"
              variant="flat"
              closable
              class="elegant-active-chip"
              @click:close="emit('removeCategoryFilter', categoryId)"
            >
              <v-icon start size="12">mdi-tag</v-icon>
              {{ getCategoryName(categoryId) }}
            </v-chip>
          </template>
          <span
            v-else
            class="empty-placeholder text-caption text-grey-lighten-1"
          >
            Tidak ada kategori dipilih
          </span>
        </div>
      </div>

      <!-- Price Filter -->
      <div class="filter-group">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption text-grey-darken-1 font-weight-medium">
            <v-icon size="10" class="mr-1">mdi-currency-usd</v-icon>
            Harga
          </span>
          <v-btn
            v-if="priceFilterActive"
            size="x-small"
            color="grey"
            variant="text"
            icon="mdi-close"
            @click="emit('clearPriceFilter')"
          />
        </div>
        <div
          class="filter-chips-container"
          :class="{ 'empty-state': !priceFilterActive }"
        >
          <v-chip
            v-if="priceFilterActive"
            size="small"
            color="orange"
            variant="flat"
            class="elegant-active-chip"
          >
            <v-icon start size="12">mdi-currency-usd</v-icon>
            {{ formatPriceShort(priceMin) }} - {{ formatPriceShort(priceMax) }}
          </v-chip>
          <span
            v-else
            class="empty-placeholder text-caption text-grey-lighten-1"
          >
            Rentang harga default
          </span>
        </div>
      </div>

      <!-- Reset Filter Button -->
      <v-btn
        size="small"
        color="error"
        variant="outlined"
        block
        class="mt-2 elegant-clear-btn"
        :disabled="!hasActiveFilters"
        @click="emit('clearAllFilters')"
      >
        <v-icon start size="14">mdi-filter-off</v-icon>
        Reset {{ hasActiveFilters ? totalActiveFilters : "" }} Filter{{
          totalActiveFilters > 1 ? "s" : ""
        }}
      </v-btn>
      <v-divider class="my-2" color="#e0e0e0" />
    </div>

    <!-- Sort Options -->
    <div class="filter-section mb-3">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <v-icon size="16" class="mr-2" color="grey-darken-2">mdi-sort</v-icon>
          <span class="text-caption font-weight-medium text-grey-darken-2"
            >Urutkan</span
          >
        </div>
        <v-icon v-if="sortBy.includes('desc')" size="14" color="orange"
          >mdi-sort-descending</v-icon
        >
        <v-icon v-else size="14" color="primary">mdi-sort-ascending</v-icon>
      </div>
      <v-select
        v-model="localSortBy"
        :items="sortOptions"
        variant="outlined"
        density="compact"
        hide-details
        color="primary"
        class="elegant-dropdown"
        @update:model-value="onSortChange"
      >
        <template v-slot:selection="{ item }">
          <div class="d-flex align-center">
            <v-icon
              size="12"
              class="mr-1"
              :color="getSortIcon(item.value).color"
            >
              {{ getSortIcon(item.value).icon }}
            </v-icon>
            <span class="text-caption">{{ item.title }}</span>
          </div>
        </template>
        <template v-slot:item="{ item, props }">
          <v-list-item v-bind="props" class="sort-item">
            <template v-slot:prepend>
              <v-icon size="14" :color="getSortIcon(item.value).color">
                {{ getSortIcon(item.value).icon }}
              </v-icon>
            </template>
            <v-list-item-title class="text-caption">{{
              item.title
            }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-select>
    </div>
    <v-divider class="my-1" color="#e0e0e0" />

    <!-- Category Filter with Dropdown -->
    <div class="filter-section mb-2">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <v-icon size="16" class="mr-2" color="grey-darken-2"
            >mdi-tag-multiple</v-icon
          >
          <span class="text-caption font-weight-medium text-grey-darken-2"
            >Kategori</span
          >
        </div>
        <v-chip
          v-if="selectedCategories.length > 0"
          size="x-small"
          color="primary"
          variant="flat"
        >
          {{ selectedCategories.length }}
        </v-chip>
      </div>
      <v-menu :close-on-content-click="false" offset-y max-height="200">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
            color="grey-darken-1"
            size="small"
            block
            class="text-caption elegant-dropdown"
            append-icon="mdi-chevron-down"
          >
            <template v-if="selectedCategories.length === 0">
              Pilih Kategori
            </template>
            <template v-else-if="selectedCategories.length === 1">
              {{ getCategoryName(selectedCategories[0]) }}
            </template>
            <template v-else>
              {{ selectedCategories.length }} kategori dipilih
            </template>
          </v-btn>
        </template>
        <v-card class="pa-2" max-width="220">
          <div class="d-flex gap-1 mb-2">
            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              @click="emit('selectAllCategories')"
              class="text-caption"
            >
              Pilih Semua
            </v-btn>
            <v-btn
              size="x-small"
              variant="text"
              color="error"
              @click="emit('clearCategoryFilter')"
              class="text-caption"
            >
              Hapus Semua
            </v-btn>
          </div>
          <v-divider class="mb-1" />
          <div v-if="categories.length > 0" class="categories-dropdown">
            <v-checkbox
              v-for="category in categories"
              :key="category.id"
              :model-value="selectedCategories.includes(category.id)"
              :value="category.id"
              hide-details
              density="compact"
              color="primary"
              class="elegant-checkbox"
              @change="onCategoryChange(category.id)"
            >
              <template v-slot:label>
                <div class="d-flex align-center justify-space-between w-100">
                  <span class="text-caption text-grey-darken-2">{{
                    category.category
                  }}</span>
                  <v-chip
                    v-if="getCategoryProductCount(category.id) > 0"
                    size="x-small"
                    color="grey-lighten-1"
                    variant="flat"
                    class="ml-1"
                  >
                    {{ getCategoryProductCount(category.id) }}
                  </v-chip>
                </div>
              </template>
            </v-checkbox>
          </div>
          <div v-else class="text-caption text-grey-darken-1 pa-2 text-center">
            <v-progress-circular
              size="14"
              indeterminate
              class="mr-1"
            ></v-progress-circular>
            Loading...
          </div>
        </v-card>
      </v-menu>
    </div>
    <v-divider class="my-1" color="#e0e0e0" />

    <!-- Price Filter -->
    <div class="filter-section-last">
      <div class="d-flex align-center mb-1">
        <v-icon size="16" class="mr-2" color="grey-darken-2"
          >mdi-currency-usd</v-icon
        >
        <span class="text-caption font-weight-medium text-grey-darken-2"
          >Rentang Harga</span
        >
      </div>
      <v-row dense no-gutters class="mb-1">
        <v-col cols="5" class="pr-1">
          <v-text-field
            :model-value="formatPriceInput(priceMin)"
            label="Min"
            placeholder="0"
            type="text"
            variant="outlined"
            density="compact"
            color="primary"
            class="elegant-dropdown price-input-compact"
            hide-details
            @keydown="validateNumberInput"
            @input="onPriceInput($event, false)"
          >
            <template v-slot:prepend-inner>
              <span style="font-size: 7px; color: #616161; font-weight: 600"
                >Rp</span
              >
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="2" class="d-flex align-center justify-center">
          <v-icon size="12" color="grey-darken-1">mdi-minus</v-icon>
        </v-col>
        <v-col cols="5" class="pl-1">
          <v-text-field
            :model-value="formatPriceInput(priceMax)"
            label="Max"
            placeholder="1M"
            type="text"
            variant="outlined"
            density="compact"
            color="primary"
            class="elegant-dropdown price-input-compact"
            hide-details
            @keydown="validateNumberInput"
            @input="onPriceInput($event, true)"
          >
            <template v-slot:prepend-inner>
              <span style="font-size: 7px; color: #616161; font-weight: 600"
                >Rp</span
              >
            </template>
          </v-text-field>
        </v-col>
      </v-row>
      <div class="d-flex flex-wrap gap-1 mb-0">
        <v-chip
          size="x-small"
          :variant="isQuickPriceActive(0, 50000) ? 'flat' : 'outlined'"
          :color="isQuickPriceActive(0, 50000) ? 'primary' : 'grey-darken-1'"
          @click="emit('setQuickPrice', 0, 50000)"
          class="elegant-chip quick-price-chip"
        >
          <50rb
        </v-chip>
        <v-chip
          size="x-small"
          :variant="isQuickPriceActive(50000, 100000) ? 'flat' : 'outlined'"
          :color="
            isQuickPriceActive(50000, 100000) ? 'primary' : 'grey-darken-1'
          "
          @click="emit('setQuickPrice', 50000, 100000)"
          class="elegant-chip quick-price-chip"
        >
          50-100rb
        </v-chip>
        <v-chip
          size="x-small"
          :variant="isQuickPriceActive(100000, 500000) ? 'flat' : 'outlined'"
          :color="
            isQuickPriceActive(100000, 500000) ? 'primary' : 'grey-darken-1'
          "
          @click="emit('setQuickPrice', 100000, 500000)"
          class="elegant-chip quick-price-chip"
        >
          100-500rb
        </v-chip>
        <v-chip
          size="x-small"
          :variant="isQuickPriceActive(500000, 10000000) ? 'flat' : 'outlined'"
          :color="
            isQuickPriceActive(500000, 10000000) ? 'primary' : 'grey-darken-1'
          "
          @click="emit('setQuickPrice', 500000, 10000000)"
          class="elegant-chip quick-price-chip"
        >
          >500rb
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";

const props = defineProps<{
  categories: any[];
  selectedCategories: string[];
  priceMin: number;
  priceMax: number;
  priceFilterActive: boolean;
  sortBy: string;
  sortOptions: any[];
  hasActiveFilters: boolean;
  totalActiveFilters: number;
}>();

const emit = defineEmits([
  "update:selectedCategories",
  "update:priceMin",
  "update:priceMax",
  "update:sortBy",
  "clearAllFilters",
  "clearCategoryFilter",
  "clearPriceFilter",
  "selectAllCategories",
  "removeCategoryFilter",
  "setQuickPrice",
]);

const localSortBy = ref(props.sortBy);

function onSortChange(value: string) {
  emit("update:sortBy", value);
}

function onCategoryChange(categoryId: string) {
  let updated = [...props.selectedCategories];
  if (updated.includes(categoryId)) {
    updated = updated.filter((id) => id !== categoryId);
  } else {
    updated.push(categoryId);
  }
  emit("update:selectedCategories", updated);
}

function onPriceInput(event: Event, isMaxPrice: boolean = false) {
  const input = (event.target as HTMLInputElement).value.replace(/[^\d]/g, "");
  const value = parseInt(input) || 0;
  if (isMaxPrice) {
    emit("update:priceMax", value);
  } else {
    emit("update:priceMin", value);
  }
}

function validateNumberInput(event: KeyboardEvent): boolean {
  const char = event.key;
  if (
    event.ctrlKey ||
    event.metaKey ||
    [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(char)
  ) {
    return true;
  }
  if (!/^[0-9]$/.test(char)) {
    event.preventDefault();
    return false;
  }
  return true;
}

function isQuickPriceActive(min: number, max: number): boolean {
  return (
    props.priceMin === min && props.priceMax === max && props.priceFilterActive
  );
}

function formatPriceShort(price: number): string {
  if (price >= 1000000000) {
    const milyar = price / 1000000000;
    return milyar % 1 === 0 ? `${milyar.toFixed(0)}M` : `${milyar.toFixed(1)}M`;
  } else if (price >= 1000000) {
    const juta = price / 1000000;
    return juta % 1 === 0
      ? `${juta.toFixed(0)} juta`
      : `${juta.toFixed(1)} juta`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ribu`;
  } else {
    return new Intl.NumberFormat("id-ID").format(price);
  }
}

function formatPriceInput(value: number): string {
  if (value < 0) return "0";
  if (value === 0) return "0";
  return value.toLocaleString("id-ID");
}

function getCategoryName(categoryId: string): string {
  const category = props.categories.find((cat) => cat.id === categoryId);
  return category?.category || "Unknown Category";
}

function getCategoryProductCount(categoryId: string): number {
  // You may need to pass product count as a prop for full decoupling
  return 0;
}

function getSortIcon(sortValue: string) {
  switch (sortValue) {
    case "name":
      return { icon: "mdi-sort-alphabetical-ascending", color: "primary" };
    case "name_desc":
      return { icon: "mdi-sort-alphabetical-descending", color: "primary" };
    case "price_asc":
      return { icon: "mdi-sort-numeric-ascending", color: "success" };
    case "price_desc":
      return { icon: "mdi-sort-numeric-descending", color: "success" };
    case "newest":
      return { icon: "mdi-clock-outline", color: "orange" };
    default:
      return { icon: "mdi-sort", color: "grey" };
  }
}
</script>

<style scoped>
.filter-sidebar {
  position: sticky;
  top: 80px;
  align-self: flex-start;
}
</style>
