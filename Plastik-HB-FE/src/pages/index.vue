<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { getPage } from "../api/pageApi";
import { fetchFeaturedProducts } from "../api/productApi";
import { useAnalytics } from "../composables/useAnalytics";
import Achievements from "@/components/Achievements.vue";
import Trustedby from "@/components/Trustedby.vue";

interface PageData {
  id: string;
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
      partners?: TrustedByPartner[];
    };
  }>;
}

// Banner Types and Data
interface Banner {
  order: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

// Achievement Types and Data
interface Achievement {
  order: number;
  title: string;
  percentage: number;
  description: string;
  image?: string;
}

// Trusted By Types and Data
interface TrustedByPartner {
  order: number;
  title: string;
  image: string;
}

const { trackPageView } = useAnalytics();

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

const currentSlide = ref(0);
let autoScrollInterval: number | null = null;

// Featured Products Types and Data
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
    const response = (await fetchFeaturedProducts()) as FeaturedProduct[];
    featuredProducts.value = response;
    console.log("Featured Products:", featuredProducts.value);
  } catch (error: any) {
    errorMessage.value = error;
  }
}

// Banner Functions
const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    currentSlide.value =
      (currentSlide.value + 1) %
      (pageData.value?.sections[0].data.banners?.length || 1);
  }, 5000);
};

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
};

// Achievement Computed Properties
const achievements = computed(() => {
  return (
    pageData.value?.sections.find((s) => s.type === "ACHIEVEMENTS")?.data
      .achievements || []
  );
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
});

// Product Functions
const scrollContainer = ref<HTMLElement | null>(null);

const updateScrollPosition = () => {
  // Keep this for potential future use
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Use real data from backend for Trusted By section
const trustedByList = computed(() => {
  const section = pageData.value?.sections.find((s) => s.type === "TRUSTEDBY");
  return section?.data?.partners || [];
});

// Dynamically repeat the list to fill the marquee for small data
const trustedByRepeatedList = computed(() => {
  const minItems = 24; // Minimum to fill the marquee for smooth loop
  if (!trustedByList.value || trustedByList.value.length === 0) return [];
  let repeatCount = Math.ceil(minItems / trustedByList.value.length);
  if (trustedByList.value.length === 1) repeatCount = minItems;
  return Array(repeatCount).fill(trustedByList.value).flat();
});

// Trusted By auto/manual scroll state
const trustedByMarquee = ref<HTMLElement | null>(null);
const trustedByTrack = ref<HTMLElement | null>(null);
let trustedByIsDragging = false;
let trustedByStartX = 0;
let trustedByScrollLeft = 0;
let trustedByAutoScrollId: number | null = null;

// Infinite auto-scroll, never stops
const startTrustedByAutoScroll = () => {
  if (trustedByAutoScrollId) return;
  trustedByAutoScrollId = window.setInterval(() => {
    if (!trustedByMarquee.value || !trustedByTrack.value) return;
    trustedByMarquee.value.scrollLeft += 1;
    const maxScroll = trustedByTrack.value.scrollWidth / 2;
    // Use modulo for seamless infinite loop in both directions
    trustedByMarquee.value.scrollLeft =
      ((trustedByMarquee.value.scrollLeft % maxScroll) + maxScroll) % maxScroll;
  }, 16); // ~60fps
};
const stopTrustedByAutoScroll = () => {
  if (trustedByAutoScrollId) {
    clearInterval(trustedByAutoScrollId);
    trustedByAutoScrollId = null;
  }
};

const onTrustedByMouseDown = (e: MouseEvent) => {
  if (!trustedByMarquee.value) return;
  trustedByIsDragging = true;
  trustedByMarquee.value.classList.add("dragging");
  trustedByStartX = e.pageX - trustedByMarquee.value.offsetLeft;
  trustedByScrollLeft = trustedByMarquee.value.scrollLeft;
};
const onTrustedByMouseLeave = () => {
  trustedByIsDragging = false;
  if (trustedByMarquee.value)
    trustedByMarquee.value.classList.remove("dragging");
};
const onTrustedByMouseUp = () => {
  trustedByIsDragging = false;
  if (trustedByMarquee.value)
    trustedByMarquee.value.classList.remove("dragging");
};
const onTrustedByMouseMove = (e: MouseEvent) => {
  if (!trustedByIsDragging || !trustedByMarquee.value) return;
  e.preventDefault();
  const x = e.pageX - trustedByMarquee.value.offsetLeft;
  const walk = (x - trustedByStartX) * 1.2; // scroll speed
  if (trustedByTrack.value) {
    const maxScroll = trustedByTrack.value.scrollWidth / 2;
    let newScrollLeft = trustedByScrollLeft - walk;
    // Use modulo for seamless infinite loop in both directions
    trustedByMarquee.value.scrollLeft =
      ((newScrollLeft % maxScroll) + maxScroll) % maxScroll;
  }
};

onMounted(async () => {
  await fetchPageData();

  trackPageView(
    pageData.value?.id || "unknown",
    pageData.value?.slug || "unknown",
  );

  await fetchFeatured();
  startAutoScroll();
  await nextTick();
  updateScrollPosition();

  if (trustedByMarquee.value) {
    trustedByMarquee.value.addEventListener("mousedown", onTrustedByMouseDown);
    trustedByMarquee.value.addEventListener(
      "mouseleave",
      onTrustedByMouseLeave,
    );
    trustedByMarquee.value.addEventListener("mouseup", onTrustedByMouseUp);
    trustedByMarquee.value.addEventListener("mousemove", onTrustedByMouseMove);
  }
  startTrustedByAutoScroll();
});

onUnmounted(() => {
  stopAutoScroll();
  stopTrustedByAutoScroll();
  if (trustedByMarquee.value) {
    trustedByMarquee.value.removeEventListener(
      "mousedown",
      onTrustedByMouseDown,
    );
    trustedByMarquee.value.removeEventListener(
      "mouseleave",
      onTrustedByMouseLeave,
    );
    trustedByMarquee.value.removeEventListener("mouseup", onTrustedByMouseUp);
    trustedByMarquee.value.removeEventListener(
      "mousemove",
      onTrustedByMouseMove,
    );
  }
});
</script>

<template>
  <div class="home-page">
    <!-- Banner Section -->
    <BannerCarousel
      :banners="pageData?.sections[0].data.banners || []"
      :currentSlide="currentSlide"
      @update:currentSlide="currentSlide = $event"
      @goToSlide="goToSlide"
    />

    <!-- Achievement Section -->
    <Achievements :achievements="achievements" />

    <!-- Featured Products Section -->
    <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h2 class="text-h5 font-weight-bold mb-6">Produk Andalan</h2>
            <p class="text-subtitle-1 mb-3">
              Koleksi produk plastik berkualitas tinggi pilihan terbaik kami
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="products-carousel-container">
            <div
              ref="scrollContainer"
              class="products-scroll-container"
              @scroll="updateScrollPosition"
            >
              <div class="products-grid">
                <ProductCard
                  v-for="product in featuredProducts"
                  :key="product.id"
                  :product="product"
                  :imageUrl="product.assets[0]?.url"
                />
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
            color="primary"
            size="large"
            variant="elevated"
            class="view-all-products-btn text-capitalize font-weight-bold px-10 py-4 d-inline-flex align-center justify-center"
            elevation="6"
          >
            <span class="mr-3">Lihat Semua Produk</span>
            <v-icon size="28" color="white">mdi-arrow-right-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Trusted By Section -->
      <Trustedby
        :trustedByList="trustedByList"
        :trustedByRepeatedList="trustedByRepeatedList"
      />
    </v-container>
  </div>
</template>

<style scoped>
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
