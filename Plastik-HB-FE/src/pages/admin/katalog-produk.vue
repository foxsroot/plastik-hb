<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAlert } from '@/composables/useAlert'

interface Product {
  id: number
  name: string
  price: number
  status: 'active' | 'draft'
  image?: string
  description?: string
  category?: string
  specifications?: string
}

interface NewProduct {
  name: string
  price: number | null
  status: 'active' | 'draft'
  image?: string
  description?: string
  category?: string
  specifications?: string
}

const { success, error } = useAlert()

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')

// Modal state
const showAddModal = ref(false)
const addLoading = ref(false)
const editingProduct = ref<Product | null>(null)

// Alert state
const alertVisible = ref(false)
const alertType = ref<'success' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Form data for modal
const newProduct = ref<NewProduct>({
  name: '',
  price: null,
  status: 'draft',
  image: '',
  description: '',
  category: '',
  specifications: ''
})

// Ref for file input
const fileInputRef = ref<HTMLInputElement | null>(null)

const statusOptions = [
  { title: 'Semua Status', value: 'all' },
  { title: 'Aktif', value: 'active' },
  { title: 'Draft', value: 'draft' }
]

const productStatusOptions = [
  { title: 'Aktif', value: 'active' },
  { title: 'Draft', value: 'draft' }
]

const sortOptions = [
  { title: 'Nama A-Z', value: 'name' },
  { title: 'Nama Z-A', value: 'name_desc' },
  { title: 'Harga Terendah', value: 'price_asc' },
  { title: 'Harga Tertinggi', value: 'price_desc' }
]

// Kategori options
const categoryOptions = [
  { title: 'Kategori 1', value: 'kategori1' },
  { title: 'Kategori 2', value: 'kategori2' },
  { title: 'Kategori 3', value: 'kategori3' },
]

// Form validation rules
const nameRules = [
  (v: string) => !!v || 'Nama produk wajib diisi',
  (v: string) => v.length >= 3 || 'Nama produk minimal 3 karakter'
]

const priceRules = [
  (v: number) => !!v || 'Harga wajib diisi',
  (v: number) => v > 0 || 'Harga harus lebih dari 0'
]

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter berdasarkan pencarian
  if (searchQuery.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter berdasarkan status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      default:
        return 0
    }
  })

  return filtered
})

// Check if in edit mode
const isEditMode = computed(() => !!editingProduct.value)

// Modal title
const modalTitle = computed(() => isEditMode.value ? 'Edit Produk' : 'Tambah Produk Baru')

// Button text
const saveButtonText = computed(() => isEditMode.value ? 'Update' : 'Save')

// Alert functions
const showAlert = (type: 'success' | 'error', title: string, message: string) => {
  alertType.value = type
  alertTitle.value = title
  alertMessage.value = message
  alertVisible.value = true
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alertVisible.value = false
  }, 5000)
}

// Fungsi untuk fetch data dari API
const fetchProducts = async () => {
  loading.value = true
  try {
    // Ganti dengan endpoint API yang sesuai
    const response = await fetch('/api/products')
    const data = await response.json()
    products.value = data
  } catch (error) {
    console.error('Error fetching products:', error)
    // Fallback data untuk testing
    products.value = [
      { 
        id: 1, 
        name: 'Plastik PE', 
        price: 15000, 
        status: 'active', 
        image: '/placeholder.jpg',
        description: 'Plastik PE berkualitas tinggi untuk berbagai keperluan industri',
        category: 'kategori1',
        specifications: 'Ketebalan: 0.5mm, Lebar: 100cm, Panjang: 50m'
      },
      { 
        id: 2, 
        name: 'Plastik PP', 
        price: 20000, 
        status: 'draft', 
        image: '/placeholder.jpg',
        description: 'Plastik PP tahan panas dan tahan kimia',
        category: 'kategori2',
        specifications: 'Ketebalan: 0.8mm, Lebar: 120cm, Panjang: 30m'
      },
      { 
        id: 3, 
        name: 'Plastik PVC', 
        price: 25000, 
        status: 'active', 
        image: '/placeholder.jpg',
        description: 'Plastik PVC fleksibel untuk aplikasi outdoor',
        category: 'kategori1',
        specifications: 'Ketebalan: 1mm, Lebar: 150cm, Panjang: 25m'
      },
      { 
        id: 4, 
        name: 'Plastik HDPE', 
        price: 18000, 
        status: 'active', 
        image: '/placeholder.jpg',
        description: 'Plastik HDPE ramah lingkungan dan dapat didaur ulang',
        category: 'kategori3',
        specifications: 'Ketebalan: 0.6mm, Lebar: 80cm, Panjang: 40m'
      }
    ]
  } finally {
    loading.value = false
  }
}

// Fungsi untuk format harga
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price)
}

// Modal functions
const openFileInput = () => {
  fileInputRef.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newProduct.value.image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const resetForm = () => {
  newProduct.value = {
    name: '',
    price: null,
    status: 'draft',
    image: '',
    description: '',
    category: '',
    specifications: ''
  }
}

const loadProductData = () => {
  if (editingProduct.value) {
    newProduct.value = {
      name: editingProduct.value.name,
      price: editingProduct.value.price,
      status: editingProduct.value.status,
      image: editingProduct.value.image || '',
      description: editingProduct.value.description || '',
      category: editingProduct.value.category || '',
      specifications: editingProduct.value.specifications || ''
    }
  } else {
    resetForm()
  }
}

// Fungsi untuk membuka modal tambah produk
const openAddModal = () => {
  editingProduct.value = null
  resetForm()
  showAddModal.value = true
}

// Fungsi untuk membuka modal edit produk
const openEditModal = (product: Product) => {
  editingProduct.value = { ...product }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  setTimeout(() => {
    resetForm()
    editingProduct.value = null
  }, 300)
}

// Fungsi untuk menyimpan atau update produk
const saveProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.price) {
    showAlert('error', 'Validasi Error', 'Mohon lengkapi data produk yang wajib diisi (Nama Produk dan Harga)')
    return
  }

  addLoading.value = true
  try {
    if (isEditMode.value && editingProduct.value) {
      // Update existing product
      const updatedProduct: Product = {
        ...editingProduct.value,
        ...newProduct.value,
        price: newProduct.value.price!
      }
      
      const response = await fetch(`/api/products/${editingProduct.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      })
      
      if (response.ok) {
        const index = products.value.findIndex(p => p.id === editingProduct.value!.id)
        if (index !== -1) {
          products.value[index] = updatedProduct
        }
        showAlert('success', 'Berhasil', 'Produk berhasil diperbarui!')
      } else {
        throw new Error('Gagal mengupdate produk')
      }
    } else {
      // Create new product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct.value)
      })
      
      if (response.ok) {
        const savedProduct = await response.json()
        products.value.unshift(savedProduct)
        showAlert('success', 'Berhasil', 'Produk berhasil ditambahkan!')
      } else {
        throw new Error('Gagal menyimpan produk')
      }
    }
    
    closeModal()
  } catch (err) {
    console.error('Error saving product:', err)
    // Simulasi berhasil untuk testing
    if (isEditMode.value && editingProduct.value) {
      const index = products.value.findIndex(p => p.id === editingProduct.value!.id)
      if (index !== -1) {
        products.value[index] = {
          ...editingProduct.value,
          ...newProduct.value,
          price: newProduct.value.price!
        }
      }
      showAlert('success', 'Berhasil', 'Produk berhasil diperbarui!')
    } else {
      const newId = Math.max(...products.value.map(p => p.id)) + 1
      const savedProduct: Product = {
        id: newId,
        name: newProduct.value.name,
        price: newProduct.value.price!,
        status: newProduct.value.status,
        image: newProduct.value.image || '/placeholder.jpg',
        description: newProduct.value.description,
        category: newProduct.value.category,
        specifications: newProduct.value.specifications
      }
      products.value.unshift(savedProduct)
      showAlert('success', 'Berhasil', 'Produk berhasil ditambahkan!')
    }
    closeModal()
  } finally {
    addLoading.value = false
  }
}

// Fungsi untuk hapus produk
const deleteProduct = async (product: Product) => {
  try {
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      products.value = products.value.filter(p => p.id !== product.id)
      showAlert('success', 'Berhasil', `Produk "${product.name}" berhasil dihapus`)
    } else {
      throw new Error('Gagal menghapus produk')
    }
  } catch (err) {
    console.error('Error deleting product:', err)
    // Simulasi berhasil untuk testing
    products.value = products.value.filter(p => p.id !== product.id)
    showAlert('success', 'Berhasil', `Produk "${product.name}" berhasil dihapus`)
  }
}

// Watch for modal opening and load data accordingly
watch(() => showAddModal.value, (newVal) => {
  if (newVal) {
    loadProductData()
  }
})

onMounted(() => {
  fetchProducts()
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

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4 font-weight-bold">Katalog Produk</h1>
        <v-btn 
          color="primary" 
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          Tambah Produk
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" variant="outlined">
          <v-row>
            <!-- Search Bar -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                label="Cari Produk"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            
            <!-- Status Filter -->
            <v-col cols="6" md="3">
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                label="Status Produk"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            
            <!-- Sort -->
            <v-col cols="6" md="3">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Sort"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Products List -->
    <v-row>
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Memuat produk...</p>
            </div>
            
            <div v-else-if="filteredProducts.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
              <p class="text-h6 text-grey-darken-1">Tidak ada produk ditemukan</p>
            </div>
            
            <div v-else>
              <v-divider />
              <div
                v-for="(product, index) in filteredProducts"
                :key="product.id"
                class="product-item"
              >
                <v-row class="pa-4 align-center" no-gutters>
                  <!-- Product Image -->
                  <v-col cols="2" md="1">
                    <v-avatar size="60" variant="outlined">
                      <v-img 
                        :src="product.image || '/placeholder.jpg'"
                        :alt="product.name"
                        cover
                      />
                    </v-avatar>
                  </v-col>
                  
                  <!-- Product Info -->
                  <v-col cols="4" md="5" class="pl-4">
                    <h3 class="text-h6 font-weight-medium mb-1">{{ product.name }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-0">{{ formatPrice(product.price) }}</p>
                  </v-col>
                  
                  <!-- Status Display -->
                  <v-col cols="3" md="3" class="text-center">
                    <v-chip
                      :color="product.status === 'active' ? 'success' : 'warning'"
                      variant="flat"
                      size="default"
                      :prepend-icon="product.status === 'active' ? 'mdi-check' : 'mdi-clock'"
                    >
                      {{ product.status === 'active' ? 'Aktif' : 'Draft' }}
                    </v-chip>
                  </v-col>
                  
                  <!-- Action Buttons -->
                  <v-col cols="3" md="3" class="text-right">
                    <div class="d-flex justify-end align-center ga-2">
                      <!-- Edit Button -->
                      <v-btn
                        prepend-icon="mdi-pencil"
                        variant="outlined"
                        size="small"
                        color="primary"
                        @click="openEditModal(product)"
                      >
                        Edit
                      </v-btn>
                      
                      <!-- Detail Button -->
                      <v-btn
                        prepend-icon="mdi-eye"
                        variant="outlined"
                        size="small"
                        color="info"
                        @click="$router.push(`/admin/produk/${product.id}`)"
                      >
                        Detail
                      </v-btn>
                      
                      <!-- Delete Button -->
                      <v-btn
                        prepend-icon="mdi-delete"
                        variant="outlined"
                        size="small"
                        color="error"
                        @click="deleteProduct(product)"
                      >
                        Hapus
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
                <v-divider v-if="index < filteredProducts.length - 1" />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Product Modal -->
    <v-dialog 
      v-model="showAddModal" 
      max-width="800px"
      :persistent="false"
      class="product-modal"
    >
      <v-card class="product-modal-card">
        <v-card-title class="text-h5 pa-6">
          {{ modalTitle }}
        </v-card-title>
        
        <v-card-text class="pa-8">
          <v-form>
            <v-row>
              <!-- Image Upload Section -->
              <v-col cols="12" md="4">
                <div class="image-upload-section">
                  <v-card
                    height="200"
                    variant="outlined"
                    class="d-flex align-center justify-center mb-4 image-upload-card"
                    @click="openFileInput"
                  >
                    <div v-if="!newProduct.image" class="text-center">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-camera</v-icon>
                      <p class="text-grey-darken-1">Gambar Produk</p>
                    </div>
                    <v-img 
                      v-else
                      :src="newProduct.image"
                      cover
                      height="100%"
                      class="rounded"
                    />
                  </v-card>
                  
                  <v-btn
                    block
                    variant="outlined"
                    prepend-icon="mdi-pencil"
                    @click="openFileInput"
                  >
                    Edit Gambar
                  </v-btn>
                  
                  <!-- Hidden file input -->
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageUpload"
                  />
                </div>
              </v-col>
              
              <!-- Form Fields -->
              <v-col cols="12" md="8">
                <v-row>
                  <!-- Nama Produk -->
                  <v-col cols="12">
                    <v-text-field
                      v-model="newProduct.name"
                      label="Nama Produk"
                      :rules="nameRules"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  
                  <!-- Harga -->
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="newProduct.price"
                      label="Harga"
                      type="number"
                      :rules="priceRules"
                      variant="outlined"
                      prefix="Rp"
                      required
                    />
                  </v-col>
                  
                  <!-- Status (only show in edit mode) -->
                  <v-col cols="12" v-if="isEditMode">
                    <v-select
                      v-model="newProduct.status"
                      :items="productStatusOptions"
                      label="Status"
                      variant="outlined"
                    />
                  </v-col>
                  
                  <!-- Spesifikasi Produk -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="newProduct.specifications"
                      label="Spesifikasi Produk"
                      variant="outlined"
                      rows="3"
                      placeholder="Masukkan spesifikasi produk..."
                    />
                  </v-col>
                </v-row>
              </v-col>
              
              <!-- Deskripsi Produk - Full Width -->
              <v-col cols="12">
                <v-textarea
                  v-model="newProduct.description"
                  label="Deskripsi Produk"
                  variant="outlined"
                  rows="4"
                  placeholder="Masukkan deskripsi produk..."
                />
              </v-col>
              
              <!-- Kategori Produk -->
              <v-col cols="12">
                <v-select
                  v-model="newProduct.category"
                  :items="categoryOptions"
                  label="Kategori Produk"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <!-- Action Buttons -->
        <v-card-actions class="px-8 pb-8">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeModal"
            :disabled="addLoading"
            class="mr-3"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveProduct"
            :loading="addLoading"
            :disabled="!newProduct.name || !newProduct.price"
          >
            {{ saveButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.product-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Apply blur effect to the backdrop */
.product-modal :deep(.v-overlay__scrim) {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.product-modal-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  position: relative;
}

.image-upload-section {
  position: sticky;
  top: 0;
}

.image-upload-card {
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.image-upload-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
