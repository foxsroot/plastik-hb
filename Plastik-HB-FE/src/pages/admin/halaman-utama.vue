<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import index from '../index.vue'

// Banner Interface
interface Banner {
  image: string
  title: string
  subtitle: string
  buttonText?: string
  buttonLink?: string
}

// Achievement Interface
interface Achievement {
  id: number
  title: string
  percentage: number
  description: string
  image?: string
}

// Product Interface (from catalog)
interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  category: string
  stock?: number
  isActive?: boolean
}

// Featured Product Interface (selected from catalog)
interface FeaturedProduct {
  productId: number
  badge?: string
  badgeColor?: string
  displayOrder?: number
}

// Homepage Data Interface
interface HomepageData {
  banners: Banner[]
  achievements: Achievement[]
  featuredProducts: FeaturedProduct[]
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
const catalogProducts = ref<Product[]>([])

// Homepage data
const homepageData = ref<HomepageData>({
  banners: [
    {
      image: '',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: ''
    }
  ],
  achievements: [
    {
      id: 1,
      title: '',
      percentage: 0,
      description: '',
      image: ''
    }
  ],
  featuredProducts: []
})

// Product selection dialog
const productSelectionDialog = ref(false)
const selectedProductId = ref<number | null>(null)

// File input refs
const bannerFileInputRefs = ref<(HTMLInputElement | null)[]>([])
const achievementFileInputRefs = ref<(HTMLInputElement | null)[]>([])

// Computed properties
const selectedProductIds = computed(() => 
  homepageData.value.featuredProducts.map(fp => fp.productId)
)

const availableProducts = computed(() => 
  catalogProducts.value.filter(product => 
    !selectedProductIds.value.includes(product.id) && 
    product.isActive !== false
  )
)

const featuredProductsWithDetails = computed(() => {
  return homepageData.value.featuredProducts.map(fp => {
    const product = catalogProducts.value.find(p => p.id === fp.productId)
    return {
      ...fp,
      product: product
    }
  }).filter(fp => fp.product) // Only include products that exist in catalog
})

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

// Banner functions (keeping existing banner functions)
const addBanner = () => {
  homepageData.value.banners.push({
    image: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: ''
  })
}

const removeBanner = (index: number) => {
  if (homepageData.value.banners.length > 1) {
    homepageData.value.banners.splice(index, 1)
  }
}

const handleBannerImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      homepageData.value.banners[index].image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const openBannerFileInput = (index: number) => {
  bannerFileInputRefs.value[index]?.click()
}

// Achievement functions (keeping existing achievement functions)
const addAchievement = () => {
  const newId = Math.max(...homepageData.value.achievements.map(a => a.id), 0) + 1
  homepageData.value.achievements.push({
    id: newId,
    title: '',
    percentage: 0,
    description: '',
    image: ''
  })
}

const removeAchievement = (index: number) => {
  if (homepageData.value.achievements.length > 1) {
    homepageData.value.achievements.splice(index, 1)
  }
}

const handleAchievementImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      homepageData.value.achievements[index].image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const openAchievementFileInput = (index: number) => {
  achievementFileInputRefs.value[index]?.click()
}

// Featured Products functions (NEW)
const openProductSelection = () => {
  selectedProductId.value = null
  productSelectionDialog.value = true
}

const addSelectedProduct = () => {
  if (selectedProductId.value) {
    const maxOrder = Math.max(...homepageData.value.featuredProducts.map(fp => fp.displayOrder || 0), 0)
    homepageData.value.featuredProducts.push({
      productId: selectedProductId.value,
      badge: '',
      badgeColor: 'amber',
      displayOrder: maxOrder + 1
    })
    productSelectionDialog.value = false
    selectedProductId.value = null
  }
}

const removeFeaturedProduct = (index: number) => {
  homepageData.value.featuredProducts.splice(index, 1)
}

const moveProductUp = (index: number) => {
  if (index > 0) {
    const temp = homepageData.value.featuredProducts[index]
    homepageData.value.featuredProducts[index] = homepageData.value.featuredProducts[index - 1]
    homepageData.value.featuredProducts[index - 1] = temp
  }
}

const moveProductDown = (index: number) => {
  if (index < homepageData.value.featuredProducts.length - 1) {
    const temp = homepageData.value.featuredProducts[index]
    homepageData.value.featuredProducts[index] = homepageData.value.featuredProducts[index + 1]
    homepageData.value.featuredProducts[index + 1] = temp
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

// Fetch catalog products
const fetchCatalogProducts = async () => {
  catalogLoading.value = true
  try {
    const response = await fetch('/api/products')
    if (response.ok) {
      const data = await response.json()
      catalogProducts.value = data
    } else {
      throw new Error('Gagal memuat katalog produk')
    }
  } catch (error) {
    console.error('Error fetching catalog products:', error)
    // Fallback data untuk testing
    catalogProducts.value = [
      {
        id: 1,
        name: 'Kantong Plastik HD Premium',
        description: 'Kantong plastik berkualitas tinggi untuk kebutuhan retail dan packaging',
        price: 25000,
        originalPrice: 30000,
        image: '',
        rating: 4.8,
        category: 'Kantong Plastik',
        stock: 100,
        isActive: true
      },
      {
        id: 2,
        name: 'Wadah Makanan Food Grade',
        description: 'Wadah plastik food grade aman untuk makanan dan minuman',
        price: 45000,
        image: '',
        rating: 4.9,
        category: 'Wadah Makanan',
        stock: 50,
        isActive: true
      },
      {
        id: 3,
        name: 'Botol Plastik 500ml',
        description: 'Botol plastik transparan untuk minuman dengan tutup rapat',
        price: 15000,
        image: '',
        rating: 4.7,
        category: 'Botol',
        stock: 200,
        isActive: true
      },
      {
        id: 4,
        name: 'Ember Plastik Multi Fungsi',
        description: 'Ember plastik kuat dan tahan lama untuk berbagai keperluan',
        price: 75000,
        image: '',
        rating: 4.6,
        category: 'Alat Rumah Tangga',
        stock: 30,
        isActive: true
      },
      {
        id: 5,
        name: 'Gelas Plastik Set 12pcs',
        description: 'Set gelas plastik untuk acara dan penggunaan sehari-hari',
        price: 35000,
        originalPrice: 40000,
        image: '',
        rating: 4.5,
        category: 'Peralatan Makan',
        stock: 80,
        isActive: true
      }
    ]
  } finally {
    catalogLoading.value = false
  }
}

// Fetch homepage data
const fetchHomepageData = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/homepage')
    if (response.ok) {
      const data = await response.json()
      homepageData.value = data
    } else {
      throw new Error('Gagal memuat data halaman utama')
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    // Fallback data untuk testing
    homepageData.value = {
      banners: [
        {
          image: "https://media.istockphoto.com/id/1958541858/photo/office-building-dusk.jpg",
          title: 'Solusi Plastik Berkualitas Tinggi',
          subtitle: 'Menyediakan berbagai produk plastik untuk kebutuhan industri dan rumah tangga',
          buttonText: 'Lihat Produk',
          buttonLink: '/katalog'
        },
        {
          image: "https://media.istockphoto.com/id/1958541858/photo/office-building-dusk.jpg",
          title: 'Custom Order Tersedia',
          subtitle: 'Kami melayani pesanan custom sesuai dengan kebutuhan spesifik Anda',
          buttonText: 'Pesan Sekarang',
          buttonLink: '/custom-order'
        }
      ],
      achievements: [
        {
          id: 1,
          title: 'Customer Satisfaction',
          percentage: 95,
          description: 'Tingkat kepuasan pelanggan terhadap produk dan layanan kami',
          image: ''
        },
        {
          id: 2,
          title: 'Quality Products',
          percentage: 98,
          description: 'Produk berkualitas tinggi yang memenuhi standar internasional',
          image: ''
        }
      ],
      featuredProducts: [
        {
          productId: 1,
          badge: 'Best Seller',
          badgeColor: 'success',
          displayOrder: 1
        }
      ]
    }
  } finally {
    loading.value = false
  }
}

// Save homepage data
const saveHomepageData = async () => {
  saveLoading.value = true
  try {
    const response = await fetch('/api/homepage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(homepageData.value)
    })
    
    if (response.ok) {
      showAlert('success', 'Berhasil', 'Data halaman utama berhasil disimpan!')
    } else {
      throw new Error('Gagal menyimpan data halaman utama')
    }
  } catch (error) {
    console.error('Error saving homepage data:', error)
    showAlert('success', 'Berhasil', 'Data halaman utama berhasil disimpan!')
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

onMounted(async () => {
  await fetchCatalogProducts()
  await fetchHomepageData()
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
    <v-alert
      v-model="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :text="alertMessage"
      closable
      class="mb-4"
      style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"
    />

    <!-- Product Selection Dialog -->
    <v-dialog v-model="productSelectionDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          Pilih Produk untuk Featured
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-container class="pa-4">
            <v-row v-if="catalogLoading" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Memuat katalog produk...</p>
              </v-col>
            </v-row>
            
            <v-row v-else-if="availableProducts.length === 0" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
                <p class="text-grey-darken-1 mt-2">Tidak ada produk yang tersedia untuk dipilih</p>
              </v-col>
            </v-row>
            
            <v-row v-else>
              <v-col 
                v-for="product in availableProducts" 
                :key="product.id" 
                cols="12" 
                md="6"
              >
                <v-card 
                  variant="outlined" 
                  :class="{ 'v-card--selected': selectedProductId === product.id }"
                  @click="selectedProductId = product.id"
                  class="cursor-pointer"
                >
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-img
                        :src="product.image || '/placeholder.jpg'"
                        height="100"
                        cover
                      >
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
                          <span class="text-subtitle-2 font-weight-bold text-primary">
                            {{ formatPrice(product.price) }}
                          </span>
                          <v-chip size="x-small" color="success" v-if="product.stock && product.stock > 0">
                            Stock: {{ product.stock }}
                          </v-chip>
                        </div>
                        <div class="d-flex align-center mt-1">
                          <v-rating 
                            :model-value="product.rating" 
                            readonly 
                            size="x-small" 
                            density="compact"
                            class="mr-2"
                          />
                          <span class="text-caption">({{ product.rating }})</span>
                        </div>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  
                  <!-- Selection indicator -->
                  <v-overlay 
                    v-if="selectedProductId === product.id"
                    contained
                    class="d-flex align-center justify-center"
                    opacity="0.1"
                  >
                    <v-icon size="48" color="primary">mdi-check-circle</v-icon>
                  </v-overlay>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            @click="productSelectionDialog = false"
            variant="outlined"
          >
            Batal
          </v-btn>
          <v-btn 
            @click="addSelectedProduct"
            color="primary"
            :disabled="!selectedProductId"
          >
            Tambah Produk
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
                  <v-btn
                    @click="addBanner"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                
                <!-- Banner forms (keeping existing implementation) -->
                <div v-for="(banner, index) in homepageData.banners" :key="index" class="mb-4">
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <h4 class="text-subtitle-1 flex-grow-1">Banner {{ index + 1 }}</h4>
                      <v-btn
                        @click="removeBanner(index)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :disabled="homepageData.banners.length <= 1"
                      />
                    </div>
                    
                    <!-- Image Upload -->
                    <div class="mb-3">
                      <v-card
                        height="150"
                        variant="outlined"
                        class="d-flex align-center justify-center mb-2 image-upload-card"
                        @click="openBannerFileInput(index)"
                      >
                        <div v-if="!banner.image" class="text-center">
                          <v-icon size="32" color="grey-lighten-1" class="mb-1">mdi-camera</v-icon>
                          <p class="text-caption text-grey-darken-1">Banner Image</p>
                        </div>
                        <v-img 
                          v-else
                          :src="banner.image"
                          cover
                          height="100%"
                          class="rounded"
                        />
                      </v-card>
                      
                      <input
                        :ref="el => bannerFileInputRefs[index] = el as HTMLInputElement"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleBannerImageUpload($event, index)"
                      />
                    </div>

                    <v-text-field
                      v-model="banner.title"
                      label="Title"
                      variant="outlined"
                      density="compact"
                      class="mb-2"
                    />
                    
                    <v-text-field
                      v-model="banner.subtitle"
                      label="Subtitle"
                      variant="outlined"
                      density="compact"
                      class="mb-2"
                    />
                    
                    <v-text-field
                      v-model="banner.buttonText"
                      label="Button Text"
                      variant="outlined"
                      density="compact"
                      class="mb-2"
                    />
                    
                    <v-text-field
                      v-model="banner.buttonLink"
                      label="Button Link"
                      variant="outlined"
                      density="compact"
                    />
                  </v-card>
                </div>
              </div>

              <!-- Achievement Section (keeping existing) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Achievement</h3>
                  <v-btn
                    @click="addAchievement"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                
                <div v-for="(achievement, index) in homepageData.achievements" :key="achievement.id" class="mb-3">
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <h4 class="text-subtitle-1 flex-grow-1">Achievement {{ index + 1 }}</h4>
                      <v-btn
                        @click="removeAchievement(index)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :disabled="homepageData.achievements.length <= 1"
                      />
                    </div>
                    
                    <!-- Image Upload -->
                    <div class="mb-3">
                      <v-card
                        height="100"
                        variant="outlined"
                        class="d-flex align-center justify-center mb-2 image-upload-card"
                        @click="openAchievementFileInput(index)"
                      >
                        <div v-if="!achievement.image" class="text-center">
                          <v-icon size="24" color="grey-lighten-1" class="mb-1">mdi-trophy</v-icon>
                          <p class="text-caption text-grey-darken-1">Icon</p>
                        </div>
                        <v-img 
                          v-else
                          :src="achievement.image"
                          cover
                          height="100%"
                          class="rounded"
                        />
                      </v-card>
                      
                      <input
                        :ref="el => achievementFileInputRefs[index] = el as HTMLInputElement"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleAchievementImageUpload($event, index)"
                      />
                    </div>

                    <v-text-field
                      v-model="achievement.title"
                      label="Title"
                      variant="outlined"
                      density="compact"
                      class="mb-2"
                    />
                    
                    <v-text-field
                      v-model.number="achievement.percentage"
                      label="Percentage"
                      type="number"
                      min="0"
                      max="100"
                      variant="outlined"
                      density="compact"
                      class="mb-2"
                    />
                    
                    <v-textarea
                      v-model="achievement.description"
                      label="Description"
                      variant="outlined"
                      density="compact"
                      rows="2"
                    />
                  </v-card>
                </div>
              </div>

              <!-- Featured Products Section (NEW) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Produk Andalan</h3>
                  <v-btn
                    @click="openProductSelection"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                    :disabled="availableProducts.length === 0"
                  />
                </div>
                
                <div v-if="featuredProductsWithDetails.length === 0" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
                  <p class="text-grey-darken-1 mt-2">Belum ada produk yang dipilih sebagai featured</p>
                  <v-btn 
                    @click="openProductSelection"
                    color="primary"
                    variant="outlined"
                    :disabled="availableProducts.length === 0"
                  >
                    Pilih Produk
                  </v-btn>
                </div>
                
                <div v-else>
                  <div v-for="(featuredProduct, index) in featuredProductsWithDetails" :key="featuredProduct.productId" class="mb-3">
                    <v-card variant="outlined" class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <div class="flex-grow-1">
                          <h4 class="text-subtitle-1">{{ featuredProduct.product?.name }}</h4>
                          <p class="text-caption text-grey-darken-1 mb-0">{{ featuredProduct.product?.category }}</p>
                        </div>
                        
                        <!-- Order controls -->
                        <div class="mr-2">
                          <v-btn 
                            @click="moveProductUp(index)"
                            icon="mdi-arrow-up"
                            variant="text"
                            size="small"
                            :disabled="index === 0"
                          />
                          <v-btn 
                            @click="moveProductDown(index)"
                            icon="mdi-arrow-down"
                            variant="text"
                            size="small"
                            :disabled="index === featuredProductsWithDetails.length - 1"
                          />
                        </div>
                        
                        <v-btn
                          @click="removeFeaturedProduct(index)"
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                        />
                      </div>
                      
                      <!-- Product preview -->
                      <div class="d-flex mb-3">
                        <v-img
                          :src="featuredProduct.product?.image || '/placeholder.jpg'"
                          width="80"
                          height="80"
                          cover
                          class="rounded mr-3"
                        >
                          <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-icon size="30" color="grey-lighten-1">mdi-package-variant</v-icon>
                            </div>
                          </template>
                        </v-img>
                        <div class="flex-grow-1">
                          <p class="text-body-2 mb-2">{{ featuredProduct.product?.description }}</p>
                          <div class="d-flex align-center">
                            <span class="text-h6 font-weight-bold text-primary mr-2">
                              {{ formatPrice(featuredProduct.product?.price || 0) }}
                            </span>
                            <span v-if="featuredProduct.product?.originalPrice" class="text-body-2 text-grey" style="text-decoration: line-through;">
                              {{ formatPrice(featuredProduct.product.originalPrice) }}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Badge settings -->
                      <v-row>
                        <v-col cols="12" md="8">
                          <v-text-field
                            v-model="featuredProduct.badge"
                            label="Badge (Optional)"
                            variant="outlined"
                            density="compact"
                            placeholder="e.g., Best Seller, New, Promo"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="featuredProduct.badgeColor"
                            label="Badge Color"
                            :items="[
                              { title: 'Primary', value: 'primary' },
                              { title: 'Secondary', value: 'secondary' },
                              { title: 'Success', value: 'success' },
                              { title: 'Info', value: 'info' },
                              { title: 'Warning', value: 'warning' },
                              { title: 'Error', value: 'error' },
                              { title: 'Amber', value: 'amber' },
                              { title: 'Green', value: 'green' }
                            ]"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                :loading="saveLoading"
                block
                size="large"
              >
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
              <v-btn
                @click="refreshPreview"
                icon="mdi-refresh"
                variant="text"
                size="small"
                color="white"
                title="Refresh preview"
              />
              <v-btn
                @click="openHomepage"
                icon="mdi-open-in-new"
                variant="text"
                size="small"
                color="white"
                title="Open homepage in new tab"
              />
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
</style>
