<template>
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
                    :src="product.image"
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
                  
                  <!-- Product Badge -->
                  <v-chip
                    v-if="product.badge"
                    :color="product.badgeColor || 'amber'"
                    size="small"
                    class="product-badge"
                  >
                    {{ product.badge }}
                  </v-chip>
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
                      <span v-if="product.originalPrice" class="original-price text-body-2 text-grey ml-2">
                        {{ formatPrice(product.originalPrice) }}
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
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'

interface FeaturedProduct {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  badge?: string
  badgeColor?: string
  category: string
}

// Sample featured products data
const featuredProducts = ref<FeaturedProduct[]>([
  {
    id: 1,
    name: 'Kantong Plastik HD Premium',
    description: 'Kantong plastik berkualitas tinggi untuk kebutuhan retail dan packaging',
    price: 25000,
    originalPrice: 30000,
    image: '/src/assets/products/kantong-plastik-1.jpg',
    rating: 4.8,
    badge: 'Best Seller',
    badgeColor: 'success',
    category: 'Kantong Plastik'
  },
  {
    id: 2,
    name: 'Wadah Makanan Food Grade',
    description: 'Wadah plastik food grade aman untuk makanan dan minuman',
    price: 45000,
    image: '/src/assets/products/wadah-makanan-1.jpg',
    rating: 4.9,
    badge: 'New',
    badgeColor: 'info',
    category: 'Wadah Makanan'
  },
  {
    id: 3,
    name: 'Botol Plastik 500ml',
    description: 'Botol plastik transparan untuk minuman dengan tutup rapat',
    price: 15000,
    image: '/src/assets/products/botol-plastik-1.jpg',
    rating: 4.7,
    category: 'Botol'
  },
  {
    id: 4,
    name: 'Ember Plastik Multi Fungsi',
    description: 'Ember plastik kuat dan tahan lama untuk berbagai keperluan',
    price: 75000,
    image: '/src/assets/products/ember-plastik-1.jpg',
    rating: 4.6,
    category: 'Alat Rumah Tangga'
  },
  {
    id: 5,
    name: 'Gelas Plastik Set 12pcs',
    description: 'Set gelas plastik untuk acara dan penggunaan sehari-hari',
    price: 35000,
    originalPrice: 40000,
    image: '/src/assets/products/gelas-plastik-1.jpg',
    rating: 4.5,
    badge: 'Promo',
    badgeColor: 'error',
    category: 'Peralatan Makan'
  },
  {
    id: 6,
    name: 'Kotak Penyimpanan 10L',
    description: 'Kotak penyimpanan transparan dengan tutup kedap udara',
    price: 55000,
    image: '/src/assets/products/kotak-penyimpanan-1.jpg',
    rating: 4.8,
    category: 'Penyimpanan'
  },
  {
    id: 7,
    name: 'Piring Plastik Melamin',
    description: 'Piring plastik melamin tahan pecah dan aman untuk microwave',
    price: 20000,
    image: '/src/assets/products/piring-plastik-1.jpg',
    rating: 4.4,
    category: 'Peralatan Makan'
  },
  {
    id: 8,
    name: 'Tempat Sampah 50L',
    description: 'Tempat sampah plastik dengan penutup dan roda untuk kemudahan',
    price: 125000,
    image: '/src/assets/products/tempat-sampah-1.jpg',
    rating: 4.7,
    badge: 'Eco Friendly',
    badgeColor: 'green',
    category: 'Kebersihan'
  },
  {
    id: 9,
    name: 'Sedotan Plastik Biodegradable',
    description: 'Sedotan plastik ramah lingkungan yang dapat terurai',
    price: 12000,
    image: '/src/assets/products/sedotan-plastik-1.jpg',
    rating: 4.9,
    badge: 'Eco',
    badgeColor: 'green',
    category: 'Aksesoris'
  },
  {
    id: 10,
    name: 'Keranjang Plastik Anyam',
    description: 'Keranjang plastik dengan desain anyam untuk dekorasi dan penyimpanan',
    price: 65000,
    image: '/src/assets/products/keranjang-plastik-1.jpg',
    rating: 4.6,
    category: 'Dekorasi'
  }
])

// Scroll functionality
const scrollContainer = ref<HTMLElement | null>(null)

const updateScrollPosition = () => {
  // Keep this for potential future use
}

// Product actions
const viewProductDetail = (product: FeaturedProduct) => {
  // Navigate to product detail page
  console.log('View product:', product.name)
  // router.push(`/produk/${product.id}`)
}

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

onMounted(async () => {
  await nextTick()
  updateScrollPosition()
})
</script>

<style scoped>
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  line-height: 1.4;
  min-height: 2.8em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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