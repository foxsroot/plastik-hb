<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import index from '../index.vue'
import { getPage, updateHomepage } from '@/api/pageApi'
import { fetchFeaturedProducts, fetchProducts } from '@/api/productApi'
import { updateFeaturedProducts } from '@/api/updateFeaturedProducts'

// Banner Interface
interface Banner {
  order: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

// Achievement Interface
interface Achievement {
  order: number;
  title: string;
  percentage: number;
  description: string;
  image?: string;
}

// Asset Interface
interface Asset {
  id: string;
  url: string;
  alt: string;
  type: 'IMAGE' | 'VIDEO';
  created_at: string;
  updated_at: string;
  product_id: string;
}

// Category Interface
interface CategoryObj {
  id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Featured Product Interface
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

// Page Data Interface
interface PageData {
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: Array<{
    type: string;
    order: number;
    visible: boolean;
    data: {
      banners?: Banner[];
      achievements?: Achievement[];
    };
  }>;
}

// Alert state
const alertVisible = ref(false)
const alertType = ref<'success' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Form state
const loading = ref(false)
const saveLoading = ref(false)
const catalogLoading = ref(false)

// All products from catalog
const catalogProducts = ref<Product[]>([]);
const pageData = ref<PageData | null>(null);
const errorMessage = ref("");

async function fetchAllProducts() {
  try {
    if (Array.isArray((await fetchProducts()))) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value = (response as any).data || (response as any).products || [];
    }
  } catch (error: any) {
    showAlert('error', 'Gagal', error);
  }
}


// Product selection dialog
const productSelectionDialog = ref(false)
const selectedProductId = ref<string | null>(null)

// File input refs
const bannerFileInputRefs = ref<(HTMLInputElement | null)[]>([])
const achievementFileInputRefs = ref<(HTMLInputElement | null)[]>([])

// Computed properties
const selectedProductIds = computed(() =>
  featuredProducts.value.map(p => p.id)
);

const availableProducts = computed(() =>
  catalogProducts.value.filter(product =>
    !selectedProductIds.value.includes(product.id)
  )
);

// Product search for selection dialog
const productSearch = ref('');
const filteredAvailableProducts = computed(() => {
  if (!productSearch.value) return availableProducts.value;
  return availableProducts.value.filter(product =>
    product.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
    product.description?.toLowerCase().includes(productSearch.value.toLowerCase())
  );
});

// Remove featuredProducts computed and instead fetch featured products from API
const featuredProducts = ref<Product[]>([]);

async function fetchFeatured() {
  try {
    const response = await fetchFeaturedProducts();
    featuredProducts.value = Array.isArray(response) ? response : (response as any).data || [];
  } catch (error: any) {
    errorMessage.value = error;
  }
}

// Alert functions
const showAlert = (type: 'success' | 'error', title: string, message: string) => {
  alertType.value = type
  alertTitle.value = title
  alertMessage.value = message
  alertVisible.value = true

  setTimeout(() => {
    alertVisible.value = false
  }, 5000)
}

// --- Banner State as Ref ---
const banners = ref<Banner[]>([]);

// Sync banners with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    // Accept both BANNER and BANNERS for section type
    const arr = val?.sections.find(s => s.type === "BANNERS" || s.type === "BANNER")?.data.banners;
    banners.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
    // Always show at least one banner form
    if (banners.value.length === 0) {
      banners.value.push({
        order: 1,
        image: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: ''
      });
    }
  },
  { immediate: true }
);

// Automatically sync banners to pageData.sections[0] when they change
watch(banners, (newBanners) => {
  if (
    pageData.value &&
    pageData.value.sections &&
    pageData.value.sections[0] &&
    pageData.value.sections[0].data
  ) {
    pageData.value.sections[0].data.banners = JSON.parse(JSON.stringify(newBanners));
  }
}, { deep: true });

// Update pageData banners before save
const syncBannersToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find(s => s.type === "BANNERS");
    if (section) section.data.banners = JSON.parse(JSON.stringify(banners.value));
  }
};

// Banner functions (keeping existing banner functions)
const addBanner = () => {
  banners.value.push({
    order: banners.value.length + 1,
    image: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: ''
  })
}

const removeBanner = (index: number) => {
  if (banners.value.length > 1) {
    banners.value.splice(index, 1)
  }
}

const handleBannerImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      banners.value[index].image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const openBannerFileInput = (index: number) => {
  bannerFileInputRefs.value[index]?.click()
}

// --- Achievements State as Ref ---
const achievements = ref<Achievement[]>([]);

// Sync achievements with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    const arr = val?.sections.find(s => s.type === "ACHIEVEMENTS")?.data.achievements;
    achievements.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
  },
  { immediate: true }
);

// Automatically sync banners and achievements to pageData.sections when they change
watch(achievements, (newAchievements) => {
  if (
    pageData.value &&
    pageData.value.sections &&
    pageData.value.sections[1] &&
    pageData.value.sections[1].data
  ) {
    pageData.value.sections[1].data.achievements = JSON.parse(JSON.stringify(newAchievements));
  }
}, { deep: true });

// Update pageData achievements before save
const syncAchievementsToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find(s => s.type === "ACHIEVEMENTS");
    if (section) section.data.achievements = JSON.parse(JSON.stringify(achievements.value));
  }
};

// Update add/remove/clear/upload to use achievements ref
const addAchievement = () => {
  achievements.value.push({
    order: achievements.value.length + 1,
    title: '',
    percentage: 0,
    description: '',
    image: ''
  });
};
const removeAchievement = (index: number) => {
  if (achievements.value.length > 1) achievements.value.splice(index, 1);
};
const handleAchievementImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      achievements.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};
const openAchievementFileInput = (index: number) => {
  achievementFileInputRefs.value[index]?.click();
};

// Fetch catalog products
const fetchCatalogProducts = async () => {
  catalogLoading.value = true
  try {
    if (Array.isArray((await fetchProducts()))) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value = (response as any).data || (response as any).products || [];
    }
  } catch (error) {
    console.error('Error fetching catalog products:', error)
    // Optionally show an alert or handle error
  } finally {
    catalogLoading.value = false
  }
}

// Fetch homepage data
const fetchPageData = async () => {
  loading.value = true
  try {
    pageData.value = (await getPage("homepage")) as PageData; // Fetch data by slug
  } catch (error: any) {
    console.error("Failed to fetch page data:", error);
    errorMessage.value =
      error.response?.data?.message || "Failed to load page data.";
  } finally {
    loading.value = false
  }
}

// Save homepage data
const saveHomepageData = async () => {
  saveLoading.value = true
  try {
    if (!pageData.value) throw new Error('No page data to save');
    // Save homepage content
    const response = await updateHomepage({
      title: pageData.value.title,
      description: pageData.value.description,
      published: pageData.value.published,
      sections: pageData.value.sections
    });
    // Save featured products
    await updateFeaturedProducts(featuredProducts.value.map(p => p.id));
    showAlert('success', 'Berhasil', 'Data halaman utama & produk andalan berhasil disimpan!')
    // Auto reload after successful save
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Give user a moment to see the alert
  } catch (error: any) {
    console.error('Error saving homepage data:', error)
    showAlert('error', 'Gagal', error?.message || 'Gagal menyimpan data halaman utama')
  } finally {
    saveLoading.value = false
  }
}

// Preview state
const previewKey = ref(0)
const previewTimestamp = ref(Date.now())

// Preview functions
const refreshPreview = () => {
  previewKey.value += 1
  previewTimestamp.value = Date.now()
}

const openHomepage = () => {
  window.open('/', '_blank')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};


// Featured Products Section (NEW)
const removeFeaturedProduct = (index: number) => {
  if (featuredProducts.value.length > 0) {
    featuredProducts.value.splice(index, 1)
  }
}

// Add product to featuredProducts
const addSelectedProduct = () => {
  if (selectedProductId.value) {
    const product = catalogProducts.value.find(p => p.id === selectedProductId.value);
    if (product && !featuredProducts.value.some(fp => fp.id === product.id)) {
      featuredProducts.value.push(product);
      selectedProductId.value = null;
      productSelectionDialog.value = false;
    }
  }
};

// Drag and drop states for banners
const dragOverBannerIndex = ref<number | null>(null);
const hoveredBannerIndex = ref<number | null>(null);

const onBannerDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverBannerIndex.value = index;
};

const onBannerDragLeave = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (dragOverBannerIndex.value === index) {
    dragOverBannerIndex.value = null;
  }
};

const onBannerDrop = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverBannerIndex.value = null;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      banners.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Clear banner image
const clearBannerImage = (index: number) => {
  banners.value[index].image = '';
};

onMounted(async () => {
  await fetchPageData();
  await fetchAllProducts();
  await fetchFeatured();
  await fetchCatalogProducts();
})
</script>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'admin'
  }
}
</route>

<template>
  <v-container class="pa-6">
    <!-- Alert -->
    <v-alert v-model="alertVisible" :type="alertType" :title="alertTitle" :text="alertMessage" closable class="mb-4"
      style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;" />

    <!-- Product Selection Dialog -->
    <v-dialog v-model="productSelectionDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          Pilih Produk untuk Featured
        </v-card-title>

        <v-card-text class="pa-0">
          <v-container class="pa-4">
            <v-text-field v-model="productSearch" label="Cari Produk" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="compact" class="mb-4" />
            <v-row v-if="catalogLoading" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Memuat katalog produk...</p>
              </v-col>
            </v-row>

            <v-row v-else-if="filteredAvailableProducts.length === 0" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
                <p class="text-grey-darken-1 mt-2">Tidak ada produk yang tersedia untuk dipilih</p>
              </v-col>
            </v-row>

            <v-row v-else>
              <v-col v-for="product in filteredAvailableProducts" :key="product.id" cols="12" md="6">
                <v-card variant="outlined" :class="{ 'v-card--selected': selectedProductId === product.id }"
                  @click="selectedProductId = product.id" class="cursor-pointer">
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-img :src="product.assets[0]?.url || '/placeholder.jpg'" height="100" cover>
                        <template v-slot:placeholder>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-icon size="40" color="grey-lighten-1">mdi-package-variant</v-icon>
                          </div>
                        </template>
                      </v-img>
                    </v-col>
                    <v-col cols="8">
                      <v-card-text class="pa-3">
                        <h4 class="text-subtitle-2 mb-1">{{ product.name }}</h4>
                        <p class="text-caption text-grey-darken-1 mb-2">{{ product.description }}</p>
                        <div class="d-flex align-center justify-space-between">
                          <span v-if="product.discount && product.discount > 0"
                            class="text-subtitle-2 font-weight-bold text-grey-darken-1 mr-2"
                            style="text-decoration: line-through;">
                            {{ formatPrice(product.price) }}
                          </span>
                          <span v-if="product.discount && product.discount > 0"
                            class="text-subtitle-2 font-weight-bold text-primary">
                            {{ formatPrice(product.discount) }}
                          </span>
                          <!-- <span v-else class="text-subtitle-2 font-weight-bold text-primary">
                            {{ formatPrice(product.price) }}
                          </span> -->
                        </div>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-overlay v-if="selectedProductId === product.id" contained
                    class="d-flex align-center justify-center" opacity="0.1">
                    <v-icon size="48" color="primary">mdi-check-circle</v-icon>
                  </v-overlay>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn :disabled="!selectedProductId" color="primary" variant="elevated" @click="addSelectedProduct">
            Tambahkan
          </v-btn>
          <v-btn @click="productSelectionDialog = false" variant="outlined">
            Batal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Halaman Utama</h1>
        <p class="text-body-2 text-grey-darken-1">Kelola konten halaman utama website dan lihat preview</p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat data halaman utama...</p>
    </div>

    <!-- Main Content -->
    <v-row v-else>
      <!-- Left Side - Form -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Editor Konten
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveHomepageData">
              <!-- Banner Section (keeping existing) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Banner Carousel</h3>
                  <v-btn @click="addBanner" icon="mdi-plus" variant="outlined" size="small" color="primary"
                    class="icon-btn-square" />
                </div>

                <!-- Banner forms (keeping existing implementation) -->
                <div v-for="(banner, index) in banners" :key="index" class="mb-4">
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <h4 class="text-subtitle-1 flex-grow-1">Banner {{ index + 1 }}</h4>
                      <v-btn @click="removeBanner(index)" icon="mdi-delete" variant="text" size="small" color="error"
                        :disabled="banners.length <= 1" />
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-3">
                      <v-card height="150" variant="outlined"
                        class="d-flex align-center justify-center mb-2 image-upload-card drag-drop-banner"
                        @click="openBannerFileInput(index)" @dragover.prevent="onBannerDragOver($event, index)"
                        @dragleave.prevent="onBannerDragLeave($event, index)"
                        @drop.prevent="onBannerDrop($event, index)"
                        :class="{ 'drag-over': dragOverBannerIndex === index }">
                        <div v-if="!banner.image" class="text-center">
                          <v-icon size="32" color="grey-lighten-1" class="mb-1">mdi-camera</v-icon>
                          <p class="text-caption text-grey-darken-1">Banner Image<br />(Drag & Drop or Click)</p>
                        </div>
                        <div v-else class="banner-image-wrapper" @mouseenter="hoveredBannerIndex = index"
                          @mouseleave="hoveredBannerIndex = null">
                          <v-img :src="banner.image" cover height="100%" class="rounded" />
                          <v-btn v-if="hoveredBannerIndex === index" icon="mdi-close-circle" size="small" color="error"
                            class="clear-image-btn" @click.stop="clearBannerImage(index)"
                            style="position: absolute; top: 8px; right: 8px; z-index: 2; background: white;" />
                        </div>
                      </v-card>

                      <input :ref="el => bannerFileInputRefs[index] = el as HTMLInputElement" type="file" accept="image"
                        style="display: none" @change="handleBannerImageUpload($event, index)" />
                    </div>

                    <v-text-field v-model="banner.title" label="Title" variant="outlined" density="compact"
                      class="mb-2" />

                    <v-text-field v-model="banner.subtitle" label="Subtitle" variant="outlined" density="compact"
                      class="mb-2" />

                    <v-text-field v-model="banner.buttonText" label="Button Text" variant="outlined" density="compact"
                      class="mb-2" />

                    <v-text-field v-model="banner.buttonLink" label="Button Link" variant="outlined"
                      density="compact" />
                  </v-card>
                </div>
              </div>

              <!-- Achievement Section (keeping existing) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Achievement</h3>
                  <v-btn @click="addAchievement" icon="mdi-plus" variant="outlined" size="small" color="primary"
                    class="icon-btn-square" />
                </div>

                <div v-for="(achievement, index) in achievements" :key="achievement.order" class="mb-3">
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <h4 class="text-subtitle-1 flex-grow-1">Achievement {{ index + 1 }}</h4>
                      <v-btn @click="removeAchievement(index)" icon="mdi-delete" variant="text" size="small"
                        color="error" :disabled="achievements.length <= 1" />
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-3">
                      <v-card height="100" variant="outlined"
                        class="d-flex align-center justify-center mb-2 image-upload-card"
                        @click="openAchievementFileInput(index)">
                        <div v-if="!achievement.image" class="text-center">
                          <v-icon size="24" color="grey-lighten-1" class="mb-1">mdi-trophy</v-icon>
                          <p class="text-caption text-grey-darken-1">Icon</p>
                        </div>
                        <v-img v-else :src="achievement.image" cover height="100%" class="rounded" />
                      </v-card>

                      <input :ref="el => achievementFileInputRefs[index] = el as HTMLInputElement" type="file"
                        accept="image" style="display: none" @change="handleAchievementImageUpload($event, index)" />
                    </div>

                    <v-text-field v-model="achievement.title" label="Title" variant="outlined" density="compact"
                      class="mb-2" />

                    <v-text-field v-model.number="achievement.percentage" label="Percentage" type="number" min="0"
                      max="100" variant="outlined" density="compact" class="mb-2" />

                    <v-textarea v-model="achievement.description" label="Description" variant="outlined"
                      density="compact" rows="2" />
                  </v-card>
                </div>
              </div>

              <!-- Featured Products Section (NEW) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Produk Andalan</h3>
                  <v-btn @click="productSelectionDialog = true" icon="mdi-plus" variant="outlined" size="small"
                    color="primary" class="icon-btn-square" :disabled="availableProducts.length === 0" />
                </div>
                <div v-if="featuredProducts.length === 0" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
                  <p class="text-grey-darken-1 mt-2">Belum ada produk yang dipilih sebagai featured</p>
                  <v-btn @click="productSelectionDialog = true" color="primary" variant="outlined"
                    :disabled="availableProducts.length === 0">
                    Pilih Produk
                  </v-btn>
                </div>
                <div v-else>
                  <div v-for="(product, index) in featuredProducts" :key="product.id" class="mb-3">
                    <v-card variant="outlined" class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <div class="flex-grow-1">
                          <h4 class="text-subtitle-1">{{ product.name }}</h4>
                          <p class="text-caption text-grey-darken-1 mb-0">{{ product.category?.category }}</p>
                        </div>
                        <v-btn @click="removeFeaturedProduct(index)" icon="mdi-delete" variant="text" size="small"
                          color="error" />
                      </div>
                      <div class="d-flex mb-3">
                        <v-img :src="product.assets[0]?.url || '/placeholder.jpg'" width="80" height="80" cover
                          class="rounded mr-3">
                          <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-icon size="30" color="grey-lighten-1">mdi-package-variant</v-icon>
                            </div>
                          </template>
                        </v-img>
                        <div class="flex-grow-1">
                          <p class="text-body-2 mb-2">{{ product.description }}</p>
                          <div class="d-flex align-center">
                            <span v-if="product.discount && product.discount > 0"
                              class="text-h6 font-weight-bold text-grey-darken-1 mr-2"
                              style="text-decoration: line-through;">
                              {{ formatPrice(product.price) }}
                            </span>
                            <span v-if="product.discount && product.discount > 0"
                              class="text-h6 font-weight-bold text-primary">
                              {{ formatPrice(product.discount) }}
                            </span>
                            <span v-else class="text-h6 font-weight-bold text-primary">
                              {{ formatPrice(product.price) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <v-btn type="submit" color="primary" variant="elevated" :loading="saveLoading" block size="large">
                Simpan Perubahan
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Side - Preview -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined">
          <v-card-title class="bg-grey text-white d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-eye</v-icon>
              Live Preview
            </div>
            <div class="d-flex gap-2">
              <v-btn @click="refreshPreview" icon="mdi-refresh" variant="text" size="small" color="white"
                title="Refresh preview" />
              <v-btn @click="openHomepage" icon="mdi-open-in-new" variant="text" size="small" color="white"
                title="Open homepage in new tab" />
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <div class="preview-container">
              <div :key="previewKey" class="preview-wrapper">
                <index />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

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
  min-height: 600px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}

.cursor-pointer {
  cursor: pointer;
}

.v-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.preview-container::-webkit-scrollbar {
  width: 6px;
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive scaling */
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

/* Hide any navbar/footer that might be in the index component */
.preview-wrapper :deep(.navbar),
.preview-wrapper :deep(.footer),
.preview-wrapper :deep(nav),
.preview-wrapper :deep(footer) {
  display: none !important;
}

/* Ensure full width for preview content */
.preview-wrapper :deep(.container),
.preview-wrapper :deep(.v-container) {
  max-width: 100% !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.drag-drop-banner {
  position: relative;
}

.drag-drop-banner.drag-over {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
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
