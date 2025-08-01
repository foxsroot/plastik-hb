<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AddProductModal from '@/components/pop-up/AddProductModal.vue'
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

// Computed untuk filter dan sort produk
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

// Fungsi untuk update status dengan dropdown
const updateStatus = async (product: Product, newStatus: 'active' | 'draft') => {
  if (product.status === newStatus) return

  const oldStatus = product.status
  product.status = newStatus // Optimistic update
  
  try {
    // Panggil API untuk update status
    const response = await fetch(`/api/products/${product.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    
    if (response.ok) {
      success('Berhasil', `Status produk "${product.name}" berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Draft'}`)
    } else {
      throw new Error('Gagal mengupdate status')
    }
  } catch (err) {
    console.error('Error updating status:', err)
    // Rollback on error
    product.status = oldStatus
    error('Error', 'Gagal mengupdate status produk')
  }
}

// Fungsi untuk membuka modal tambah produk
const openAddModal = () => {
  editingProduct.value = null
  showAddModal.value = true
}

// Fungsi untuk membuka modal edit produk
const openEditModal = (product: Product) => {
  editingProduct.value = { ...product } // Clone the product
  showAddModal.value = true
}

// Fungsi untuk menyimpan produk baru
const handleSaveProduct = async (productData: NewProduct) => {
  addLoading.value = true
  try {
    // Panggil API untuk menambah produk
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    
    if (response.ok) {
      const savedProduct = await response.json()
      // Tambahkan produk baru ke list
      products.value.unshift(savedProduct)
      // Tutup modal
      showAddModal.value = false
      success('Berhasil', 'Produk berhasil ditambahkan!')
    } else {
      throw new Error('Gagal menyimpan produk')
    }
  } catch (err) {
    console.error('Error saving product:', err)
    // Simulasi berhasil untuk testing
    const newId = Math.max(...products.value.map(p => p.id)) + 1
    const savedProduct: Product = {
      id: newId,
      name: productData.name,
      price: productData.price!,
      status: productData.status,
      image: productData.image || '/placeholder.jpg',
      description: productData.description,
      category: productData.category,
      specifications: productData.specifications
    }
    products.value.unshift(savedProduct)
    showAddModal.value = false
    success('Berhasil', 'Produk berhasil ditambahkan!')
  } finally {
    addLoading.value = false
    editingProduct.value = null
  }
}

// Fungsi untuk update produk
const handleUpdateProduct = async (productData: Product) => {
  addLoading.value = true
  try {
    // Panggil API untuk update produk
    const response = await fetch(`/api/products/${productData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    
    if (response.ok) {
      const updatedProduct = await response.json()
      // Update produk di list
      const index = products.value.findIndex(p => p.id === productData.id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      // Tutup modal
      showAddModal.value = false
      success('Berhasil', 'Produk berhasil diperbarui!')
    } else {
      throw new Error('Gagal mengupdate produk')
    }
  } catch (err) {
    console.error('Error updating product:', err)
    // Simulasi berhasil untuk testing
    const index = products.value.findIndex(p => p.id === productData.id)
    if (index !== -1) {
      products.value[index] = { ...productData }
    }
    showAddModal.value = false
    success('Berhasil', 'Produk berhasil diperbarui!')
  } finally {
    addLoading.value = false
    editingProduct.value = null
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<route>
{
    meta: {
        layout: 'admin'
    }
}
</route>

<template>
  <v-container class="pa-6">
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
                  <v-col cols="6" md="7" class="pl-4">
                    <h3 class="text-h6 font-weight-medium mb-1">{{ product.name }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-0">{{ formatPrice(product.price) }}</p>
                  </v-col>
                  
                  <!-- Status Dropdown -->
                  <v-col cols="2" md="2" class="text-center">
                    <v-select
                      :model-value="product.status"
                      :items="productStatusOptions"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="status-select"
                      @update:model-value="(value) => updateStatus(product, value as 'active' | 'draft')"
                    >
                      <template v-slot:selection="{ item }">
                        <div 
                          class="status-badge"
                          :class="{
                            'status-active': item.value === 'active',
                            'status-draft': item.value === 'draft'
                          }"
                        >
                          <v-icon size="14" class="mr-1">
                            {{ item.value === 'active' ? 'mdi-check' : 'mdi-clock' }}
                          </v-icon>
                          {{ item.title }}
                        </div>
                      </template>
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon 
                              :color="item.raw.value === 'active' ? 'success' : 'warning'"
                            >
                              {{ item.raw.value === 'active' ? 'mdi-check' : 'mdi-clock' }}
                            </v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                  
                  <!-- Actions -->
                  <v-col cols="2" md="2" class="text-center">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-dots-horizontal"
                          variant="text"
                          size="small"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="openEditModal(product)">
                          <template v-slot:prepend>
                            <v-icon>mdi-pencil</v-icon>
                          </template>
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="$router.push(`/admin/produk/${product.id}`)">
                          <template v-slot:prepend>
                            <v-icon>mdi-eye</v-icon>
                          </template>
                          <v-list-item-title>Detail</v-list-item-title>
                        </v-list-item>
                        <v-divider />
                        <v-list-item class="text-error">
                          <template v-slot:prepend>
                            <v-icon>mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>Hapus</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
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
    <AddProductModal
      v-model="showAddModal"
      :loading="addLoading"
      :edit-product="editingProduct"
      @save="handleSaveProduct"
      @update="handleUpdateProduct"
    />
  </v-container>
</template>

<style scoped>
.product-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

/* Custom status badge styles */
.status-select :deep(.v-field__input) {
  padding: 0 !important;
  margin: 0 !important;
}

.status-select :deep(.v-field__field) {
  border-radius: 20px;
  padding: 0 !important;
}

.status-select :deep(.v-field__outline) {
  border-radius: 20px;
  opacity: 0;
}

.status-select :deep(.v-select__selection) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% + 24px);
  height: 40px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  padding: 0 16px;
  margin: -12px;
  position: relative;
}

.status-active {
  background-color: rgb(var(--v-theme-success));
  color: white;
}

.status-draft {
  background-color: rgb(var(--v-theme-warning));
  color: white;
}

/* Hide select field borders completely */
.status-select :deep(.v-field--focused .v-field__outline) {
  opacity: 0;
}

/* Fix dropdown arrow positioning */
.status-select :deep(.v-field__append-inner) {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  padding: 0;
  margin: 0;
}

.status-select :deep(.v-field__append-inner .v-icon) {
  color: white;
  opacity: 0.8;
}

/* Make sure the entire field is clickable */
.status-select {
  width: 120px;
  max-width: 120px;
  position: relative;
}

/* Ensure proper layering */
.status-select :deep(.v-field) {
  position: relative;
}
</style>
