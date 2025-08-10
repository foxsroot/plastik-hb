<template>
  <v-app class="black-background">
    <!-- Main Content -->
    <v-main class="black-background">
      <v-container v-if="!product && !loading" fluid class="pa-8 text-center">
        <div class="text-white">
          <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
          <h3 class="mt-4 mb-2">Produk Tidak Ditemukan</h3>
          <p class="text-grey-lighten-1">
            Produk dengan ID tersebut tidak tersedia dalam database.
          </p>
          <p class="text-caption text-grey-lighten-2 mb-4">
            Pastikan ID produk benar atau produk masih aktif.
          </p>
          <div class="d-flex justify-center gap-3">
            <v-btn color="primary" variant="outlined" @click="goBack">
              <v-icon left>mdi-arrow-left</v-icon>
              Kembali
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="$router.push('/katalog')"
            >
              <v-icon left>mdi-view-grid</v-icon>
              Lihat Katalog
            </v-btn>
          </div>
        </div>
      </v-container>

      <v-container v-else-if="!product" fluid class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-white mt-4">Loading...</div>
      </v-container>

      <v-container v-else fluid class="pa-8">
        <!-- Product Detail Section -->
        <v-row>
          <!-- Product Image Gallery -->
          <v-col cols="12" md="6">
            <v-card
              color="grey-lighten-4"
              height="480"
              class="d-flex flex-column position-relative overflow-hidden gallery-card"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            >
              <!-- Navigation Arrows -->
              <v-btn
                v-show="
                  currentImageIndex > 0 &&
                  product.assets &&
                  product.assets.length > 0
                "
                icon
                color="black"
                class="position-absolute left-arrow"
                style="
                  left: 20px;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 3;
                "
                @click="previousImage"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>

              <v-btn
                v-show="
                  product.assets &&
                  currentImageIndex < product.assets.length - 1
                "
                icon
                color="black"
                class="position-absolute right-arrow"
                style="
                  right: 20px;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 3;
                "
                @click="nextImage"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>

              <!-- Main Image Container -->
              <div
                class="main-image-container flex-grow-1 d-flex align-center justify-center"
              >
                <transition :name="transitionName" mode="out-in">
                  <v-img
                    v-if="product.assets && product.assets.length > 0"
                    :key="`asset-${currentImageIndex}`"
                    :src="getCurrentImageUrl()"
                    height="350"
                    width="350"
                    contain
                    class="product-image"
                  >
                    <template v-slot:error>
                      <v-img
                        :src="altImageUrl"
                        height="350"
                        width="350"
                        contain
                        class="product-image"
                      />
                    </template>
                  </v-img>
                  <v-img
                    v-else
                    key="no-image"
                    :src="altImageUrl"
                    height="350"
                    width="350"
                    contain
                    class="product-image"
                  />
                </transition>
              </div>

              <!-- Image Counter (Top Right) -->
              <div
                v-if="product.assets && product.assets.length > 0"
                class="position-absolute image-counter"
                style="top: 15px; right: 15px; z-index: 4"
              >
                <v-chip
                  color="rgba(0,0,0,0.8)"
                  size="small"
                  class="text-white font-weight-bold"
                  variant="elevated"
                >
                  {{ currentImageIndex + 1 }}/{{ product.assets.length }}
                </v-chip>
              </div>

              <!-- Thumbnail Gallery Section - Fixed at Bottom -->
              <div
                v-if="product.assets && product.assets.length > 1"
                class="thumbnail-gallery-section"
              >
                <div class="thumbnail-container-fixed">
                  <div class="thumbnail-scroll-fixed">
                    <v-card
                      v-for="(asset, index) in product.assets"
                      :key="`thumb-${index}`"
                      :class="[
                        'thumbnail-card-fixed',
                        {
                          'thumbnail-active-fixed': currentImageIndex === index,
                        },
                      ]"
                      height="60"
                      width="60"
                      @click="goToImage(index)"
                      style="cursor: pointer; overflow: hidden"
                    >
                      <v-img
                        :src="getImageOrAlt(asset.url)"
                        height="58"
                        width="58"
                        cover
                        class="thumbnail-image-fixed"
                      >
                        <template v-slot:error>
                          <v-img
                            :src="altImageUrl"
                            height="58"
                            width="58"
                            cover
                            class="thumbnail-image-fixed"
                          />
                        </template>
                      </v-img>
                      <!-- Active indicator -->
                      <div
                        v-if="currentImageIndex === index"
                        class="thumbnail-overlay-fixed"
                      >
                        <v-icon color="white" size="14"
                          >mdi-check-circle</v-icon
                        >
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Product Information -->
          <v-col cols="12" md="6">
            <div class="text-white">
              <!-- Product Name with Back Button -->
              <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h4 font-weight-bold">{{ product.name }}</h2>
                <v-btn
                  color="white"
                  variant="outlined"
                  size="small"
                  @click="goBack"
                  class="text-white"
                >
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back
                </v-btn>
              </div>

              <!-- Price -->
              <div class="text-h5 mb-4">
                <span
                  v-if="product.discount > 0"
                  class="font-weight-medium text-primary"
                >
                  {{
                    formatPrice(
                      calculateDiscountedPrice(product.price, product.discount)
                    )
                  }}
                  <span
                    class="text-red text-decoration-line-through ml-2 text-body-1"
                  >
                    {{ formatPrice(product.price) }}
                  </span>
                  <v-chip
                    size="small"
                    color="error"
                    variant="flat"
                    class="ml-2"
                  >
                    -{{ product.discount }}%
                  </v-chip>
                </span>
                <span v-else class="font-weight-medium text-primary">
                  {{ formatPrice(product.price) }}
                </span>
              </div>

              <!-- Product Specifications -->
              <v-card
                color="grey-darken-4"
                class="pa-4 specifications-card"
                outlined
              >
                <h3 class="text-white mb-3">Spesifikasi Produk</h3>
                <div class="text-white specifications-content">
                  <p>
                    <strong>Kategori:</strong>
                    {{ product.category?.category || "Tidak tersedia" }}
                  </p>
                  <div v-if="product.description" class="mt-3 description-text">
                    {{ product.description }}
                  </div>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>

        <!-- Additional Information Section (Optional) -->
        <v-row v-if="product.specification" class="mt-8">
          <v-col cols="12">
            <v-card color="grey-darken-4" class="pa-6" outlined>
              <h3 class="text-white mb-4">Spesifikasi Detail</h3>
              <div class="text-white specification-detail-text">
                {{ product.specification }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Similar Products Section -->
        <v-row class="mt-8">
          <v-col cols="12">
            <div class="text-white mb-4">
              <h3 class="text-h5 font-weight-bold mb-2">Produk Serupa</h3>
              <p class="text-grey-lighten-1 text-body-2">
                Produk lain yang mungkin Anda Cari
              </p>
            </div>

            <v-row v-if="similarProductsLoading" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" size="32" />
                <div class="text-grey-lighten-1 mt-2">
                  Memuat produk serupa...
                </div>
              </v-col>
            </v-row>

            <v-row v-else-if="similarProducts.length > 0" no-gutters>
              <v-col
                v-for="similarProduct in similarProducts"
                :key="similarProduct.id"
                cols="6"
                sm="4"
                md="3"
                lg="2"
                xl="2"
                class="pa-1"
              >
                <v-card
                  class="product-card-similar dark-product-card transition-card"
                  height="200"
                  hover
                  @click="navigateToProduct(similarProduct.id)"
                  style="cursor: pointer"
                >
                  <v-img
                    :src="getSimilarProductImageUrl(similarProduct)"
                    height="120"
                    cover
                    class="align-end"
                  >
                    <template v-slot:error>
                      <v-img
                        :src="altImageUrl"
                        height="120"
                        cover
                        class="align-end"
                      />
                    </template>
                    <template v-slot:placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="20"
                        />
                      </div>
                    </template>
                  </v-img>

                  <div class="pa-2" style="height: 80px">
                    <div
                      class="text-white font-weight-medium mb-1"
                      style="
                        font-size: 11px;
                        line-height: 1.2;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        -webkit-box-orient: vertical;
                      "
                    >
                      {{ similarProduct.name }}
                    </div>

                    <div
                      class="text-primary font-weight-bold"
                      style="font-size: 10px"
                    >
                      <span
                        v-if="similarProduct.discount > 0"
                        class="d-flex align-center gap-1 flex-wrap"
                      >
                        <span>{{
                          formatPrice(
                            calculateDiscountedPrice(
                              similarProduct.price,
                              similarProduct.discount
                            )
                          )
                        }}</span>
                        <span
                          class="text-red text-decoration-line-through"
                          style="font-size: 9px"
                        >
                          {{ formatPrice(similarProduct.price) }}
                        </span>
                      </span>
                      <span v-else>
                        {{ formatPrice(similarProduct.price) }}
                      </span>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-row v-else>
              <v-col cols="12" class="text-center">
                <div class="text-grey-lighten-1">
                  <v-icon size="48" color="grey">mdi-package-variant</v-icon>
                  <div class="mt-2">Tidak ada produk serupa ditemukan</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axiosInstance from "@/utils/axiosInstance";
import { useImageHandler } from '@/composables/useImageHandler';
import {
  formatPrice,
  calculateDiscountedPrice,
} from "@/utils/formatters";
import { useAnalytics } from "../composables/useAnalytics";

const router = useRouter();
const route = useRoute();
const { trackProductClick } = useAnalytics();

// 🆕 Initialize image handler composable
const {
  altImageUrl,
  getImageOrAlt,
  shouldUseAltImage,
  markImageAsFailed,
  handleImageError: handleImageErrorComposable,
  getMainImageUrl,
  getAllImagesUrls,
  clearFailedImages,
  failedImages,
  getAvailableAssetImages,
  getImportedImageUrls
} = useImageHandler();

// 🆕 Debug: Log available images on component mount
onMounted(() => {
  console.log('Available asset images:', getAvailableAssetImages());
  console.log('Imported image URLs:', getImportedImageUrls());
});

const currentImageIndex = ref(0);
const product = ref<any>(null);
const transitionName = ref("slide-right");
const loading = ref(true);

// Similar products state
const similarProducts = ref<any[]>([]);
const similarProductsLoading = ref(false);

// Touch/Swipe gesture variables
const touchStartX = ref(0);
const touchStartY = ref(0);
const isDragging = ref(false);
const isMouseDown = ref(false);

// API function untuk fetch product detail
const fetchProductDetail = async (productId: string) => {
  try {
    loading.value = true;
    console.log("🔍 Fetching product detail for ID:", productId);

    const response = await axiosInstance.get(`/products/${productId}`);
    console.log("✅ Product detail response:", response.data);

    const productData = response.data.data || response.data;

    if (!productData) {
      console.warn("⚠️ No product data received from API");
      product.value = null;
      return;
    }

    // Sort assets by order untuk menampilkan gambar sesuai urutan
    if (productData.assets && Array.isArray(productData.assets)) {
      productData.assets.sort(
        (a: any, b: any) => (a.order || 0) - (b.order || 0)
      );
      console.log("🖼️ Sorted assets:", productData.assets.length, "images");

      // Log semua URL gambar untuk debugging
      productData.assets.forEach((asset: any, index: number) => {
        const imageUrl = getImageOrAlt(asset.url);
        console.log(`📷 Asset ${index + 1}:`, {
          originalUrl: asset.url,
          finalUrl: imageUrl,
          order: asset.order,
          alt: asset.alt,
        });
      });
    } else {
      // Jika tidak ada assets, buat array kosong
      productData.assets = [];
      console.log("📷 No assets found for this product");
    }

    product.value = productData;
    console.log("✅ Product loaded successfully:", {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      category: product.value.category,
      categoryName: product.value.category?.category,
      assetsCount: product.value.assets?.length || 0,
      description: product.value.description ? "Present" : "Missing",
      specification: product.value.specification ? "Present" : "Missing",
    });

    // Auto-scroll ke thumbnail pertama setelah data dimuat
    if (product.value.assets && product.value.assets.length > 1) {
      setTimeout(() => {
        scrollToActiveThumbnail(0);
      }, 200);
    }

    // Fetch similar products setelah product utama berhasil dimuat
    if (product.value) {
      fetchSimilarProducts(
        product.value.id,
        product.value.category_id,
        product.value.name
      );
    }
  } catch (error: any) {
    console.error("❌ Error fetching product detail:", {
      productId,
      status: error.response?.status,
      message: error.message,
      endpoint: `/products/${productId}`,
    });

    // Set product to null to show error state
    product.value = null;
  } finally {
    loading.value = false;
  }
};

// API function untuk fetch similar products
const fetchSimilarProducts = async (
  currentProductId: string,
  categoryId: string,
  productName: string
) => {
  try {
    similarProductsLoading.value = true;
    console.log("🔍 Fetching similar products for category:", categoryId);

    // Fetch products dari kategori yang sama
    const response = await axiosInstance.get("/products/catalog", {
      params: {
        category: categoryId,
        limit: 10, // Ambil lebih banyak untuk filter
      },
    });

    let products = response.data.data || response.data || [];

    // Filter out produk saat ini
    products = products.filter((p: any) => p.id !== currentProductId);

    // Jika tidak cukup produk dari kategori yang sama, ambil produk random
    if (products.length < 5) {
      console.log(
        "🎲 Not enough products in same category, fetching random products"
      );

      try {
        const randomResponse = await axiosInstance.get("/products/catalog", {
          params: {
            limit: 15, // Ambil lebih banyak untuk filter dan randomize
          },
        });

        let randomProducts =
          randomResponse.data.data || randomResponse.data || [];

        // Filter out produk saat ini dan produk yang sudah ada
        const existingIds = new Set(products.map((p: any) => p.id));
        randomProducts = randomProducts.filter(
          (p: any) => p.id !== currentProductId && !existingIds.has(p.id)
        );

        // Shuffle array untuk randomness
        for (let i = randomProducts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [randomProducts[i], randomProducts[j]] = [
            randomProducts[j],
            randomProducts[i],
          ];
        }

        // Gabungkan dengan produk kategori yang sama
        products = [...products, ...randomProducts];
      } catch (randomError) {
        console.warn("⚠️ Error fetching random products:", randomError);
      }
    }

    // Ambil hanya 5 produk pertama
    similarProducts.value = products.slice(0, 5);

    console.log("✅ Similar products loaded:", {
      count: similarProducts.value.length,
      categoryProducts: products.filter(
        (p: any) => p.category_id === categoryId
      ).length,
      randomProducts: products.filter((p: any) => p.category_id !== categoryId)
        .length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching similar products:", error);
    similarProducts.value = [];
  } finally {
    similarProductsLoading.value = false;
  }
};

// Helper function untuk mendapatkan gambar produk serupa
const getSimilarProductImageUrl = (product: any): string => {
  return getMainImageUrl(product);
};

// Method untuk navigasi ke produk lain
const navigateToProduct = (productId: string) => {
  trackProductClick(productId);
  console.log("🔄 Navigating to product:", productId);

  // Reset state
  currentImageIndex.value = 0;
  product.value = null;
  loading.value = true;
  similarProducts.value = [];
  clearFailedImages();

  // Scroll to top immediately
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update URL
  router.push({ path: "/detail-produk", query: { id: productId } });
};

// Data produk sesuai dengan katalog - REMOVED: Sekarang hanya menggunakan data dari database

// Helper function untuk mendapatkan gambar dengan fallback
const getCurrentImageUrl = (): string => {
  if (
    !product.value ||
    !product.value.assets ||
    product.value.assets.length === 0
  ) {
    return altImageUrl.value;
  }

  const currentAsset = product.value.assets[currentImageIndex.value];
  if (!currentAsset || !currentAsset.url) {
    return altImageUrl.value;
  }

  // Cek apakah gambar ini sudah failed
  if (shouldUseAltImage(currentAsset.url)) {
    return altImageUrl.value;
  }

  return getImageOrAlt(currentAsset.url);
};

const goBack = () => {
  router.push("/katalog");
};

const previousImage = () => {
  if (product.value && product.value.assets && currentImageIndex.value > 0) {
    transitionName.value = "slide-right";
    currentImageIndex.value = currentImageIndex.value - 1;

    // Auto-scroll thumbnail ke posisi yang terlihat
    scrollToActiveThumbnail(currentImageIndex.value);
  }
};

const nextImage = () => {
  if (
    product.value &&
    product.value.assets &&
    currentImageIndex.value < product.value.assets.length - 1
  ) {
    transitionName.value = "slide-left";
    currentImageIndex.value = currentImageIndex.value + 1;

    // Auto-scroll thumbnail ke posisi yang terlihat
    scrollToActiveThumbnail(currentImageIndex.value);
  }
};

const goToImage = (index: number) => {
  if (
    product.value &&
    product.value.assets &&
    index >= 0 &&
    index < product.value.assets.length
  ) {
    transitionName.value =
      index > currentImageIndex.value ? "slide-left" : "slide-right";
    currentImageIndex.value = index;

    // Auto-scroll thumbnail ke posisi yang terlihat
    scrollToActiveThumbnail(index);
  }
};

// Function untuk auto-scroll thumbnail gallery agar thumbnail aktif selalu terlihat
const scrollToActiveThumbnail = (activeIndex: number) => {
  // Tunggu sedikit untuk memastikan DOM sudah terupdate
  setTimeout(() => {
    const thumbnailContainer = document.querySelector(
      ".thumbnail-scroll-fixed"
    ) as HTMLElement;
    const activeThumbnail = document.querySelector(
      `.thumbnail-card-fixed:nth-child(${activeIndex + 1})`
    ) as HTMLElement;

    if (thumbnailContainer && activeThumbnail) {
      // Hitung posisi relatif thumbnail dalam container
      const thumbnailLeft = activeThumbnail.offsetLeft;
      const thumbnailWidth = activeThumbnail.offsetWidth;
      const containerScrollLeft = thumbnailContainer.scrollLeft;
      const containerWidth = thumbnailContainer.clientWidth;

      // Tentukan apakah thumbnail perlu di-scroll
      const isVisible =
        thumbnailLeft >= containerScrollLeft &&
        thumbnailLeft + thumbnailWidth <= containerScrollLeft + containerWidth;

      if (!isVisible) {
        // Scroll agar thumbnail berada di tengah container
        const targetScrollLeft =
          thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;

        // Smooth scroll ke posisi target
        thumbnailContainer.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth",
        });

        console.log(
          "🔄 Auto-scrolling thumbnail gallery to show active thumbnail:",
          activeIndex + 1
        );
      }
    }
  }, 100); // Delay 100ms untuk memastikan DOM update
};

// Touch gesture handlers
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  isDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX.value;
  const deltaY = touchEndY - touchStartY.value;

  // Only trigger swipe if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (product.value && product.value.assets) {
      if (deltaX > 0 && currentImageIndex.value > 0) {
        // Swipe right - go to previous image (only if not at first image)
        previousImage();
      } else if (
        deltaX < 0 &&
        currentImageIndex.value < product.value.assets.length - 1
      ) {
        // Swipe left - go to next image (only if not at last image)
        nextImage();
      }
    }
  }

  isDragging.value = false;
};

// Mouse gesture handlers (for desktop)
const handleMouseDown = (e: MouseEvent) => {
  touchStartX.value = e.clientX;
  touchStartY.value = e.clientY;
  isMouseDown.value = true;
  isDragging.value = true;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseDown.value || !isDragging.value) return;
  e.preventDefault();
};

const handleMouseUp = (e: MouseEvent) => {
  if (!isMouseDown.value || !isDragging.value) return;

  const deltaX = e.clientX - touchStartX.value;
  const deltaY = e.clientY - touchStartY.value;

  // Only trigger swipe if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    if (product.value && product.value.assets) {
      if (deltaX > 0 && currentImageIndex.value > 0) {
        // Drag right - go to previous image (only if not at first image)
        previousImage();
      } else if (
        deltaX < 0 &&
        currentImageIndex.value < product.value.assets.length - 1
      ) {
        // Drag left - go to next image (only if not at last image)
        nextImage();
      }
    }
  }

  isMouseDown.value = false;
  isDragging.value = false;
};

// Watch untuk perubahan route query
watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      console.log("🔄 Route changed, fetching new product:", newId);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset state
      currentImageIndex.value = 0;
      product.value = null;
      loading.value = true;
      similarProducts.value = [];
      failedImages.value.clear();

      // Fetch data baru
      fetchProductDetail(newId as string);
    }
  }
);

onMounted(() => {
  console.log("Detail produk mounted");
  console.log("Route params:", route.params);

  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: "auto" });

  // Get product ID from query parameter
  const queryId = route.query.id as string;
  const paramId = (route.params as any).id as string;

  let productId: string;

  if (paramId) {
    productId = paramId;
    console.log("Using param ID:", productId);
  } else if (queryId) {
    productId = queryId;
    console.log("Using query ID:", productId);
  } else {
    productId = "1";
    console.log("Using default ID:", productId);
  }

  // Fetch product data from API
  if (productId) {
    fetchProductDetail(productId);
  }
});
</script>

<style scoped>
.black-background {
  background-color: #000000 !important;
  min-height: 100vh;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.v-main {
  background-color: #000000 !important;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.v-container {
  overflow-x: hidden; /* Prevent horizontal scroll */
}

/* Hide all scrollbars globally for this page */
.v-app {
  overflow-x: hidden !important;
}

/* Ensure no horizontal overflow on rows and columns */
.v-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.v-col {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.position-absolute {
  position: absolute !important;
}

.left-arrow {
  left: 20px;
}

.right-arrow {
  right: 20px;
}

/* Image transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Fallback slide-fade transition */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-image {
  transition: transform 0.3s ease;
}

.gallery-card {
  cursor: grab;
  user-select: none;
}

.gallery-card:active {
  cursor: grabbing;
}

.gallery-card .v-btn {
  transition: opacity 0.3s ease, transform 0.2s ease, visibility 0.3s ease;
}

.gallery-card:hover .v-btn {
  opacity: 1;
  transform: scale(1.1);
}

.gallery-card .v-btn:hover {
  transform: scale(1.2);
}

/* Hide buttons with smooth transition */
.left-arrow,
.right-arrow {
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease;
}

/* Navigation dots */
.navigation-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-button {
  min-width: 12px !important;
  width: 12px !important;
  height: 12px !important;
  padding: 0 !important;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.dot-button:hover .dot {
  opacity: 1;
  transform: scale(1.2);
}

/* Image counter styling */
.image-counter {
  backdrop-filter: blur(4px);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.image-counter:hover {
  transform: scale(1.05);
}

.image-counter .v-chip {
  background: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 12px !important;
  font-weight: 600 !important;
  min-height: 24px !important;
  padding: 0 8px !important;
  transition: all 0.2s ease;
}

/* Responsive counter */
@media (max-width: 600px) {
  .image-counter {
    bottom: 10px !important;
    right: 10px !important;
  }

  .image-counter .v-chip {
    font-size: 11px !important;
    min-height: 20px !important;
    padding: 0 6px !important;
  }
}

/* Custom scrollbar for dark theme - HIDDEN */
::-webkit-scrollbar {
  width: 0px; /* Remove vertical scrollbar */
  height: 0px; /* Remove horizontal scrollbar */
  background: transparent; /* Make scrollbar invisible */
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: transparent;
}

::-webkit-scrollbar-thumb:hover {
  background: transparent;
}

/* Firefox scrollbar hiding */
* {
  scrollbar-width: none; /* Firefox */
}

/* IE/Edge scrollbar hiding */
* {
  -ms-overflow-style: none; /* IE and Edge */
}

/* Ensure smooth scrolling without visible scrollbars */
html,
body {
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Gallery card optimizations */
.gallery-card {
  overflow: hidden !important;
  max-width: 100%;
}

/* Specifications Card Styling */
.specifications-card {
  max-height: 297.5px; /* Same height as image gallery container */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.specifications-content {
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.specifications-content::-webkit-scrollbar {
  width: 6px;
}

.specifications-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.specifications-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.specifications-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main-image-container {
  width: 100%;
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  transition: transform 0.3s ease;
  margin: 0 auto;
  display: block;
}

.gallery-card {
  cursor: grab;
  user-select: none;
}

.gallery-card:active {
  cursor: grabbing;
}

.gallery-card .v-btn {
  transition: opacity 0.3s ease, transform 0.2s ease, visibility 0.3s ease;
}

.gallery-card:hover .v-btn {
  opacity: 1;
  transform: scale(1.1);
}

.gallery-card .v-btn:hover {
  transform: scale(1.2);
}

/* Hide buttons with smooth transition */
.left-arrow,
.right-arrow {
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease;
}

/* Remove navigation dots styles - no longer needed */
.navigation-dots {
  display: none;
}

.dot-button {
  display: none;
}

.dot {
  display: none;
}

/* 🛍️ THUMBNAIL GALLERY STYLES - Fixed Section at Bottom */
.thumbnail-gallery-section {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  padding: 12px;
  min-height: 80px;
  max-height: 80px;
  overflow: hidden;
}

.thumbnail-container-fixed {
  width: 100%;
  height: 100%;
  position: relative;
}

.thumbnail-scroll-fixed {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0;
  height: 100%;
  align-items: center;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.thumbnail-scroll-fixed::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.thumbnail-card-fixed {
  position: relative;
  border-radius: 8px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
  background-color: white;
  flex-shrink: 0;
  min-width: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-card-fixed:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(25, 118, 210, 0.5);
}

.thumbnail-active-fixed {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 1px #1976d2, 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transform: translateY(-1px);
  background-color: rgba(25, 118, 210, 0.05) !important;
}

.thumbnail-active-fixed:hover {
  transform: translateY(-2px);
}

.thumbnail-image-fixed {
  transition: all 0.3s ease;
  border-radius: 6px;
}

.thumbnail-card-fixed:hover .thumbnail-image-fixed {
  transform: scale(1.05);
}

.thumbnail-overlay-fixed {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(25, 118, 210, 0.9);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  border: 1px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Mobile responsive thumbnails */
@media (max-width: 960px) {
  .thumbnail-gallery-section {
    padding: 8px;
    min-height: 70px;
    max-height: 70px;
  }

  .thumbnail-card-fixed {
    height: 50px !important;
    width: 50px !important;
    min-width: 50px !important;
  }

  .thumbnail-image-fixed {
    height: 48px !important;
    width: 48px !important;
  }

  .thumbnail-overlay-fixed {
    width: 18px;
    height: 18px;
    top: 2px;
    right: 2px;
  }

  .thumbnail-overlay-fixed .v-icon {
    font-size: 12px !important;
  }

  .thumbnail-scroll-fixed {
    gap: 6px;
  }
}

@media (max-width: 600px) {
  .thumbnail-gallery-section {
    padding: 6px;
    min-height: 60px;
    max-height: 60px;
  }

  .thumbnail-card-fixed {
    height: 45px !important;
    width: 45px !important;
    min-width: 45px !important;
  }

  .thumbnail-image-fixed {
    height: 43px !important;
    width: 43px !important;
  }

  .thumbnail-overlay-fixed {
    width: 16px;
    height: 16px;
    top: 2px;
    right: 2px;
  }

  .thumbnail-overlay-fixed .v-icon {
    font-size: 10px !important;
  }

  .thumbnail-scroll-fixed {
    gap: 4px;
  }

  .main-image-container {
    padding: 15px;
  }
}

/* Enhanced hover effects for thumbnails */
.thumbnail-card-fixed::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(25, 118, 210, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  pointer-events: none;
}

.thumbnail-card-fixed:hover::before {
  opacity: 1;
}

.thumbnail-active-fixed::before {
  opacity: 0.2;
}

/* 🛍️ SIMILAR PRODUCTS STYLES */
.product-card-similar {
  background-color: #222 !important;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card-similar:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.product-card-similar .v-card-title {
  font-size: 11px !important;
  line-height: 1.2 !important;
  padding: 8px !important;
  min-height: 40px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card-similar .v-card-subtitle {
  font-size: 10px !important;
  padding: 4px 8px !important;
}

.product-card-similar .v-img {
  border-radius: 8px 8px 0 0;
}

/* Responsive similar products */
@media (max-width: 960px) {
  .product-card-similar {
    height: 180px !important;
  }

  .product-card-similar .v-img {
    height: 100px !important;
  }

  .product-card-similar .v-card-title {
    font-size: 10px !important;
    min-height: 36px !important;
    padding: 6px !important;
  }

  .product-card-similar .v-card-subtitle {
    font-size: 9px !important;
    padding: 3px 6px !important;
  }
}

@media (max-width: 600px) {
  .product-card-similar {
    height: 160px !important;
  }

  .product-card-similar .v-img {
    height: 90px !important;
  }

  .product-card-similar .v-card-title {
    font-size: 9px !important;
    min-height: 32px !important;
    padding: 4px !important;
  }

  .product-card-similar .v-card-subtitle {
    font-size: 8px !important;
    padding: 2px 4px !important;
  }
}

/* Single line layout adjustments */
.product-card-similar .v-card-title,
.product-card-similar .v-card-subtitle {
  white-space: normal !important;
  overflow: hidden;
}

/* Text formatting for descriptions with line breaks */
.description-text,
.specification-detail-text {
  white-space: pre-line; /* Preserve line breaks and spaces */
  line-height: 1.6;
  word-wrap: break-word;
}

.description-text {
  font-size: 14px;
}

.specification-detail-text {
  font-size: 14px;
  line-height: 1.6;
}

/* Mobile responsive text */
@media (max-width: 600px) {
  .description-text,
  .specification-detail-text {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* Ensure main product image is perfectly centered */
.main-image-container .v-img {
  margin: 0 auto;
  display: block;
}

.main-image-container .v-img__img {
  object-position: center center;
}
</style>
