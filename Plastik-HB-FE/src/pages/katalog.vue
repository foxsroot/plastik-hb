<template>
  <Loading v-if="showLoading" />
  <v-container v-else fluid class="pa-4 dark-bg">
    <v-row>
      <!-- Filter Sidebar -->
      <v-col cols="12" md="3" lg="2" class="mb-4 mb-md-0">
        <FilterSideBar
          :categories="categories"
          :selectedCategories="selectedCategories"
          :priceMin="priceMin"
          :priceMax="priceMax"
          :priceFilterActive="priceFilterActive"
          :sortBy="sortBy"
          :sortOptions="sortOptions"
          :hasActiveFilters="hasActiveFilters"
          :totalActiveFilters="totalActiveFilters"
          @update:selectedCategories="selectedCategories = $event"
          @update:priceMin="priceMin = $event"
          @update:priceMax="priceMax = $event"
          @update:sortBy="sortBy = $event"
          @clearAllFilters="clearAllFilters"
          @clearCategoryFilter="clearCategoryFilter"
          @clearPriceFilter="clearPriceFilter"
          @selectAllCategories="selectAllCategories"
          @removeCategoryFilter="removeCategoryFilter"
          @setQuickPrice="setQuickPrice"
        />
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
          <SearchBar v-model="searchQuery" :maxWidth="450" />
        </div>

        <ProductList
          :products="products"
          :getMainImageUrl="getMainImageUrl"
          :altImageUrl="altImageUrl"
        />

        <!-- Pagination Component -->
        <Pagination
          v-if="totalPages > 1"
          :currentPage="currentPage"
          :totalPages="totalPages"
          @goToPage="goToPage"
          @next="nextPage"
          @prev="prevPage"
        />

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
import ProductList from "@/components/ProductList.vue";
import Pagination from "@/components/Pagination.vue";
import SearchBar from "@/components/SearchBar.vue";
import FilterSideBar from "@/components/FilterSideBar.vue";
import { useImageHandler } from "@/composables/useImageHandler";
import { formatPrice, calculateDiscountedPrice } from "@/utils/formatters";

// --- Setup: State ---
const showLoading = ref(true);
const categories = ref<any[]>([]);
const selectedCategories = ref<string[]>([]);
const priceMin = ref<number>(0);
const priceMax = ref<number>(10000000);
const priceFilterActive = ref<boolean>(false);
const sortBy = ref("name");
const sortOptions = [
  { title: "Nama A-Z", value: "name" },
  { title: "Nama Z-A", value: "name_desc" },
  { title: "Harga Terendah", value: "price_asc" },
  { title: "Harga Tertinggi", value: "price_desc" },
  { title: "Terbaru", value: "newest" },
];

// --- Setup: Product Data ---
const allProducts = ref<any[]>([]); // Fetched once, filtered client-side

// --- Setup: Pagination ---
const currentPage = ref(1);
const itemsPerPage = ref(12);

// --- Logic: Filtering ---
const hasActiveFilters = computed(
  () => selectedCategories.value.length > 0 || priceFilterActive.value,
);
const totalActiveFilters = computed(() => {
  let count = 0;
  if (selectedCategories.value.length > 0)
    count += selectedCategories.value.length;
  if (priceFilterActive.value) count += 1;
  return count;
});

const filteredProducts = computed(() => {
  let filtered = [...allProducts.value];
  // Search filter
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter((product) =>
      product.name?.toLowerCase().includes(query),
    );
  }
  // Category filter
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((product) =>
      selectedCategories.value.includes(product.category_id),
    );
  }
  // Price filter
  if (priceFilterActive.value) {
    filtered = filtered.filter((product) => {
      const finalPrice =
        product.discount > 0
          ? calculateDiscountedPrice(product.price, product.discount)
          : product.price;
      return finalPrice >= priceMin.value && finalPrice <= priceMax.value;
    });
  }
  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
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

// --- Logic: Pagination ---
const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage.value),
);
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredProducts.value.slice(start, start + itemsPerPage.value);
});

// --- Handlers: Filter Events ---
function removeCategoryFilter(categoryId: string) {
  selectedCategories.value = selectedCategories.value.filter(
    (id) => id !== categoryId,
  );
}
function clearCategoryFilter() {
  selectedCategories.value = [];
}
function selectAllCategories() {
  selectedCategories.value = categories.value.map((cat) => cat.id);
}
function clearPriceFilter() {
  priceMin.value = 0;
  priceMax.value = 10000000;
  priceFilterActive.value = false;
}
function clearAllFilters() {
  selectedCategories.value = [];
  priceMin.value = 0;
  priceMax.value = 10000000;
  priceFilterActive.value = false;
}
function setQuickPrice(min: number, max: number) {
  priceMin.value = min;
  priceMax.value = max;
  priceFilterActive.value = true;
}

// --- Watchers: Reset pagination and activate price filter on input change ---
watch([selectedCategories, sortBy], () => {
  currentPage.value = 1;
});

watch([priceMin, priceMax], ([newMin, newMax], [oldMin, oldMax]) => {
  // Activate price filter if min or max is changed from default
  if (newMin !== 0 || newMax !== 10000000) {
    priceFilterActive.value = true;
  } else {
    priceFilterActive.value = false;
  }
  // Keep price values in sync for display
  if (newMin > newMax) {
    priceMax.value = newMin;
  }
  currentPage.value = 1;
});

// 🆕 Initialize image handler composable
const {
  altImageUrl,
  getMainImageUrl,
  getAvailableAssetImages,
  getImportedImageUrls,
} = useImageHandler();

// 🆕 Debug: Log available images on component mount
onMounted(() => {
  console.log("Available asset images:", getAvailableAssetImages());
  console.log("Imported image URLs:", getImportedImageUrls());
});

// Reactive state
const loading = ref(false);
const showMobileFilter = ref(false);
const searchQuery = ref(""); // Add search functionality

// Error handling for price inputs
const priceMinError = ref<string>("");
const priceMaxError = ref<string>("");

// API functions
const fetchCatalogProducts = async () => {
  try {
    loading.value = true;

    const params: any = {};

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
        selectedCategories.value.includes(product.category_id),
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
      },
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
      fetchedCategories.map((cat: any) => `${cat.category} (${cat.id})`),
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
        "/products/all-categories",
      );
      categories.value =
        fallbackResponse.data.data || fallbackResponse.data || [];
      console.log(
        `✅ Fallback success: ${categories.value.length} categories loaded`,
      );
    } catch (fallbackError) {
      console.error("❌ All fallback attempts failed:", fallbackError);
      categories.value = [];
    }
  }
};

const applyFilters = () => {
  resetPagination();
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

// 🎯 NEW: Watch for sync between inputs and slider
watch([priceMin, priceMax], ([newMin, newMax]) => {
  // Keep price values in sync for display
  if (newMin > newMax) {
    priceMax.value = newMin;
  }
});

// Updated products computed property with pagination
const products = computed(() => {
  return paginatedProducts.value;
});

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

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchCatalogProducts()]);
});
</script>

<style scoped>
.dark-bg {
  background-color: #181818;
  min-height: 100vh;
}
.gap-2 {
  gap: 8px;
}
.gap-1 {
  gap: 4px;
}
</style>
