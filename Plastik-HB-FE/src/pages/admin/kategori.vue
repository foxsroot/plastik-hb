<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAlert } from '@/composables/useAlert'

interface Category {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive'
  productCount: number
  createdAt?: string
}

interface NewCategory {
  name: string
  description?: string
  status: 'active' | 'inactive'
}

const { success, error } = useAlert()

const categories = ref<Category[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')

// Modal state
const showAddModal = ref(false)
const addLoading = ref(false)
const editingCategory = ref<Category | null>(null)

// Alert state
const alertVisible = ref(false)
const alertType = ref<'success' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Form data for modal
const newCategory = ref<NewCategory>({
  name: '',
  description: '',
  status: 'active'
})

const statusOptions = [
  { title: 'Semua Status', value: 'all' },
  { title: 'Aktif', value: 'active' },
  { title: 'Tidak Aktif', value: 'inactive' }
]

const categoryStatusOptions = [
  { title: 'Aktif', value: 'active' },
  { title: 'Tidak Aktif', value: 'inactive' }
]

const sortOptions = [
  { title: 'Nama A-Z', value: 'name' },
  { title: 'Nama Z-A', value: 'name_desc' },
  { title: 'Jumlah Produk', value: 'product_count' },
  { title: 'Terbaru', value: 'newest' }
]

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

// Computed untuk filter dan sort kategori
const filteredCategories = computed(() => {
  let filtered = categories.value

  // Filter berdasarkan pencarian
  if (searchQuery.value) {
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter berdasarkan status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(category => category.status === statusFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'product_count':
        return b.productCount - a.productCount
      case 'newest':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      default:
        return 0
    }
  })

  return filtered
})

// Fungsi untuk fetch data dari API
const fetchCategories = async () => {
  loading.value = true
  try {
    // Ganti dengan endpoint API yang sesuai
    const response = await fetch('/api/categories')
    const data = await response.json()
    categories.value = data
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback data untuk testing
    categories.value = [
      { 
        id: 1, 
        name: 'Plastik Kemasan', 
        description: 'Kategori untuk produk plastik kemasan makanan dan minuman',
        status: 'active',
        productCount: 15,
        createdAt: '2024-01-15'
      },
      { 
        id: 2, 
        name: 'Plastik Industri', 
        description: 'Kategori untuk produk plastik keperluan industri',
        status: 'active',
        productCount: 8,
        createdAt: '2024-01-10'
      },
      { 
        id: 3, 
        name: 'Plastik Rumah Tangga', 
        description: 'Kategori untuk produk plastik keperluan rumah tangga',
        status: 'inactive',
        productCount: 0,
        createdAt: '2024-01-05'
      },
      { 
        id: 4, 
        name: 'Plastik Medis', 
        description: 'Kategori untuk produk plastik keperluan medis dan kesehatan',
        status: 'active',
        productCount: 12,
        createdAt: '2024-01-20'
      }
    ]
  } finally {
    loading.value = false
  }
}

// Fungsi untuk update status dengan dropdown
const updateStatus = async (category: Category, newStatus: 'active' | 'inactive') => {
  if (category.status === newStatus) return

  const oldStatus = category.status
  category.status = newStatus // Optimistic update
  
  try {
    // Panggil API untuk update status
    const response = await fetch(`/api/categories/${category.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    
    if (response.ok) {
      showAlert('success', 'Berhasil', `Status kategori "${category.name}" berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}`)
    } else {
      throw new Error('Gagal mengupdate status')
    }
  } catch (err) {
    console.error('Error updating status:', err)
    // Rollback on error
    category.status = oldStatus
    showAlert('error', 'Error', 'Gagal mengupdate status kategori')
  }
}

// Fungsi untuk membuka modal tambah kategori
const openAddModal = () => {
  editingCategory.value = null
  newCategory.value = {
    name: '',
    description: '',
    status: 'active'
  }
  showAddModal.value = true
}

// Fungsi untuk membuka modal edit kategori
const openEditModal = (category: Category) => {
  editingCategory.value = { ...category }
  newCategory.value = {
    name: category.name,
    description: category.description || '',
    status: category.status
  }
  showAddModal.value = true
}

// Fungsi untuk menyimpan kategori baru
const handleSaveCategory = async () => {
  if (!newCategory.value.name.trim()) {
    showAlert('error', 'Validasi Error', 'Nama kategori wajib diisi')
    return
  }

  addLoading.value = true
  try {
    if (editingCategory.value) {
      // Update existing category
      const response = await fetch(`/api/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory.value)
      })
      
      if (response.ok) {
        const updatedCategory = await response.json()
        const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
        if (index !== -1) {
          categories.value[index] = { ...updatedCategory, productCount: editingCategory.value.productCount }
        }
        showAlert('success', 'Berhasil', 'Kategori berhasil diperbarui!')
      } else {
        throw new Error('Gagal mengupdate kategori')
      }
    } else {
      // Create new category
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory.value)
      })
      
      if (response.ok) {
        const savedCategory = await response.json()
        categories.value.unshift({ ...savedCategory, productCount: 0 })
        showAlert('success', 'Berhasil', 'Kategori berhasil ditambahkan!')
      } else {
        throw new Error('Gagal menyimpan kategori')
      }
    }
    
    showAddModal.value = false
  } catch (err) {
    console.error('Error saving category:', err)
    // Simulasi berhasil untuk testing
    if (editingCategory.value) {
      const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
      if (index !== -1) {
        categories.value[index] = {
          ...editingCategory.value,
          name: newCategory.value.name,
          description: newCategory.value.description,
          status: newCategory.value.status
        }
      }
      showAlert('success', 'Berhasil', 'Kategori berhasil diperbarui!')
    } else {
      const newId = Math.max(...categories.value.map(c => c.id)) + 1
      const savedCategory: Category = {
        id: newId,
        name: newCategory.value.name,
        description: newCategory.value.description,
        status: newCategory.value.status,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      categories.value.unshift(savedCategory)
      showAlert('success', 'Berhasil', 'Kategori berhasil ditambahkan!')
    }
    showAddModal.value = false
  } finally {
    addLoading.value = false
    editingCategory.value = null
  }
}

// Fungsi untuk hapus kategori
const deleteCategory = async (category: Category) => {
  if (category.productCount > 0) {
    showAlert('error', 'Error', `Tidak dapat menghapus kategori "${category.name}" karena masih memiliki ${category.productCount} produk`)
    return
  }

  try {
    const response = await fetch(`/api/categories/${category.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      categories.value = categories.value.filter(c => c.id !== category.id)
      showAlert('success', 'Berhasil', `Kategori "${category.name}" berhasil dihapus`)
    } else {
      throw new Error('Gagal menghapus kategori')
    }
  } catch (err) {
    console.error('Error deleting category:', err)
    // Simulasi berhasil untuk testing
    categories.value = categories.value.filter(c => c.id !== category.id)
    showAlert('success', 'Berhasil', `Kategori "${category.name}" berhasil dihapus`)
  }
}

onMounted(() => {
  fetchCategories()
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
        <h1 class="text-h4 font-weight-bold">Kategori Produk</h1>
        <v-btn 
          color="primary" 
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          Tambah Kategori
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
                label="Cari Kategori"
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
                label="Status Kategori"
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

    <!-- Categories List -->
    <v-row>
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Memuat kategori...</p>
            </div>
            
            <div v-else-if="filteredCategories.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-tag-multiple</v-icon>
              <p class="text-h6 text-grey-darken-1">Tidak ada kategori ditemukan</p>
            </div>
            
            <div v-else>
              <v-divider />
              <div
                v-for="(category, index) in filteredCategories"
                :key="category.id"
                class="category-item"
              >
                <v-row class="pa-4 align-center" no-gutters>
                  <!-- Category Icon -->
                  <v-col cols="2" md="1">
                    <v-avatar size="60" variant="outlined" color="primary">
                      <v-icon size="30">mdi-tag</v-icon>
                    </v-avatar>
                  </v-col>
                  
                  <!-- Category Info -->
                  <v-col cols="4" md="5" class="pl-4">
                    <h3 class="text-h6 font-weight-medium mb-1">{{ category.name }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-1">{{ category.description || 'Tidak ada deskripsi' }}</p>
                    <p class="text-caption text-grey-darken-2">{{ category.productCount }} produk</p>
                  </v-col>
                  
                  <!-- Status Display -->
                  <v-col cols="3" md="3" class="text-center">
                    <v-chip
                      :color="category.status === 'active' ? 'success' : 'error'"
                      variant="flat"
                      size="default"
                      :prepend-icon="category.status === 'active' ? 'mdi-check' : 'mdi-close'"
                    >
                      {{ category.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                    </v-chip>
                  </v-col>
                  
                  <!-- Action Buttons -->
                  <v-col cols="3" md="3" class="text-right">
                    <div class="d-flex justify-end align-center ga-3">
                      <!-- Edit Button -->
                      <v-btn
                        prepend-icon="mdi-pencil"
                        variant="outlined"
                        size="small"
                        color="primary"
                        @click="openEditModal(category)"
                      >
                        Edit
                      </v-btn>
                      
                      <!-- Delete Button -->
                      <v-btn
                        prepend-icon="mdi-delete"
                        variant="outlined"
                        size="small"
                        color="error"
                        :disabled="category.productCount > 0"
                        @click="deleteCategory(category)"
                      >
                        Hapus
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
                <v-divider v-if="index < filteredCategories.length - 1" />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Category Modal -->
    <v-dialog 
      v-model="showAddModal" 
      max-width="600px"
      :persistent="false"
    >
      <v-card>
        <v-card-title class="text-h5 pa-6">
          {{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form>
            <v-row>
              <!-- Nama Kategori -->
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.name"
                  label="Nama Kategori"
                  variant="outlined"
                  required
                />
              </v-col>
              
              <!-- Deskripsi -->
              <v-col cols="12">
                <v-textarea
                  v-model="newCategory.description"
                  label="Deskripsi Kategori"
                  variant="outlined"
                  rows="3"
                  placeholder="Masukkan deskripsi kategori..."
                />
              </v-col>
              
              <!-- Status -->
              <v-col cols="12">
                <v-select
                  v-model="newCategory.status"
                  :items="categoryStatusOptions"
                  label="Status"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <!-- Action Buttons -->
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showAddModal = false"
            :disabled="addLoading"
            class="mr-3"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleSaveCategory"
            :loading="addLoading"
            :disabled="!newCategory.name.trim()"
          >
            {{ editingCategory ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.category-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
