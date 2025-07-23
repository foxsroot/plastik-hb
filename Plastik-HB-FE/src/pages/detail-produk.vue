<template>
  <v-app class="black-background">
    <!-- Main Content -->
    <v-main class="black-background">
      <v-container v-if="!product" fluid class="pa-8 text-center">
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
              height="400"
              class="d-flex align-center justify-center position-relative overflow-hidden gallery-card"
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
                v-show="currentImageIndex > 0"
                icon 
                color="black"
                class="position-absolute left-arrow"
                style="left: 20px; z-index: 3;"
                @click="previousImage"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              
              <v-btn 
                v-show="currentImageIndex < product.images.length - 1"
                icon 
                color="black"
                class="position-absolute right-arrow"
                style="right: 20px; z-index: 3;"
                @click="nextImage"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>

              <!-- Image with Transition -->
              <div class="image-container">
                <transition :name="transitionName" mode="out-in">
                  <v-img
                    :key="currentImageIndex"
                    :src="product.images[currentImageIndex]"
                    height="350"
                    width="350"
                    contain
                    class="product-image"
                  />
                </transition>
              </div>

              <!-- Image Counter (Bottom Right) -->
              <div 
                class="position-absolute image-counter"
                style="bottom: 15px; right: 15px; z-index: 4;"
              >
                <v-chip 
                  color="rgba(0,0,0,0.8)" 
                  size="small" 
                  class="text-white font-weight-bold"
                  variant="elevated"
                >
                  {{ currentImageIndex + 1 }}/{{ product.images.length }}
                </v-chip>
              </div>

              <!-- Navigation Dots (Bottom Center) -->
              <div 
                v-if="product.images.length > 1"
                class="position-absolute navigation-dots"
                style="bottom: 15px; left: 50%; transform: translateX(-50%); z-index: 3;"
              >
                <v-btn
                  v-for="(image, index) in product.images"
                  :key="index"
                  :color="currentImageIndex === index ? 'white' : 'grey'"
                  size="x-small"
                  icon
                  variant="flat"
                  class="ma-1 dot-button"
                  @click="goToImage(index)"
                >
                  <div class="dot"></div>
                </v-btn>
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
                <span class="font-weight-medium text-primary">Rp {{ formatPrice(product.price) }}</span>
              </div>

              <!-- Product Specifications -->
              <v-card 
                color="grey-darken-4" 
                class="pa-4 specifications-card"
                outlined
              >
                <h3 class="text-white mb-3">Spesifikasi Produk</h3>
                <div class="text-white specifications-content">
                  <p><strong>Material:</strong> {{ product.specifications.material }}</p>
                  <p><strong>Dimensi:</strong> {{ product.specifications.dimensions }}</p>
                  <p><strong>Berat:</strong> {{ product.specifications.weight }}</p>
                  <p><strong>Warna:</strong> {{ product.specifications.colors }}</p>
                  
                  <!-- Additional specifications jika ada -->
                  <template v-if="product.specifications.components">
                    <h4 class="text-white mt-3 mb-2">Komponen:</h4>
                    <ul class="text-white">
                      <li v-for="component in product.specifications.components" :key="component">
                        {{ component }}
                      </li>
                    </ul>
                  </template>

                  <template v-if="product.specifications.features">
                    <h4 class="text-white mt-3 mb-2">Fitur:</h4>
                    <ul class="text-white">
                      <li v-for="feature in product.specifications.features" :key="feature">
                        {{ feature }}
                      </li>
                    </ul>
                  </template>

                  <template v-if="product.specifications.setContents">
                    <h4 class="text-white mt-3 mb-2">Isi Set:</h4>
                    <ul class="text-white">
                      <li v-for="content in product.specifications.setContents" :key="content">
                        {{ content }}
                      </li>
                    </ul>
                  </template>

                  <template v-if="product.specifications.specifications_detail">
                    <h4 class="text-white mt-3 mb-2">Detail Spesifikasi:</h4>
                    <ul class="text-white">
                      <li v-for="spec in product.specifications.specifications_detail" :key="spec">
                        {{ spec }}
                      </li>
                    </ul>
                  </template>

                  <template v-if="product.specifications.warranty">
                    <p class="mt-3"><strong>Garansi:</strong> {{ product.specifications.warranty }}</p>
                  </template>

                  <template v-if="product.specifications.certification">
                    <p><strong>Sertifikasi:</strong> {{ product.specifications.certification }}</p>
                  </template>

                  <template v-if="product.specifications.maintenance">
                    <p><strong>Perawatan:</strong> {{ product.specifications.maintenance }}</p>
                  </template>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>

        <!-- Product Description -->
        <v-row class="mt-8">
          <v-col cols="12">
            <v-card 
              color="grey-darken-4" 
              class="pa-6"
              outlined
            >
              <h3 class="text-white mb-4">Deskripsi Produk</h3>
              <div class="text-white">
                <p>{{ product.description }}</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentImageIndex = ref(0)
const product = ref<any>(null)
const transitionName = ref('slide-right')

// Touch/Swipe gesture variables
const touchStartX = ref(0)
const touchStartY = ref(0)
const isDragging = ref(false)
const isMouseDown = ref(false)

// Data produk sesuai dengan katalog (10 produk dengan multiple images)
const dummyProducts = [
  {
    id: 1,
    name: 'Nama Barang 1',
    price: 94882,
    category: 'Kategori 1',
    images: [
      'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Produk+1+Img+1',
      'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Produk+1+Img+2',
      'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Produk+1+Img+3',
      'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Produk+1+Img+4'
    ],
    specifications: {
      material: 'Plastik ABS berkualitas tinggi',
      dimensions: '25cm x 15cm x 10cm',
      weight: '350g',
      colors: 'Transparan, Biru, Hijau',
      features: [
        'Tahan suhu hingga 80°C',
        'BPA Free dan food grade',
        'Anti slip base',
        'Mudah dibersihkan',
        'Stackable design'
      ],
      warranty: '2 tahun garansi resmi',
      certification: 'SNI, FDA approved'
    },
    description: 'Produk plastik berkualitas tinggi dengan desain modern dan fungsional untuk kebutuhan sehari-hari. Tahan lama dan mudah dibersihkan.'
  },
  {
    id: 2,
    name: 'Nama Barang 2',
    price: 27501,
    category: 'Kategori 2',
    images: [
      'https://via.placeholder.com/400x400/FFEAA7/333333?text=Produk+2+Img+1',
      'https://via.placeholder.com/400x400/DDA0DD/333333?text=Produk+2+Img+2',
      'https://via.placeholder.com/400x400/98D8C8/333333?text=Produk+2+Img+3'
    ],
    specifications: {
      material: 'Tritan BPA Free',
      dimensions: '7cm x 7cm x 25cm',
      weight: '180g',
      colors: 'Merah, Biru, Hitam, Pink'
    },
    description: 'Produk dengan desain ergonomis dan anti tumpah, cocok untuk aktivitas sehari-hari. Material food grade yang aman.'
  },
  {
    id: 3,
    name: 'Nama Barang 3',
    price: 76609,
    category: 'Kategori 1',
    images: [
      'https://via.placeholder.com/400x400/74B9FF/FFFFFF?text=Produk+3+Img+1',
      'https://via.placeholder.com/400x400/0984E3/FFFFFF?text=Produk+3+Img+2',
      'https://via.placeholder.com/400x400/6C5CE7/FFFFFF?text=Produk+3+Img+3',
      'https://via.placeholder.com/400x400/A29BFE/FFFFFF?text=Produk+3+Img+4',
      'https://via.placeholder.com/400x400/FD79A8/FFFFFF?text=Produk+3+Img+5'
    ],
    specifications: {
      material: 'Melamin Food Grade',
      dimensions: 'Berbagai ukuran (8cm-20cm)',
      weight: '1.2kg (set)',
      colors: 'Multicolor (6 warna)',
      setContents: [
        'Bowl besar: 20cm x 8cm',
        'Bowl sedang: 15cm x 6cm', 
        'Bowl kecil: 10cm x 4cm',
        'Piring besar: 18cm',
        'Piring kecil: 12cm',
        'Sendok dan garpu set'
      ],
      features: [
        'Tahan pecah dan anti slip',
        'Microwave safe (tanpa logam)',
        'Dishwasher safe',
        'Tidak mudah tergores',
        'Ramah lingkungan'
      ],
      warranty: '1 tahun garansi',
      maintenance: 'Cuci dengan air hangat dan sabun lembut'
    },
    description: 'Set lengkap dengan berbagai ukuran, terbuat dari bahan berkualitas tinggi yang tahan pecah. Cocok untuk keluarga.'
  },
  {
    id: 4,
    name: 'Nama Barang 4',
    price: 48140,
    category: 'Kategori 2',
    images: [
      'https://via.placeholder.com/400x400/00B894/FFFFFF?text=Produk+4+Img+1',
      'https://via.placeholder.com/400x400/00CEC9/FFFFFF?text=Produk+4+Img+2',
      'https://via.placeholder.com/400x400/55A3FF/FFFFFF?text=Produk+4+Img+3'
    ],
    specifications: {
      material: 'ABS + Stainless Steel',
      dimensions: '25cm x 17cm x 32cm',
      weight: '1.8kg',
      colors: 'Silver, Hitam'
    },
    description: 'Produk dengan teknologi sensor otomatis yang responsif dan hemat energi. Desain modern dan minimalis.'
  },
  {
    id: 5,
    name: 'Nama Barang 5',
    price: 41885,
    category: 'Kategori 1',
    images: [
      'https://via.placeholder.com/400x400/E17055/FFFFFF?text=Produk+5+Img+1',
      'https://via.placeholder.com/400x400/F39C12/FFFFFF?text=Produk+5+Img+2',
      'https://via.placeholder.com/400x400/E74C3C/FFFFFF?text=Produk+5+Img+3',
      'https://via.placeholder.com/400x400/9B59B6/FFFFFF?text=Produk+5+Img+4'
    ],
    specifications: {
      material: 'Polypropylene (PP)',
      dimensions: '60cm x 30cm x 85cm',
      weight: '3.5kg',
      colors: 'Putih, Coklat, Abu-abu',
      components: [
        'Panel samping modular',
        'Shelf adjustable (4 tingkat)',
        'Pintu dengan magnetic lock',
        'Ventilasi udara atas-bawah',
        'Base stabilizer'
      ],
      features: [
        'Modular assembly system',
        'Tool-free installation',
        'Adjustable shelf height',
        'Anti-dust design',
        'Load capacity 50kg per shelf',
        'Earthquake resistant base',
        'Easy maintenance',
        'Space efficient design'
      ],
      specifications_detail: [
        'Shelf capacity: 4 adjustable levels',
        'Load per shelf: 50kg max',
        'Door type: Sliding magnetic',
        'Ventilation: Top & bottom air flow',
        'Assembly time: 30 minutes',
        'Required space: 65cm x 35cm x 90cm'
      ],
      warranty: '5 tahun garansi struktur',
      certification: 'JIS standards, Earthquake test passed',
      maintenance: 'Bersihkan dengan kain lembab, hindari bahan kimia keras'
    },
    description: 'Sistem modular yang mudah dirakit dengan konstruksi kokoh dan ventilasi yang baik. Ideal untuk penyimpanan.'
  },
  {
    id: 6,
    name: 'Nama Barang 6',
    price: 3838,
    category: 'Kategori 2',
    images: [
      'https://via.placeholder.com/400x400/2ECC71/FFFFFF?text=Produk+6+Img+1',
      'https://via.placeholder.com/400x400/27AE60/FFFFFF?text=Produk+6+Img+2'
    ],
    specifications: {
      material: 'Silikon Food Grade',
      dimensions: '15cm x 10cm x 5cm',
      weight: '120g',
      colors: 'Hijau, Biru, Orange'
    },
    description: 'Produk silikon fleksibel dan tahan panas, cocok untuk berbagai keperluan dapur. Anti lengket dan mudah dibersihkan.'
  },
  {
    id: 7,
    name: 'Nama Barang 7',
    price: 88900,
    category: 'Kategori 1',
    images: [
      'https://via.placeholder.com/400x400/3498DB/FFFFFF?text=Produk+7+Img+1',
      'https://via.placeholder.com/400x400/2980B9/FFFFFF?text=Produk+7+Img+2',
      'https://via.placeholder.com/400x400/1ABC9C/FFFFFF?text=Produk+7+Img+3',
      'https://via.placeholder.com/400x400/16A085/FFFFFF?text=Produk+7+Img+4'
    ],
    specifications: {
      material: 'Kaca Tempered + Plastik',
      dimensions: '30cm x 20cm x 15cm',
      weight: '2.1kg',
      colors: 'Transparan, Biru Muda',
      components: [
        'Kaca tempered 8mm thickness',
        'Frame plastik reinforced',
        'Gasket karet anti bocor',
        'Handle ergonomis',
        'Safety corner protector'
      ],
      features: [
        'Tahan suhu -20°C hingga 150°C',
        'Shatter resistant glass',
        'UV protection coating',
        'Scratch resistant surface',
        'Easy grip handle',
        'Stackable when not in use',
        'Chemical resistant',
        'Crystal clear visibility',
        'Leak proof seal'
      ],
      specifications_detail: [
        'Glass thickness: 8mm tempered',
        'Max temperature: 150°C',
        'Min temperature: -20°C',
        'Capacity: 2.8 Liter',
        'Handle load: 15kg max',
        'Drop test: passed from 1m height'
      ],
      warranty: '10 tahun garansi kaca, 3 tahun parts',
      certification: 'ISO 9001, Heat resistant certified',
      maintenance: 'Cuci dengan air hangat, hindari perubahan suhu ekstrem'
    },
    description: 'Kombinasi kaca tempered dan plastik berkualitas untuk daya tahan maksimal. Desain elegan dan fungsional.'
  },
  {
    id: 8,
    name: 'Nama Barang 8',
    price: 8013,
    category: 'Kategori 2',
    images: [
      'https://via.placeholder.com/400x400/F1C40F/333333?text=Produk+8+Img+1',
      'https://via.placeholder.com/400x400/F39C12/FFFFFF?text=Produk+8+Img+2',
      'https://via.placeholder.com/400x400/E67E22/FFFFFF?text=Produk+8+Img+3'
    ],
    specifications: {
      material: 'Plastik PP Daur Ulang',
      dimensions: '20cm x 15cm x 8cm',
      weight: '250g',
      colors: 'Kuning, Orange, Merah'
    },
    description: 'Produk ramah lingkungan dari plastik daur ulang. Ringan namun kuat, cocok untuk berbagai aktivitas outdoor.'
  },
  {
    id: 9,
    name: 'Nama Barang 9',
    price: 79307,
    category: 'Kategori 1',
    images: [
      'https://via.placeholder.com/400x400/9B59B6/FFFFFF?text=Produk+9+Img+1',
      'https://via.placeholder.com/400x400/8E44AD/FFFFFF?text=Produk+9+Img+2',
      'https://via.placeholder.com/400x400/E91E63/FFFFFF?text=Produk+9+Img+3',
      'https://via.placeholder.com/400x400/AD1457/FFFFFF?text=Produk+9+Img+4'
    ],
    specifications: {
      material: 'Akrilik Premium',
      dimensions: '35cm x 25cm x 12cm',
      weight: '800g',
      colors: 'Ungu, Pink, Biru'
    },
    description: 'Material akrilik premium dengan kejernihan tinggi. Tahan goresan dan mudah perawatan untuk penggunaan jangka panjang.'
  },
  {
    id: 10,
    name: 'Nama Barang 10',
    price: 95016,
    category: 'Kategori 2',
    images: [
      'https://via.placeholder.com/400x400/34495E/FFFFFF?text=Produk+10+Img+1',
      'https://via.placeholder.com/400x400/2C3E50/FFFFFF?text=Produk+10+Img+2',
      'https://via.placeholder.com/400x400/95A5A6/333333?text=Produk+10+Img+3',
      'https://via.placeholder.com/400x400/7F8C8D/FFFFFF?text=Produk+10+Img+4',
      'https://via.placeholder.com/400x400/BDC3C7/333333?text=Produk+10+Img+5'
    ],
    specifications: {
      material: 'Stainless Steel + Plastik',
      dimensions: '40cm x 30cm x 25cm',
      weight: '4.2kg',
      colors: 'Silver, Hitam, Abu-abu'
    },
    description: 'Kombinasi stainless steel dan plastik berkualitas tinggi. Tahan karat, higienis, dan cocok untuk penggunaan profesional.'
  }
]

const goBack = () => {
  router.back()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const previousImage = () => {
  if (product.value && product.value.images && currentImageIndex.value > 0) {
    transitionName.value = 'slide-right'
    currentImageIndex.value = currentImageIndex.value - 1
  }
}

const nextImage = () => {
  if (product.value && product.value.images && currentImageIndex.value < product.value.images.length - 1) {
    transitionName.value = 'slide-left'
    currentImageIndex.value = currentImageIndex.value + 1
  }
}

const goToImage = (index: number) => {
  if (product.value && product.value.images && index >= 0 && index < product.value.images.length) {
    transitionName.value = index > currentImageIndex.value ? 'slide-left' : 'slide-right'
    currentImageIndex.value = index
  }
}

// Touch gesture handlers
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
}

const handleTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const deltaX = touchEndX - touchStartX.value
  const deltaY = touchEndY - touchStartY.value
  
  // Only trigger swipe if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0 && currentImageIndex.value > 0) {
      // Swipe right - go to previous image (only if not at first image)
      previousImage()
    } else if (deltaX < 0 && currentImageIndex.value < product.value.images.length - 1) {
      // Swipe left - go to next image (only if not at last image)
      nextImage()
    }
  }
  
  isDragging.value = false
}

// Mouse gesture handlers (for desktop)
const handleMouseDown = (e: MouseEvent) => {
  touchStartX.value = e.clientX
  touchStartY.value = e.clientY
  isMouseDown.value = true
  isDragging.value = true
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseDown.value || !isDragging.value) return
  e.preventDefault()
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isMouseDown.value || !isDragging.value) return
  
  const deltaX = e.clientX - touchStartX.value
  const deltaY = e.clientY - touchStartY.value
  
  // Only trigger swipe if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    if (deltaX > 0 && currentImageIndex.value > 0) {
      // Drag right - go to previous image (only if not at first image)
      previousImage()
    } else if (deltaX < 0 && currentImageIndex.value < product.value.images.length - 1) {
      // Drag left - go to next image (only if not at last image)
      nextImage()
    }
  }
  
  isMouseDown.value = false
  isDragging.value = false
}

onMounted(() => {
  console.log('Detail produk mounted')
  console.log('Route params:', route.params)
  
  // Coba ambil ID dari query parameter dulu sebagai fallback
  const queryId = route.query.id as string
  const paramId = (route.params as any).id as string
  
  let productId: number
  
  if (paramId) {
    productId = parseInt(paramId)
    console.log('Using param ID:', productId)
  } else if (queryId) {
    productId = parseInt(queryId)
    console.log('Using query ID:', productId)
  } else {
    productId = 1
    console.log('Using default ID:', productId)
  }
  
  if (productId && !isNaN(productId)) {
    setTimeout(() => {
      const foundProduct = dummyProducts.find(p => p.id === productId)
      product.value = foundProduct || dummyProducts[0]
      console.log('Loaded product:', product.value)
    }, 300)
  } else {
    setTimeout(() => {
      product.value = dummyProducts[0]
      console.log('Loaded default product:', product.value)
    }, 300)
  }
})
</script>

<style scoped>
.black-background {
  background-color: #000000 !important;
  min-height: 100vh;
}

.v-main {
  background-color: #000000 !important;
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
.left-arrow, .right-arrow {
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

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #2c2c2c;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
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
</style>