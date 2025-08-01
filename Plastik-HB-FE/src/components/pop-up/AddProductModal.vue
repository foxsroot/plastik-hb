<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAlert } from '@/composables/useAlert'

interface NewProduct {
  name: string
  price: number | null
  status: 'active' | 'draft'
  image?: string
  description?: string
  category?: string
  specifications?: string
}

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

interface Props {
  modelValue: boolean
  loading?: boolean
  editProduct?: Product | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [product: NewProduct]
  'update': [product: Product]
}>()

// Use alert composable
const { success, error } = useAlert()

// Form data
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

// Computed for dialog visibility
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Check if in edit mode
const isEditMode = computed(() => !!props.editProduct)

// Modal title
const modalTitle = computed(() => isEditMode.value ? 'Edit Produk' : 'Tambah Produk Baru')

// Button text
const saveButtonText = computed(() => isEditMode.value ? 'Update' : 'Save')

// Functions
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

const closeModal = () => {
  emit('update:modelValue', false)
  setTimeout(() => {
    resetForm()
  }, 300)
}

const saveProduct = () => {
  if (!newProduct.value.name || !newProduct.value.price) {
    error('Validasi Error', 'Mohon lengkapi data produk yang wajib diisi (Nama Produk dan Harga)')
    return
  }
  
  if (isEditMode.value && props.editProduct) {
    const updatedProduct: Product = {
      ...props.editProduct,
      ...newProduct.value,
      price: newProduct.value.price!
    }
    emit('update', updatedProduct)
  } else {
    emit('save', { ...newProduct.value })
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
  if (props.editProduct) {
    newProduct.value = {
      name: props.editProduct.name,
      price: props.editProduct.price,
      status: props.editProduct.status,
      image: props.editProduct.image || '',
      description: props.editProduct.description || '',
      category: props.editProduct.category || '',
      specifications: props.editProduct.specifications || ''
    }
  } else {
    resetForm()
  }
}

// Watch for modal opening and load data accordingly
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadProductData()
  }
})

// Watch for editProduct changes
watch(() => props.editProduct, () => {
  if (props.modelValue) {
    loadProductData()
  }
})
</script>

<template>
  <v-dialog 
    v-model="isVisible" 
    max-width="800px"
    :persistent="false"
    class="product-modal"
  >
    <v-card class="product-modal-card">
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
                    :items="[
                      { title: 'Draft', value: 'draft' },
                      { title: 'Aktif', value: 'active' }
                    ]"
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
          :disabled="loading"
          class="mr-3"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveProduct"
          :loading="loading"
          :disabled="!newProduct.name || !newProduct.price"
        >
          {{ saveButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
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