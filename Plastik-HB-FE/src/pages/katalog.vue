<template>
  <Loading v-if="showLoading" />
  <v-container v-else fluid class="pa-4 dark-bg">
    <v-row>
      <!-- Filter Sidebar -->
      <v-col cols="12" md="3" lg="2" class="mb-4 mb-md-0">
        <v-card
          class="pa-3 elevation-2 rounded-lg filter-sidebar"
          color="white"
        >
          <!-- Header with Filter Count Badge -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon size="18" class="mr-2" color="grey-darken-2"
                >mdi-filter</v-icon
              >
              <span
                class="text-subtitle-2 font-weight-medium text-grey-darken-2"
                >Filter Produk</span
              >
            </div>
            <!-- Total Active Filters Badge -->
            <v-badge
              v-if="totalActiveFilters > 0"
              :content="totalActiveFilters"
              color="primary"
              inline
            >
              <v-icon size="16" color="primary">mdi-filter-check</v-icon>
            </v-badge>
          </div>

          <!-- Active Filters Summary - Always Present -->
          <div class="active-filters-section mb-3">
            <!-- Category Filters -->
            <div class="filter-group">
              <div class="d-flex align-center justify-space-between mb-1">
                <span
                  class="text-caption text-grey-darken-1 font-weight-medium"
                >
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
                  @click="clearCategoryFilter"
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
                    @click:close="removeCategoryFilter(categoryId)"
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
                <span
                  class="text-caption text-grey-darken-1 font-weight-medium"
                >
                  <v-icon size="10" class="mr-1">mdi-currency-usd</v-icon>
                  Harga
                </span>
                <v-btn
                  v-if="priceFilterActive"
                  size="x-small"
                  color="grey"
                  variant="text"
                  icon="mdi-close"
                  @click="clearPriceFilter"
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
                  {{ formatPriceShort(priceMin) }} -
                  {{ formatPriceShort(priceMax) }}
                </v-chip>
                <span
                  v-else
                  class="empty-placeholder text-caption text-grey-lighten-1"
                >
                  Rentang harga default
                </span>
              </div>
            </div>

            <!-- Reset Filter Button - Always Present -->
            <v-btn
              size="small"
              color="error"
              variant="outlined"
              block
              class="mt-2 elegant-clear-btn"
              :disabled="!hasActiveFilters"
              @click="clearAllFilters"
            >
              <v-icon start size="14">mdi-filter-off</v-icon>
              Reset {{ hasActiveFilters ? totalActiveFilters : "" }} Filter{{
                totalActiveFilters > 1 ? "s" : ""
              }}
            </v-btn>

            <v-divider class="my-2" color="#e0e0e0" />
          </div>

          <!-- Sort Options with Enhanced UX -->
          <div class="filter-section mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon size="16" class="mr-2" color="grey-darken-2"
                  >mdi-sort</v-icon
                >
                <span class="text-caption font-weight-medium text-grey-darken-2"
                  >Urutkan</span
                >
              </div>
              <!-- Sort Direction Indicator -->
              <v-icon v-if="sortBy.includes('desc')" size="14" color="orange"
                >mdi-sort-descending</v-icon
              >
              <v-icon v-else size="14" color="primary"
                >mdi-sort-ascending</v-icon
              >
            </div>

            <!-- Enhanced Sort Dropdown -->
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              hide-details
              color="primary"
              class="elegant-dropdown"
              @update:model-value="applyFilters"
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

            <!-- Category Dropdown with Checkboxes -->
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
                <!-- Quick Actions -->
                <div class="d-flex gap-1 mb-2">
                  <v-btn
                    size="x-small"
                    variant="text"
                    color="primary"
                    @click="selectAllCategories"
                    class="text-caption"
                  >
                    Pilih Semua
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="clearCategoryFilter"
                    class="text-caption"
                  >
                    Hapus Semua
                  </v-btn>
                </div>

                <v-divider class="mb-1" />

                <!-- Category Checkboxes -->
                <div v-if="categories.length > 0" class="categories-dropdown">
                  <v-checkbox
                    v-for="category in categories"
                    :key="category.id"
                    v-model="selectedCategories"
                    :value="category.id"
                    hide-details
                    density="compact"
                    color="primary"
                    class="elegant-checkbox"
                    @change="applyFilters"
                  >
                    <template v-slot:label>
                      <div
                        class="d-flex align-center justify-space-between w-100"
                      >
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

                <div
                  v-else
                  class="text-caption text-grey-darken-1 pa-2 text-center"
                >
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

          <!-- Price Filter - Simple Side by Side -->
          <div class="filter-section-last">
            <div class="d-flex align-center mb-1">
              <v-icon size="16" class="mr-2" color="grey-darken-2"
                >mdi-currency-usd</v-icon
              >
              <span class="text-caption font-weight-medium text-grey-darken-2"
                >Rentang Harga</span
              >
            </div>

            <!-- Price Inputs Side by Side -->
            <v-row dense no-gutters class="mb-1">
              <v-col cols="5" class="pr-1">
                <v-text-field
                  v-model="displayPriceMin"
                  label="Min"
                  placeholder="0"
                  type="text"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  class="elegant-dropdown price-input-compact"
                  hide-details
                  @keydown="validateNumberInput"
                  @input="(e: Event) => onPriceInput(e, false)"
                >
                  <template v-slot:prepend-inner>
                    <span
                      style="font-size: 7px; color: #616161; font-weight: 600"
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
                  v-model="displayPriceMax"
                  label="Max"
                  placeholder="1M"
                  type="text"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  class="elegant-dropdown price-input-compact"
                  hide-details
                  @keydown="validateNumberInput"
                  @input="(e: Event) => onPriceInput(e, true)"
                >
                  <template v-slot:prepend-inner>
                    <span
                      style="font-size: 7px; color: #616161; font-weight: 600"
                      >Rp</span
                    >
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <!-- Quick Price Chips -->
            <div class="d-flex flex-wrap gap-1 mb-0">
              <v-chip
                size="x-small"
                :variant="isQuickPriceActive(0, 50000) ? 'flat' : 'outlined'"
                :color="
                  isQuickPriceActive(0, 50000) ? 'primary' : 'grey-darken-1'
                "
                @click="setQuickPrice(0, 50000)"
                class="elegant-chip quick-price-chip"
              >
                <50rb
              </v-chip>
              <v-chip
                size="x-small"
                :variant="
                  isQuickPriceActive(50000, 100000) ? 'flat' : 'outlined'
                "
                :color="
                  isQuickPriceActive(50000, 100000)
                    ? 'primary'
                    : 'grey-darken-1'
                "
                @click="setQuickPrice(50000, 100000)"
                class="elegant-chip quick-price-chip"
              >
                50-100rb
              </v-chip>
              <v-chip
                size="x-small"
                :variant="
                  isQuickPriceActive(100000, 500000) ? 'flat' : 'outlined'
                "
                :color="
                  isQuickPriceActive(100000, 500000)
                    ? 'primary'
                    : 'grey-darken-1'
                "
                @click="setQuickPrice(100000, 500000)"
                class="elegant-chip quick-price-chip"
              >
                100-500rb
              </v-chip>
              <v-chip
                size="x-small"
                :variant="
                  isQuickPriceActive(500000, 10000000) ? 'flat' : 'outlined'
                "
                :color="
                  isQuickPriceActive(500000, 10000000)
                    ? 'primary'
                    : 'grey-darken-1'
                "
                @click="setQuickPrice(500000, 10000000)"
                class="elegant-chip quick-price-chip"
              >
                >500rb
              </v-chip>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Product List -->
      <v-col cols="12" md="9" lg="10">
        <!-- Header with Product Count and Search in Same Row -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h2 class="text-h5 text-white font-weight-bold">Katalog Produk</h2>
            <div class="text-grey-lighten-2 mt-1">
              <template v-if="totalPages > 1">
                Halaman {{ currentPage }}: {{ products.length }} produk
                <span class="text-caption">
                  ({{ filteredProducts.length }} hasil{{
                    hasActiveFilters ? " dengan filter" : ""
                  }})
                </span>
              </template>
              <template v-else>
                {{ filteredProducts.length }} produk ditemukan
                <span v-if="hasActiveFilters" class="text-caption">
                  (dengan filter yang dipilih)
                </span>
              </template>
            </div>
          </div>

          <!-- Search Box - Right Side with Mobile Toggle -->
          <div class="d-flex align-center gap-2">
            <!-- Search Box -->
            <v-card
              class="pa-2 elevation-2 rounded-lg search-card"
              color="#2c2c2c"
              style="width: 300px"
            >
              <v-text-field
                v-model="searchQuery"
                label="Cari produk..."
                placeholder="Masukkan nama produk"
                variant="outlined"
                density="compact"
                hide-details
                color="white"
                class="dark-search-input"
                prepend-inner-icon="mdi-magnify"
                clearable
              >
                <template v-slot:append-inner>
                  <v-fade-transition>
                    <v-icon v-if="searchQuery" color="white"
                      >mdi-filter-check</v-icon
                    >
                  </v-fade-transition>
                </template>
              </v-text-field>
            </v-card>

            <!-- Mobile Filter Toggle -->
            <v-btn
              v-if="$vuetify.display.mobile"
              icon="mdi-filter-variant"
              variant="outlined"
              @click="toggleMobileFilter"
            />
          </div>
        </div>

        <v-row>
          <v-col
            v-for="product in products"
            :key="product.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="pa-2 elevation-1 rounded-lg product-card transition-card dark-product-card"
              outlined
              dark
            >
              <v-img
                :src="getMainImageUrl(product)"
                height="150"
                cover
                class="rounded mb-2"
                style="background: #222"
                :alt="product.name"
                @error="() => handleImageError(product)"
              >
                <!-- Loading placeholder -->
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                      color="grey-lighten-4"
                      indeterminate
                      size="24"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
              <v-card-title
                class="text-subtitle-1 font-weight-medium mb-1 text-white"
              >
                {{ product.name }}
              </v-card-title>
              <v-card-subtitle class="text-grey-lighten-2 mb-1">
                {{ product.category?.category || "Kategori tidak tersedia" }}
              </v-card-subtitle>
              <v-card-subtitle class="text-primary font-weight-bold mb-2">
                <span v-if="product.discount > 0">
                  {{
                    formatPrice(
                      calculateDiscountedPrice(product.price, product.discount)
                    )
                  }}
                  <span class="text-red text-decoration-line-through ml-2">
                    {{ formatPrice(product.price) }}
                  </span>
                  <v-chip
                    size="x-small"
                    color="error"
                    variant="flat"
                    class="ml-2"
                  >
                    -{{ product.discount }}%
                  </v-chip>
                </span>
                <span v-else>
                  {{ formatPrice(product.price) }}
                </span>
              </v-card-subtitle>
              <v-card-actions>
                <v-btn
                  :to="{ path: '/detail-produk', query: { id: product.id } }"
                  color="primary"
                  variant="elevated"
                  size="small"
                  block
                  class="text-capitalize"
                >
                  Detail Produk
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination Component -->
        <div v-if="totalPages > 1" class="pagination-container mt-6 mb-4">
          <div class="d-flex align-center justify-center">
            <!-- Previous Button -->
            <v-btn
              :disabled="currentPage === 1"
              icon
              variant="text"
              color="white"
              class="pagination-arrow"
              @click="prevPage"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <!-- Page Dots -->
            <div class="pagination-dots mx-4">
              <div class="d-flex align-center gap-2">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  :class="[
                    'pagination-dot',
                    { 'pagination-dot-active': page === currentPage },
                  ]"
                  @click="goToPage(page)"
                >
                  <span class="pagination-dot-number">{{ page }}</span>
                </button>
              </div>
            </div>

            <!-- Next Button -->
            <v-btn
              :disabled="currentPage === totalPages"
              icon
              variant="text"
              color="white"
              class="pagination-arrow"
              @click="nextPage"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- Page Info -->
          <div class="text-center mt-3">
            <span class="text-grey-lighten-2 text-caption">
              Halaman {{ currentPage }} dari {{ totalPages }} ({{
                filteredProducts.length
              }}
              produk dari {{ allProducts.length }} total)
            </span>
          </div>
        </div>

        <!-- No Products Found -->
        <v-row v-if="!loading && filteredProducts.length === 0">
          <v-col cols="12" class="text-center">
            <v-icon size="80" color="grey">mdi-package-variant</v-icon>
            <div class="text-h6 text-grey mt-4">Tidak ada produk ditemukan</div>
            <div class="text-body-2 text-grey">
              <span v-if="hasActiveFilters">
                Coba ubah atau hapus filter pencarian Anda
              </span>
              <span v-else> Belum ada produk yang tersedia </span>
            </div>
            <!-- Show active filters when no results -->
            <div v-if="hasActiveFilters" class="mt-3">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="clearAllFilters"
              >
                <v-icon start>mdi-filter-off</v-icon>
                Reset Semua Filter
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Loading Spinner -->
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="50" />
            <div class="text-grey mt-2">Memuat produk...</div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import axiosInstance from "@/utils/axiosInstance";
import Loading from "@/components/Loading.vue";
import {
  getImageUrl,
  formatPrice,
  calculateDiscountedPrice,
} from "@/utils/formatters";

// Alt image fallback - sama seperti di katalog-produk
const ALT_IMAGE_FILENAME = "Alt-Image-Produk.png";

// Computed untuk mendapatkan alt image URL
const altImageUrl = computed(() => {
  const url = getImageUrl(ALT_IMAGE_FILENAME);
  console.log("Alt image URL computed:", url);
  return url;
});

// Reactive state untuk tracking failed images
const failedImages = ref(new Set<string>());

// Helper untuk get image URL atau fallback ke alt - sama seperti katalog-produk
const getImageOrAlt = (imageFilename: string | null | undefined): string => {
  if (
    !imageFilename ||
    imageFilename === "" ||
    imageFilename === "/placeholder.jpg"
  ) {
    console.log("Using alt image for:", imageFilename);
    return altImageUrl.value;
  }

  // Jika data URL (base64 dari file upload), return as is
  if (imageFilename.startsWith("data:")) {
    console.log("Using data URL:", imageFilename.substring(0, 50) + "...");
    return imageFilename;
  }

  // Jika sudah URL lengkap, return as is
  if (imageFilename.startsWith("http")) {
    return imageFilename;
  }

  // Convert ke URL lengkap
  const fullUrl = getImageUrl(imageFilename);
  console.log("Generated URL:", fullUrl, "from:", imageFilename);
  return fullUrl;
};

// Helper untuk cek apakah image sudah failed
const shouldUseAltImage = (
  imageFilename: string | null | undefined
): boolean => {
  if (
    !imageFilename ||
    imageFilename === "" ||
    imageFilename === "/placeholder.jpg"
  )
    return true;

  // Jika data URL (base64 dari file upload), jangan gunakan alt image
  if (imageFilename.startsWith("data:")) return false;

  // Generate proper URL untuk cek di failedImages
  const fullUrl = imageFilename.startsWith("http")
    ? imageFilename
    : getImageUrl(imageFilename);
  return failedImages.value.has(fullUrl);
};

// Mark image as failed
const markImageAsFailed = (imageUrl: string) => {
  console.log("Marking image as failed:", imageUrl);
  failedImages.value.add(imageUrl);
};

// Helper functions for price input formatting
const formatPriceInput = (value: number): string => {
  if (value < 0) return "0";
  if (value === 0) return "0";
  return value.toLocaleString("id-ID");
};

const parsePriceInput = (value: string): number => {
  if (!value || value.trim() === "") return 0;
  // Remove all non-numeric characters (dots, commas, etc.)
  const numericValue = value.replace(/[^\d]/g, "");
  return parseInt(numericValue) || 0;
};

// Real-time validation functions
const validateNumberInput = (event: KeyboardEvent): boolean => {
  const char = event.key;
  const input = event.target as HTMLInputElement;

  // Allow control keys (backspace, delete, arrow keys, etc.)
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

  // Only allow numeric characters (0-9)
  if (!/^[0-9]$/.test(char)) {
    event.preventDefault();
    return false;
  }

  // Check if adding this digit would exceed 9 digits
  const currentValue = input.value || "";
  const numericValue = currentValue.replace(/[^\d]/g, "");

  if (numericValue.length >= 10) {
    event.preventDefault();
    return false;
  }

  return true;
};

const validateMaxDigits = (value: string, maxDigits: number = 12): boolean => {
  const numericValue = value.replace(/[^\d]/g, "");
  return numericValue.length <= maxDigits;
};

const onPriceInput = (event: Event, isMaxPrice: boolean = false) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Simply enforce max digits by truncating if somehow exceeded
  const numericValue = value.replace(/[^\d]/g, "");
  if (numericValue.length > 12) {
    const truncated = numericValue.substring(0, 12);
    input.value = parseInt(truncated).toLocaleString("id-ID");
  }
};

// Reactive state
const showLoading = ref(true);
const categories = ref<any[]>([]);
const loading = ref(false);
const selectedCategories = ref<string[]>([]);
const priceMin = ref<number>(0);
const priceMax = ref<number>(10000000);
const priceFilterActive = ref<boolean>(false); // Track if price filter is manually set
// showFeaturedOnly removed - no longer needed
const sortBy = ref("name");
const showMobileFilter = ref(false);
const searchQuery = ref(""); // Add search functionality

// Error handling for price inputs
const priceMinError = ref<string>("");
const priceMaxError = ref<string>("");

// All products from API (before client-side filtering)
const allProducts = ref<any[]>([]);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(12); // Batas produk per halaman

// Sort options
const sortOptions = [
  { title: "Nama A-Z", value: "name" },
  { title: "Nama Z-A", value: "name_desc" },
  { title: "Harga Terendah", value: "price_asc" },
  { title: "Harga Tertinggi", value: "price_desc" },
  { title: "Terbaru", value: "newest" },
];

// API functions
const fetchCatalogProducts = async () => {
  try {
    loading.value = true;

    const params: any = {};

    // Apply backend filters
    // Price filter akan dilakukan di client-side untuk menggunakan harga setelah discount
    // if (priceMin.value > 0) params.priceMin = priceMin.value;
    // if (priceMax.value < 10000000) params.priceMax = priceMax.value;
    // Featured filter removed - no longer needed

    // 🎯 NEW: Backend category filtering (more efficient!)
    if (selectedCategories.value.length === 1) {
      // Single category - use backend filter
      params.categoryId = selectedCategories.value[0];
    }

    const response = await axiosInstance.get("/products/catalog", { params });

    let fetchedProducts = response.data.data || [];

    // 🎯 IMPROVED: Client-side category filtering only for multiple categories
    if (selectedCategories.value.length > 1) {
      // Multiple categories - use client-side filtering for OR condition
      fetchedProducts = fetchedProducts.filter((product: any) =>
        selectedCategories.value.includes(product.category_id)
      );
    }

    // Store all products for client-side filtering
    allProducts.value = fetchedProducts;

    console.log(
      `Fetched ${fetchedProducts.length} products with backend filters:`,
      {
        categories: selectedCategories.value.length,
        note: "Price filtering dilakukan di client-side menggunakan harga setelah discount",
        // Featured filter removed
      }
    );
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    allProducts.value = [];
  } finally {
    loading.value = false;
    showLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    console.log("🔄 Fetching categories from API...");

    // Try to get active categories first
    let response = await axiosInstance.get("/products/categories");
    console.log("✅ Active categories API response:", response.data);

    let fetchedCategories = response.data.data || response.data || [];

    // 🔄 Fallback: If no active categories, get all categories
    if (fetchedCategories.length === 0) {
      console.log("⚠️ No active categories found, trying all categories...");
      try {
        response = await axiosInstance.get("/products/all-categories");
        console.log("✅ All categories API response:", response.data);
        fetchedCategories = response.data.data || response.data || [];
      } catch (fallbackError) {
        console.warn("⚠️ Fallback categories also failed:", fallbackError);
      }
    }

    categories.value = fetchedCategories;

    console.log(
      `📋 Loaded ${fetchedCategories.length} categories:`,
      fetchedCategories.map((cat: any) => `${cat.category} (${cat.id})`)
    );

    if (fetchedCategories.length === 0) {
      console.warn("⚠️ No categories found at all");
    }
  } catch (error: any) {
    console.error("❌ Error fetching categories:", error);
    console.error("Response data:", error.response?.data);
    console.error("Status:", error.response?.status);

    // 🔄 Last resort: Try all categories endpoint
    try {
      console.log("🔄 Last resort: Trying all categories endpoint...");
      const fallbackResponse = await axiosInstance.get(
        "/products/all-categories"
      );
      categories.value =
        fallbackResponse.data.data || fallbackResponse.data || [];
      console.log(
        `✅ Fallback success: ${categories.value.length} categories loaded`
      );
    } catch (fallbackError) {
      console.error("❌ All fallback attempts failed:", fallbackError);
      categories.value = [];
    }
  }
};

// Helper functions
const getMainImageUrl = (product: any): string => {
  // Cek apakah ada assets dan ambil yang order = 1 (main image)
  if (product.assets && product.assets.length > 0) {
    const mainAsset = product.assets.find((asset: any) => asset.order === 1);
    if (mainAsset && mainAsset.url) {
      const imageUrl = getImageOrAlt(mainAsset.url);

      // Cek apakah image sudah pernah failed
      if (shouldUseAltImage(mainAsset.url)) {
        return altImageUrl.value;
      }

      return imageUrl;
    }
  }

  // Fallback ke alt image jika tidak ada assets
  return altImageUrl.value;
};

// Handler untuk image error - simplified version
const handleImageError = (product: any) => {
  console.log("Image failed to load for product:", product.name);

  // Mark as failed and trigger reactivity
  if (product.assets && product.assets.length > 0) {
    const mainAsset = product.assets.find((asset: any) => asset.order === 1);
    if (mainAsset) {
      const imageUrl = getImageUrl(mainAsset.url);
      markImageAsFailed(imageUrl);
    }
  }
};

const applyFilters = () => {
  // Since filtering is now client-side, we don't need to fetch from server
  // The filteredProducts computed property will automatically update
  // Just reset pagination when filters change
  resetPagination();
};

// 🎯 NEW: Helper functions for enhanced category filtering
const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category?.category || "Unknown Category";
};

const removeCategoryFilter = (categoryId: string) => {
  selectedCategories.value = selectedCategories.value.filter(
    (id) => id !== categoryId
  );
  applyFilters();
};

const clearCategoryFilter = () => {
  selectedCategories.value = [];
  applyFilters();
};

const selectAllCategories = () => {
  selectedCategories.value = categories.value.map((cat) => cat.id);
  applyFilters();
};

const isQuickPriceActive = (min: number, max: number): boolean => {
  return (
    priceMin.value === min && priceMax.value === max && priceFilterActive.value
  );
};

const setQuickPrice = (min: number, max: number) => {
  priceMin.value = min;
  priceMax.value = max;
  priceFilterActive.value = true;
  applyFilters();
};

// 🎯 NEW: Get sort icon for enhanced UX
const getSortIcon = (sortValue: string) => {
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
};

const toggleCategoryFilter = (categoryId: string) => {
  if (selectedCategories.value.includes(categoryId)) {
    removeCategoryFilter(categoryId);
  } else {
    selectedCategories.value = [categoryId]; // Single selection for quick filter
    applyFilters();
  }
};

const clearPriceFilter = () => {
  priceMin.value = 0;
  priceMax.value = 10000000;
  priceFilterActive.value = false;
  applyFilters();
};

const clearAllFilters = () => {
  selectedCategories.value = [];
  priceMin.value = 0;
  priceMax.value = 10000000;
  priceFilterActive.value = false;
  // searchQuery.value = ''; // Removed - search is independent of filter clearing
  // showFeaturedOnly removed - no longer needed
  resetPagination(); // Reset to page 1 when clearing filters
  applyFilters();
};

// Price change handlers
const onPriceMinChange = () => {
  if (priceMin.value > 0) {
    priceFilterActive.value = true;
  }
  applyFilters();
};

const onPriceMaxChange = () => {
  if (priceMax.value < 10000000) {
    priceFilterActive.value = true;
  }
  applyFilters();
};

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedCategories.value.length > 0 || priceFilterActive.value;
  // searchQuery removed from active filters
  // showFeaturedOnly removed
});

// 🎯 NEW: Count total active filters for badge (excluding search)
const totalActiveFilters = computed(() => {
  let count = 0;
  if (selectedCategories.value.length > 0)
    count += selectedCategories.value.length;
  if (priceFilterActive.value) count += 1;
  // searchQuery removed from count
  return count;
});

// Computed properties for simple price input formatting
const displayPriceMin = computed({
  get: () => formatPriceInput(priceMin.value),
  set: (value: string) => {
    // If empty input, set to 0
    if (!value || value.trim() === "") {
      priceMin.value = 0;
      applyFilters();
      return;
    }

    const numValue = parsePriceInput(value);
    priceMin.value = numValue;

    // Set filter as active if value >= 0 (allowing 0)
    if (numValue >= 0) {
      priceFilterActive.value = true;
    }
    applyFilters();
  },
});

const displayPriceMax = computed({
  get: () => formatPriceInput(priceMax.value),
  set: (value: string) => {
    // If empty input, set to 0
    if (!value || value.trim() === "") {
      priceMax.value = 0;
      priceFilterActive.value = true;
      applyFilters();
      return;
    }

    const numValue = parsePriceInput(value);
    priceMax.value = numValue;

    // Set filter as active for any valid number
    if (numValue >= 0) {
      priceFilterActive.value = true;
    }
    applyFilters();
  },
});

// 🎯 NEW: Watch for sync between inputs and slider
watch([priceMin, priceMax], ([newMin, newMax]) => {
  // Keep price values in sync for display
  if (newMin > newMax) {
    priceMax.value = newMin;
  }
});

// 🎯 NEW: Client-side filtering and sorting computed property
const filteredProducts = computed(() => {
  let filtered = [...allProducts.value];

  // Apply category filter
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((product) =>
      selectedCategories.value.includes(product.category_id)
    );
  }

  // Apply price filter (menggunakan harga setelah discount)
  if (priceFilterActive.value) {
    filtered = filtered.filter((product) => {
      // Hitung harga setelah discount
      const finalPrice =
        product.discount > 0
          ? calculateDiscountedPrice(product.price, product.discount)
          : product.price;

      return finalPrice >= priceMin.value && finalPrice <= priceMax.value;
    });
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();

    filtered = filtered.filter((product) => {
      // Search ONLY by product name for more accurate results
      const productName = product.name ? product.name.toLowerCase().trim() : "";
      const matchesName = productName.length > 0 && productName.includes(query);

      return matchesName;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
        // Gunakan harga setelah discount untuk sorting
        const priceA =
          a.discount > 0
            ? calculateDiscountedPrice(a.price, a.discount)
            : a.price;
        const priceB =
          b.discount > 0
            ? calculateDiscountedPrice(b.price, b.discount)
            : b.price;
        return priceA - priceB;
      case "price_desc":
        // Gunakan harga setelah discount untuk sorting
        const priceDescA =
          a.discount > 0
            ? calculateDiscountedPrice(a.price, a.discount)
            : a.price;
        const priceDescB =
          b.discount > 0
            ? calculateDiscountedPrice(b.price, b.discount)
            : b.price;
        return priceDescB - priceDescA;
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
});

// 🎯 NEW: Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

// Updated products computed property with pagination
const products = computed(() => {
  return paginatedProducts.value;
});

// 🎯 NEW: Additional helper functions for enhanced sidebar filtering
const formatPriceShort = (price: number): string => {
  if (price >= 1000000000) {
    // Milyar (1000M+) - use M format
    const milyar = price / 1000000000;
    return milyar % 1 === 0 ? `${milyar.toFixed(0)}M` : `${milyar.toFixed(1)}M`;
  } else if (price >= 1000000) {
    // Juta (1M+) - remove .0 if it's a whole number
    const juta = price / 1000000;
    return juta % 1 === 0
      ? `${juta.toFixed(0)} juta`
      : `${juta.toFixed(1)} juta`;
  } else if (price >= 1000) {
    // Ribu (1K+)
    return `${(price / 1000).toFixed(0)} ribu`;
  } else {
    // Under 1000
    return new Intl.NumberFormat("id-ID").format(price);
  }
};

const getCategoryProductCount = (categoryId: string): number => {
  // Count products in this category from current filtered results
  return allProducts.value.filter(
    (product) => product.category_id === categoryId
  ).length;
};

const toggleMobileFilter = () => {
  showMobileFilter.value = !showMobileFilter.value;
};

// 🎯 NEW: Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Scroll to top saat ganti halaman
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

// Reset ke halaman 1 saat filter berubah
const resetPagination = () => {
  currentPage.value = 1;
};

const filterTimeout = ref<number | null>(null);

// Watch untuk reset pagination saat filter berubah
watch([selectedCategories, priceMin, priceMax, searchQuery, sortBy], () => {
  resetPagination();
});

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchCatalogProducts()]);
});
</script>

<style scoped>
/* CSS Variables for navbar positioning */
:root {
  --navbar-height: 64px;
  --sidebar-offset: 8px; /* Smaller margin for better scroll following */
}

.dark-bg {
  background-color: #181818 !important;
  min-height: 100vh;
}
.transition-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.transition-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}
.product-card {
  background-color: #222 !important;
}
.dark-product-card {
  border: 1px solid #333 !important;
}
.v-card-title,
.v-card-subtitle,
.text-white {
  color: #fff !important;
}

/* Override for filter sidebar title */
.filter-sidebar .v-card-title {
  color: rgba(0, 0, 0, 0.6) !important;
}

.text-grey-lighten-2 {
  color: #bdbdbd !important;
}
.dark-input .v-input__control {
  background-color: #222 !important;
  color: #fff !important;
}

/* Light input style for white sidebar */
.light-input .v-input__control {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}

.light-input .v-field__input {
  color: #333 !important;
}

.light-input .v-field__outline {
  color: #ddd !important;
}

.light-input:hover .v-field__outline {
  color: #1976d2 !important;
}

/* Search input styling */
.search-input .v-input__control {
  background-color: #f8f9fa !important;
}

.search-input .v-field__input {
  color: #333 !important;
}

.search-input .v-field__outline {
  color: #ddd !important;
}

.search-input:hover .v-field__outline,
.search-input.v-field--focused .v-field__outline {
  color: #1976d2 !important;
}

/* Dark search input styling */
.dark-search-input .v-input__control {
  background-color: #1e1e1e !important;
}

.dark-search-input .v-field__input {
  color: #fff !important;
}

.dark-search-input .v-field__input::placeholder {
  color: #aaa !important;
}

.dark-search-input .v-field__outline {
  color: #555 !important;
}

.dark-search-input:hover .v-field__outline,
.dark-search-input.v-field--focused .v-field__outline {
  color: #fff !important;
}

.dark-search-input .v-field__prepend-inner .v-icon,
.dark-search-input .v-field__append-inner .v-icon {
  color: #aaa !important;
}

.dark-search-input.v-field--focused .v-field__prepend-inner .v-icon,
.dark-search-input.v-field--focused .v-field__append-inner .v-icon {
  color: #fff !important;
}

/* Search card styling */
.search-card {
  border: 1px solid #444 !important;
}

/* Gap utility for flexbox */
.gap-2 {
  gap: 8px;
}

/* Responsive search box */
@media (max-width: 768px) {
  .search-card {
    width: 250px !important;
  }
}

@media (max-width: 600px) {
  .search-card {
    width: 200px !important;
  }

  .dark-search-input .v-field__input {
    font-size: 14px !important;
  }
}

.v-btn:focus,
.v-card:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* 🎯 NEW: Enhanced filter styles */
.gap-2 {
  gap: 8px;
}

.gap-1 {
  gap: 4px;
}

.filter-sidebar {
  position: sticky;
  top: calc(var(--navbar-height, 64px) + var(--sidebar-offset, 20px));
  max-height: calc(
    100vh - var(--navbar-height, 64px) - var(--sidebar-offset, 20px) - 16px
  );
  overflow-y: auto;
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  align-self: flex-start;
}

/* Ensure sidebar scrolls properly */
.filter-sidebar::-webkit-scrollbar {
  width: 4px;
}

.filter-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.filter-sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.filter-sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.filter-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.filter-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.filter-section-last {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.categories-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.categories-list::-webkit-scrollbar {
  width: 4px;
}

.categories-list::-webkit-scrollbar-track {
  background: transparent;
}

.categories-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.category-checkbox .v-input__control {
  transition: all 0.2s ease;
}

.category-checkbox:hover .v-input__control {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.filter-chip {
  transition: all 0.3s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.quick-category-btn {
  transition: all 0.2s ease;
  text-transform: none;
}

.quick-category-btn:hover {
  transform: translateY(-1px);
}

/* 🎯 ELEGANT SIDEBAR STYLES */
.filter-sidebar {
  position: sticky;
  top: calc(var(--navbar-height, 64px) + var(--sidebar-offset, 32px));
  max-height: calc(
    100vh - var(--navbar-height, 64px) - var(--sidebar-offset, 32px) - 16px
  ) !important;
  overflow-y: auto;
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  border-radius: 12px !important;
  padding: 16px !important;
}

/* 🎯 ACTIVE FILTERS STYLES */
.active-filters-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-chips-container {
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
  min-height: 28px; /* Consistent height for empty state */
  align-items: center;
}

.filter-chips-container.empty-state {
  justify-content: flex-start;
}

.empty-placeholder {
  font-style: italic;
  padding: 4px 8px;
}

.filter-chips-container::-webkit-scrollbar {
  height: 4px;
}

.filter-chips-container::-webkit-scrollbar-track {
  background: transparent;
}

.filter-chips-container::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.category-chips {
  max-width: 100%;
}

.elegant-active-chip {
  min-width: fit-content !important;
  white-space: nowrap !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  border-radius: 16px !important;
  transition: all 0.2s ease !important;
}

.elegant-active-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.elegant-clear-btn {
  font-size: 11px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  text-transform: none !important;
  border: 1px solid #dc3545 !important;
  transition: all 0.2s ease !important;
}

.elegant-clear-btn:hover {
  background-color: #dc3545 !important;
  color: white !important;
  transform: translateY(-1px);
}

/* 🎯 CATEGORY SELECTION STYLES */
.category-selection-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #f0f0f0;
}

.category-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-action-btn {
  text-transform: none !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  min-height: 28px !important;
  transition: all 0.2s ease !important;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

.category-grid {
  display: grid;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
}

.category-grid::-webkit-scrollbar {
  width: 4px;
}

.category-grid::-webkit-scrollbar-track {
  background: transparent;
}

.category-grid::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.category-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  border-color: #1976d2;
  background-color: #f8f9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.1);
}

.category-item.category-selected {
  background-color: #e3f2fd;
  border-color: #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
}

.category-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-name {
  font-weight: 500 !important;
  color: #424242 !important;
  font-size: 11px !important;
}

.category-selected .category-name {
  color: #1976d2 !important;
  font-weight: 600 !important;
}

.product-count-chip {
  font-size: 9px !important;
  font-weight: 600 !important;
  min-width: 18px !important;
  height: 16px !important;
}

.loading-categories {
  color: #666 !important;
  font-style: italic;
}

/* 🎯 PRICE INPUT STYLES */
.price-input .v-field {
  border-radius: 6px !important;
  min-height: 30px !important;
}

.price-input .v-field__input {
  font-size: 11px !important;
  padding: 2px 6px !important;
}

.price-input .v-field__prepend-inner {
  padding-right: 4px !important;
}

.price-range-slider {
  margin: 8px 4px;
}

.price-range-slider .v-slider {
  margin: 0 !important;
}

.price-range-slider .v-slider__track-container {
  height: 4px !important;
}

.price-range-slider .v-slider__thumb {
  width: 14px !important;
  height: 14px !important;
}

.quick-price-chip {
  transition: all 0.3s ease !important;
}

.quick-price-chip:hover {
  transform: translateY(-1px) scale(1.05);
}

/* 🎯 ENHANCED SORT DROPDOWN */
.enhanced-sort .v-field {
  transition: all 0.3s ease !important;
}

.enhanced-sort.v-field--focused {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2) !important;
}

.sort-item {
  transition: all 0.2s ease !important;
}

.sort-item:hover {
  background-color: #f8f9ff !important;
  transform: translateX(4px);
}

/* 🎯 ANIMATION CLASSES */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 🎯 LOADING STATES */
.filter-loading {
  position: relative;
  overflow: hidden;
}

.filter-loading::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 🎯 PULSE ANIMATION FOR ACTIVE FILTERS */
.filter-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

/* 🎯 MICRO-INTERACTIONS */
.v-badge .v-badge__badge {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* Rule of Eight - Consistent spacing */
.filter-section {
  margin-bottom: 8px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

/* Elegant Typography */
.elegant-dropdown {
  font-size: 10px !important;
  font-weight: 400 !important;
  text-transform: none !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  min-height: 18px !important;
}

.elegant-dropdown:hover {
  border-color: #1976d2 !important;
  background-color: #f8f9fa !important;
}

.elegant-dropdown .v-field {
  font-size: 8px !important;
  border-radius: 4px !important;
  min-height: 18px !important;
}

.elegant-dropdown .v-field__input {
  padding: 1px 3px !important;
  font-size: 8px !important;
}

/* Special styling for price inputs to make them compact but readable */
.price-input-compact {
  max-width: 150px !important;
  width: 100% !important;
}

.price-input-compact .v-field {
  min-height: 16px !important;
}

.price-input-compact .v-field__input {
  padding: 0px 2px !important;
  font-size: 7px !important;
  line-height: 1.1 !important;
}

.elegant-input .v-field__outline__start,
.elegant-input .v-field__outline__end {
  border-color: #e0e0e0 !important;
}

.elegant-input.v-field--focused .v-field__outline__start,
.elegant-input.v-field--focused .v-field__outline__end {
  border-color: #1976d2 !important;
  border-width: 1px !important;
}

.elegant-select .v-field {
  font-size: 12px !important;
  border-radius: 8px !important;
  min-height: 32px !important;
}

.elegant-select .v-field__input {
  font-size: 12px !important;
  padding: 4px 8px !important;
}

/* Category Dropdown */
.categories-dropdown {
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
}

.categories-dropdown::-webkit-scrollbar {
  width: 4px;
}

.categories-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.categories-dropdown::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.elegant-checkbox .v-input__control {
  min-height: 28px !important;
}

.elegant-checkbox .v-checkbox-btn {
  padding: 2px !important;
}

.elegant-checkbox .v-label {
  font-size: 12px !important;
  line-height: 1.2 !important;
}

/* Elegant Chips */
.elegant-chip {
  font-size: 10px !important;
  height: 20px !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
}

.elegant-chip:hover {
  background-color: #f5f5f5 !important;
  border-color: #1976d2 !important;
  transform: translateY(-1px);
}

/* Compact spacing */
.v-chip.v-chip--size-x-small {
  font-size: 10px !important;
  height: 18px !important;
}

.v-btn.v-btn--size-x-small {
  font-size: 10px !important;
  min-height: 20px !important;
  padding: 0 6px !important;
}

/* Text sizes */
.text-caption {
  font-size: 11px !important;
  line-height: 1.2 !important;
}

.text-subtitle-2 {
  font-size: 12px !important;
  line-height: 1.3 !important;
}

/* Dividers */
.v-divider {
  margin: 4px 0 !important;
  opacity: 0.6 !important;
}

/* Button refinements */
.v-btn--variant-text {
  text-transform: none !important;
  font-weight: 400 !important;
}

/* Icon refinements */
.v-icon {
  opacity: 0.8;
}

/* Hover effects */
.filter-sidebar .v-btn:hover,
.filter-sidebar .v-chip:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

/* Menu card */
.v-menu .v-card {
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e0e0e0 !important;
}

/* 🎯 PAGINATION STYLES */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px 0;
}

.pagination-dots {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding: 8px 0;
}

.pagination-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #444;
  background: rgba(34, 34, 34, 0.8);
  color: #bdbdbd;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  flex-shrink: 0;
}

.pagination-dot:hover {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  color: #1976d2;
  transform: scale(1.1);
}

.pagination-dot-active {
  background-color: #1976d2 !important;
  border-color: #1976d2 !important;
  color: white !important;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
  transform: scale(1.05);
}

.pagination-dot-number {
  font-size: 11px;
  font-weight: 600;
}

.pagination-arrow {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid #444 !important;
  transition: all 0.3s ease !important;
  min-width: 44px !important;
  height: 44px !important;
}

.pagination-arrow:hover:not(:disabled) {
  background-color: rgba(25, 118, 210, 0.2) !important;
  border-color: #1976d2 !important;
  transform: scale(1.05);
}

.pagination-arrow:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

.pagination-arrow .v-icon {
  color: #bdbdbd;
}

.pagination-arrow:hover:not(:disabled) .v-icon {
  color: #1976d2;
}

/* Scrollable dots for many pages */
.pagination-dots::-webkit-scrollbar {
  height: 4px;
}

.pagination-dots::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.pagination-dots::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.pagination-dots::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile optimization */
@media (max-width: 960px) {
  .filter-sidebar {
    position: static;
    max-height: none !important;
    margin-bottom: 16px;
    top: 0;
  }

  .gap-2 {
    gap: 4px;
  }

  .gap-1 {
    gap: 2px;
  }

  .quick-category-btn {
    font-size: 0.75rem;
    padding: 4px 8px;
  }

  .categories-list {
    max-height: 200px;
  }

  /* Responsive pagination */
  .pagination-dot {
    width: 35px;
    height: 35px;
    font-size: 10px;
  }

  .pagination-dots {
    gap: 6px;
    padding: 4px 0;
  }

  .pagination-container {
    gap: 8px;
    margin-top: 24px;
    padding: 16px 0;
  }

  .pagination-arrow {
    min-width: 40px !important;
    height: 40px !important;
  }
}

@media (max-width: 480px) {
  .pagination-dot {
    width: 30px;
    height: 30px;
    font-size: 9px;
  }

  .pagination-dots {
    gap: 4px;
  }

  .pagination-arrow {
    min-width: 36px !important;
    height: 36px !important;
  }
}
</style>
