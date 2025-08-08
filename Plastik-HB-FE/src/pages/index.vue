<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getPage } from "../api/pageApi";
import { fetchFeaturedProducts } from "../api/productApi";

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
      featuredProducts?: FeaturedProduct[];
    };
  }>;
}

// Banner Types and Data
interface Banner {
  order: number
  image: string
  title: string
  subtitle: string
  buttonText?: string
  buttonLink?: string
}

// Achievement Types and Data
interface Achievement {
  order: number
  title: string
  percentage: number
  description: string
  image?: string
}

const pageData = ref<PageData | null>(null);
const errorMessage = ref("");

async function fetchPageData() {
  try {
    pageData.value = (await getPage("homepage")) as PageData; // Fetch data by slug
    // console.log("Page Data:", pageData.value);
  } catch (error: any) {
    console.error("Failed to fetch page data:", error);
    errorMessage.value =
      error.response?.data?.message || "Failed to load page data.";
  }
}

const currentSlide = ref(0)
let autoScrollInterval: number | null = null

// Featured Products Types and Data
interface Asset {
  id: string;
  url: string;
  alt: string;
  type: 'IMAGE' | 'VIDEO';
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

interface FeaturedProduct {
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

const featuredProducts = ref<FeaturedProduct[]>([]);

async function fetchFeatured() {
  try {
    const response = await fetchFeaturedProducts() as FeaturedProduct[];
    featuredProducts.value = response;
  } catch (error: any) {
    errorMessage.value = error;
  }
}

// Banner Functions
const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % 3 // Assuming 3 banners, adjust as needed
  }, 5000)
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

// Achievement Computed Properties
const achievements = computed(() => {
  return pageData.value?.sections.find(s => s.type === "ACHIEVEMENTS")?.data.achievements || [];
});

const leftSideAchievements = computed(() => {
  const total = achievements.value.length;
  if (total === 0) return [];
  const leftCount = Math.ceil(total / 2);
  return achievements.value.slice(0, leftCount);
});

const rightSideAchievements = computed(() => {
  const total = achievements.value.length;
  const leftCount = Math.ceil(total / 2);
  return achievements.value.slice(leftCount);
})

// Product Functions
const scrollContainer = ref<HTMLElement | null>(null)

const updateScrollPosition = () => {
  // Keep this for potential future use
}

const viewProductDetail = (product: FeaturedProduct) => {
  console.log('View product:', product.name)
  // router.push(`/produk/${product.id}`)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

// Lifecycle
onMounted(async () => {
  await fetchPageData();
  await fetchFeatured();
  startAutoScroll()
  await nextTick()
  updateScrollPosition()
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<template>
  <div class="home-page">
    <!-- Banner Section -->
    <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
      <v-row>
        <v-col cols="12">
          <div class="banner-container">
            <v-carousel
              v-model="currentSlide"
              :continuous="true"
              :cycle="true"
              interval="5000"
              height="400"
              hide-delimiter-background
              hide-delimiters
              show-arrows="false"
              class="custom-carousel"
            >
              <v-carousel-item
                v-for="(banner, index) in pageData?.sections[0].data.banners"
                :key="index"
                :src="banner.image"
                cover
                class="banner-item"
              >
                <div class="banner-overlay">
                  <v-container class="fill-height">
                    <v-row align="center" justify="center">
                      <v-col cols="12" md="8" class="text-center">
                        <h1 class="banner-title text-white mb-4">
                          {{ banner.title }}
                        </h1>
                        <p class="banner-subtitle text-white mb-6">
                          {{ banner.subtitle }}
                        </p>
                        <v-btn
                          v-if="banner.buttonText"
                          :to="banner.buttonLink"
                          color="amber"
                          size="large"
                          rounded
                          class="banner-btn"
                        >
                          {{ banner.buttonText }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </div>
              </v-carousel-item>
            </v-carousel>

            <!-- Custom Dots Indicator -->
            <div class="banner-dots">
              <div
                v-for="(banner, index) in pageData?.sections[0].data.banners"
                :key="index"
                class="banner-dot"
                :class="{ 'active': currentSlide === index }"
                @click="goToSlide(index)"
              />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Achievement Section -->
    <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h2 class="text-h5 font-weight-bold mb-6">
              Achievement
            </h2>
          </div>
        </v-col>
      </v-row>

      <v-row class="achievement-content mb-12">
        <!-- Left Side - Large Image or Achievement Items -->
        <v-col cols="12" md="6" class="left-section">
          <div v-if="leftSideAchievements.length === 0" class="large-image-placeholder">
            <v-card class="fill-height d-flex align-center justify-center bg-grey-darken-3 rounded-lg elevation-1" outlined>
              <div class="text-center pa-8">
                <v-icon size="80" color="amber">mdi-image-outline</v-icon>
                <p class="text-white mt-4">Large Image Placeholder</p>
              </div>
            </v-card>
          </div>
          
          <!-- Left Achievement Items -->
          <div v-else class="achievement-grid">
            <v-card
              v-for="achievement in leftSideAchievements"
              :key="achievement.order"
              class="achievement-card mb-4 pa-6 bg-grey-darken-3 rounded-lg elevation-1"
            >
              <v-card-text class="d-flex align-center pa-0">
                <!-- Achievement Icon/Image -->
                <v-avatar size="60" class="mr-4">
                  <v-img
                    v-if="achievement.image"
                    :src="achievement.image"
                    :alt="achievement.title"
                  />
                  <v-icon v-else size="40" color="amber">mdi-trophy</v-icon>
                </v-avatar>
                
                <!-- Achievement Content -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="achievement-percentage text-h4 font-weight-bold text-amber">
                      {{ achievement.percentage }}%
                    </h3>
                  </div>
                  <p class="achievement-description text-body-1 mb-0 text-white">
                    {{ achievement.description }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- Right Side - Achievement Items -->
        <v-col cols="12" md="6" class="right-section">
          <div class="achievement-grid">
            <v-card
              v-for="achievement in rightSideAchievements"
              :key="achievement.order"
              class="achievement-card mb-4 pa-6 bg-grey-darken-3 rounded-lg elevation-1"
            >
              <v-card-text class="d-flex align-center pa-0">
                <!-- Achievement Icon/Image -->
                <v-avatar size="60" class="mr-4">
                  <v-img
                    v-if="achievement.image"
                    :src="achievement.image"
                    :alt="achievement.title"
                  />
                  <v-icon v-else size="40" color="amber">mdi-trophy</v-icon>
                </v-avatar>
                
                <!-- Achievement Content -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="achievement-percentage text-h4 font-weight-bold text-amber">
                      {{ achievement.percentage }}%
                    </h3>
                  </div>
                  <p class="achievement-description text-body-1 mb-0 text-white">
                    {{ achievement.description }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Featured Products Section -->
    <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h2 class="text-h5 font-weight-bold mb-6">
              Produk Andalan
            </h2>
            <p class="text-subtitle-1 mb-3">
              Koleksi produk plastik berkualitas tinggi pilihan terbaik kami
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="products-carousel-container">
            <!-- Products Scroll Container -->
            <div 
              ref="scrollContainer"
              class="products-scroll-container"
              @scroll="updateScrollPosition"
            >
              <div class="products-grid">
                <v-card
                  v-for="product in featuredProducts"
                  :key="product.id"
                  class="product-card bg-grey-darken-3 rounded-lg elevation-1"
                  @click="viewProductDetail(product)"
                >
                  <!-- Product Image -->
                  <div class="product-image-container">
                    <v-img
                      :src="product.assets[0]?.url || '/src/assets/placeholder.png'"
                      :alt="product.name"
                      height="200"
                      cover
                      class="product-image"
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon size="60" color="amber">mdi-package-variant</v-icon>
                        </div>
                      </template>
                    </v-img>
                    
                  </div>

                  <!-- Product Content -->
                  <v-card-text class="pa-4">
                    <h3 class="product-name text-subtitle-1 font-weight-bold mb-2 text-white">
                      {{ product.name }}
                    </h3>
                    <p class="product-description text-body-2 text-grey-lighten-1 mb-3">
                      {{ product.description }}
                    </p>
                    
                    <!-- Product Price -->
                    <div class="product-price-container d-flex align-center justify-space-between">
                      <div>
                        <span class="product-price text-h6 font-weight-bold text-amber">
                          {{ formatPrice(product.price) }}
                        </span>
                        <span v-if="product.discount" class="original-price text-body-2 text-grey ml-2">
                          {{ formatPrice(product.discount) }}
                        </span>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- View All Products Button -->
      <v-row class="mt-6">
        <v-col cols="12" class="text-center">
          <v-btn
            to="/katalog"
            color="amber"
            size="large"
            variant="outlined"
            class="px-8"
          >
            Lihat Semua Produk
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
/* Banner Styles */
.banner-container {
  position: relative;
  overflow: hidden;
}

.custom-carousel {
  border-radius: 8px;
}

.banner-item {
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-title {
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  margin: 0 auto;
}

.banner-btn {
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 0.5px;
}

.banner-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.banner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.banner-dot.active {
  background: rgba(255, 193, 7, 0.9);
  transform: scale(1.2);
}

.banner-dot:hover {
  background: rgba(255, 193, 7, 0.7);
  transform: scale(1.1);
}

/* Achievement Styles */
.large-image-placeholder {
  height: 400px;
}

.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.achievement-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.left-section, .right-section {
  display: flex;
  flex-direction: column;
}

/* Product Styles */
.products-carousel-container {
  position: relative;
}

.products-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.products-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.products-grid {
  display: flex;
  gap: 20px;
  padding: 20px 40px;
  min-width: max-content;
  justify-content: center;
}

.product-card {
  width: 260px;
  min-width: 260px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3) !important;
}

.product-image-container {
  position: relative;
}

.product-image {
  border-radius: 8px 8px 0 0;
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.product-name {
  line-height: 1.3;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  line-height: 1.4;
  min-height: 2.8em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.original-price {
  text-decoration: line-through;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .products-grid {
    padding: 20px 20px;
  }
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .banner-dots {
    bottom: 10px;
    gap: 6px;
  }
  
  .banner-dot {
    width: 10px;
    height: 10px;
  }

  .achievement-content {
    flex-direction: column;
  }
  
  .large-image-placeholder {
    height: 250px;
    margin-bottom: 2rem;
  }
  
  .achievement-card {
    margin-bottom: 1rem;
  }

  .product-card {
    width: 220px;
    min-width: 220px;
  }
  
  .products-grid {
    padding: 20px 10px;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .product-card {
    width: 200px;
    min-width: 200px;
  }
  
  .products-grid {
    gap: 10px;
  }
}
</style>