<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAlert } from '@/composables/useAlert';
import { useImageHandler } from '@/composables/useImageHandler';
import axiosInstance from '@/utils/axiosInstance';

import type { 
  Category, 
  Product, 
  NewProduct, 
  CreateProductData, 
  ModalState 
} from '@/types/product.types';

import { 
  formatPrice, 
  calculateDiscountedPrice, 
  getImageUrl,
  formatPriceInput,
  parsePriceInput,
  validatePriceInput
} from '@/utils/formatters';

import { 
  STATUS_OPTIONS, 
  PRODUCT_STATUS_OPTIONS, 
  SORT_OPTIONS, 
  VALIDATION_RULES 
} from '@/utils/constants';

// 🆕 Initialize image handler composable
const {
  altImageUrl,
  getImageOrAlt,
  shouldUseAltImage,
  markImageAsFailed,
  handleImageError,
  getMainImageUrl,
  clearFailedImages,
  getAvailableAssetImages,
  getImportedImageUrls
} = useImageHandler();

const { success, error } = useAlert();

// 🆕 Debug: Log available images on component mount
onMounted(() => {
  console.log('Available asset images:', getAvailableAssetImages());
  console.log('Imported image URLs:', getImportedImageUrls());
  loadCategories();  // Load categories from database
  fetchProducts();   // Load products
});

// ===== PRODUCT HELPERS (INTERNAL) =====

// 🔸 createFormData - Helper untuk membuat FormData
const createFormData = (productData: CreateProductData, files: File[] = []) => {
  const formData = new FormData();
  
  formData.append('name', productData.name);
  formData.append('price', productData.price.toString());
  if (productData.description) formData.append('description', productData.description);
  if (productData.specification) formData.append('specification', productData.specification);
  if (productData.category_id) formData.append('category_id', productData.category_id);
  if (productData.category_name) formData.append('category_name', productData.category_name);
  if (productData.discount !== undefined) formData.append('discount', productData.discount.toString());
  if (productData.featured !== undefined) formData.append('featured', productData.featured.toString());
  if (productData.status) formData.append('status', productData.status);
  
  files.forEach(file => formData.append('images', file));
  
  return formData;
};

// 🔸 transformApiProductToFrontend - Helper untuk transform data dari API
const transformApiProductToFrontend = (apiProduct: any) => {
  const discount = apiProduct.discount || 0;
  const discountedPrice = discount > 0 
    ? Math.max(0, Math.round(apiProduct.price - (apiProduct.price * discount) / 100))
    : 0;

  // Sort assets by order to ensure correct sequence
  const sortedAssets = apiProduct.assets 
    ? [...apiProduct.assets].sort((a: any, b: any) => a.order - b.order) 
    : [];

  // Main image is order 1, additional images are order 2+
  const mainImage = sortedAssets.find((asset: any) => asset.order === 1);
  const additionalImages = sortedAssets.filter((asset: any) => asset.order > 1);

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    status: apiProduct.status === 'active' ? 'active' : 'draft',
    image: mainImage ? getImageOrAlt(mainImage.url) : '',
    images: additionalImages.map((asset: any) => getImageOrAlt(asset.url)) || [],
    description: apiProduct.description,
    category: apiProduct.category?.category,
    category_id: apiProduct.category_id,
    specifications: apiProduct.specification,
    discount,
    discounted_price: discountedPrice,
    assets: sortedAssets // Pass sorted assets
  };
};

// ===== COMPOSABLES (INTERNAL) =====

// 🔸 usePriceFormatter - Helper untuk format dan parse harga
const usePriceFormatter = () => {
  const formatPriceForInput = (price: number | null): string => {
    if (!price) return '';
    return formatPriceInput(price);
  };

  const parsePriceFromInput = (formattedPrice: string): number => {
    return parsePriceInput(formattedPrice);
  };

  const handlePriceInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    
    // Remove all non-digit characters except dots
    value = value.replace(/[^\d.]/g, '');
    
    // Parse the number and format it
    const numValue = parsePriceFromInput(value);
    const formatted = formatPriceForInput(numValue);
    
    // Update the input value
    target.value = formatted;
    formattedPrice.value = formatted;
    
    // Update the actual price in newProduct
    newProduct.value.price = numValue;
  };

  const validatePrice = (value: string): boolean => {
    return validatePriceInput(value);
  };

  return {
    formatPriceForInput,
    parsePriceFromInput,
    handlePriceInput,
    validatePrice
  };
};

// 🔸 useProductAPI - API calls untuk products
const useProductAPI = () => {
  const fetchProductsAPI = async (): Promise<Product[]> => {
    const response = await axiosInstance.get('/products');
    const apiProducts = response.data.data || response.data;
    return apiProducts.map(transformApiProductToFrontend);
  };

  const createProductAPI = async (productData: CreateProductData, files: File[] = []) => {
    const formData = createFormData(productData, files);
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  };

  const updateProductAPI = async (id: string, productData: CreateProductData, files: File[] = []) => {
    const formData = createFormData(productData, files);
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  };

  const deleteProductAPI = async (id: string) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  };

  const deleteProductAssetAPI = async (productId: string, assetId: string) => {
    const response = await axiosInstance.delete(`/products/${productId}/assets/${assetId}`);
    return response.data.data || response.data;
  };

  const replaceMainImageAPI = async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('images', file);
    const response = await axiosInstance.put(`/products/${productId}/main-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  };

  const replaceAssetAPI = async (productId: string, assetId: string, file: File) => {
    const formData = new FormData();
    formData.append('images', file);
    const response = await axiosInstance.put(`/products/${productId}/assets/${assetId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  };

  return {
    fetchProductsAPI,
    createProductAPI,
    updateProductAPI,
    deleteProductAPI,
    deleteProductAssetAPI,
    replaceMainImageAPI,
    replaceAssetAPI
  };
};

// 🔸 useCategoryAPI - API calls untuk categories
const useCategoryAPI = () => {
  const fetchCategoriesAPI = async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories');
    return response.data.data || response.data;
  };

  const createCategoryAPI = async (categoryName: string): Promise<Category> => {
    const response = await axiosInstance.post('/categories', {
      category: categoryName
    });
    return response.data.data || response.data;
  };

  const updateCategoryAPI = async (categoryId: string, categoryName: string): Promise<Category> => {
    const response = await axiosInstance.put(`/categories/${categoryId}`, {
      category: categoryName
    });
    return response.data.data || response.data;
  };

  const deleteCategoryAPI = async (categoryId: string) => {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response.data;
  };

  return {
    fetchCategoriesAPI,
    createCategoryAPI,
    updateCategoryAPI,
    deleteCategoryAPI
  };
};

// ===== INITIALIZE COMPOSABLES =====

// Initialize composables
const { 
  formatPriceForInput, 
  parsePriceFromInput, 
  handlePriceInput, 
  validatePrice 
} = usePriceFormatter();

// Initialize API composables
const {
  fetchProductsAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  deleteProductAssetAPI,
  replaceMainImageAPI,
  replaceAssetAPI
} = useProductAPI();const { 
  fetchCategoriesAPI, 
  createCategoryAPI, 
  updateCategoryAPI, 
  deleteCategoryAPI 
} = useCategoryAPI();

// State
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
  images: [],
  description: '',
  category_id: '',
  category_name: '',
  specifications: '',
  discount: 0
})

// Price formatting state
const formattedPrice = ref('')
const formattedDiscountedPrice = ref('')

// Ref for file input
const fileInputRef = ref<HTMLInputElement | null>(null)
const additionalFileInputRef = ref<HTMLInputElement | null>(null)
const imagesSlider = ref<HTMLElement | null>(null)

// File storage for actual files (not base64)
const uploadedFiles = ref<File[]>([])

// Track additional images files separately in create mode
const additionalImageFiles = ref<File[]>([])

// Track assets to be deleted during update
const assetsToDelete = ref<string[]>([])

// Track existing assets for editing mode
const existingAssets = ref<Array<{id: string, url: string, order: number}>>([])

// Flag to indicate if main image is being replaced
const isReplacingMainImage = ref(false)

// Track pending changes for cancel functionality
const pendingMainImageFile = ref<File | null>(null)
const originalAssets = ref<Array<{id: string, url: string, order: number}>>([])
const originalMainImage = ref<string>('')

// Form validation rules - dari constants
const nameRules = VALIDATION_RULES.name
const priceRules = [
  (v: string) => !!v || 'Harga wajib diisi',
  (v: string) => validatePrice(v) || 'Harga harus berupa angka yang valid dan lebih dari 0',
  (v: string) => {
    const numValue = parsePriceFromInput(v);
    return numValue > 0 || 'Harga harus lebih dari 0';
  }
]
const discountRules = VALIDATION_RULES.discount
const categoryNameRules = VALIDATION_RULES.categoryName

// Categories from database - user dapat menambah kategori
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Category modal state
const showAddCategoryModal = ref(false)
const showCategoryManagerModal = ref(false)
const newCategoryName = ref('')
const addCategoryLoading = ref(false)
const editingCategory = ref<Category | null>(null)
const formSubmitted = ref(false)

// Delete confirmation state
const showDeleteDialog = ref(false)
const productToDelete = ref<Product | null>(null)
const deleteLoading = ref(false)

// Category options - dari database
const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    title: category.category,
    value: category.id // Gunakan ID sebagai value
  }))
})

// Options dari constants
const statusOptions = STATUS_OPTIONS
const sortOptions = SORT_OPTIONS
const productStatusOptions = PRODUCT_STATUS_OPTIONS

// Function untuk menghitung harga setelah discount
const previewDiscountedPrice = computed(() => {
  if (newProduct.value.price && newProduct.value.discount && newProduct.value.discount > 0) {
    return calculateDiscountedPrice(newProduct.value.price, newProduct.value.discount)
  }
  return newProduct.value.price
})

// Computed untuk menghitung total images saat ini
const currentTotalImages = computed(() => {
  if (isEditMode.value) {
    // Edit mode: existing assets count
    return existingAssets.value.length
  } else {
    // Create mode: uploaded files count
    return uploadedFiles.value.length
  }
})

// Computed untuk cek apakah sudah mencapai limit
const isImageLimitReached = computed(() => {
  return additionalImagesCount.value >= 7 // Max 7 additional images
})

// Computed untuk additional images count
const additionalImagesCount = computed(() => {
  if (isEditMode.value) {
    // Edit mode: hanya hitung dari newProduct.value.images 
    // karena sudah include existing + newly uploaded
    return newProduct.value.images?.length || 0
  } else {
    // Create mode: hitung dari additionalImageFiles + images yang sudah di-preview
    return newProduct.value.images?.length || 0
  }
})

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
    products.value = await fetchProductsAPI()
  } catch (error: any) {
    console.error('Error fetching products:', error)
    showAlert('error', 'Error', 'Gagal memuat produk dari server.')
  } finally {
    loading.value = false
  }
}

// Load categories from database
const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const fetchedCategories = await fetchCategoriesAPI()
    categories.value = fetchedCategories
  } catch (error) {
    console.error('❌ Failed to load categories:', error)
    showAlert('error', 'Error', 'Gagal memuat kategori dari database')
    // Set empty array jika gagal load
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

// Create or update category
const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    formSubmitted.value = true
    showAlert('error', 'Validasi Error', 'Nama kategori tidak boleh kosong')
    return
  }

  // Check if category already exists (excluding current editing category)
  const existingCategory = categories.value.find(
    cat => cat.category.toLowerCase() === newCategoryName.value.trim().toLowerCase() 
           && cat.id !== editingCategory.value?.id
  )
  
  if (existingCategory) {
    showAlert('error', 'Validasi Error', 'Kategori dengan nama tersebut sudah ada')
    return
  }

  addCategoryLoading.value = true
  try {
    if (editingCategory.value) {
      // Update existing category
      const updatedCategory = await updateCategoryAPI(editingCategory.value.id, newCategoryName.value.trim())
      
      // Update local categories list
      const index = categories.value.findIndex(cat => cat.id === editingCategory.value!.id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      
      showAlert('success', 'Berhasil', 'Kategori berhasil diperbarui!')
      
    } else {
      // Create new category
      const newCategory = await createCategoryAPI(newCategoryName.value.trim())
      
      // Add to local categories list
      categories.value.push(newCategory)
      
      // Auto select the new category
      newProduct.value.category_id = newCategory.id
      
      showAlert('success', 'Berhasil', 'Kategori baru berhasil ditambahkan!')
    }
    
    // Clear form and close modal
    newCategoryName.value = ''
    editingCategory.value = null
    formSubmitted.value = false
    showAddCategoryModal.value = false
    
  } catch (error: any) {
    console.error('❌ Failed to create category:', error)
    let errorMessage = 'Gagal menambahkan kategori baru'
    
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Data kategori tidak valid'
    } else if (error.response?.status === 409) {
      errorMessage = 'Kategori dengan nama tersebut sudah ada'
    }
    
    showAlert('error', 'Error', errorMessage)
  } finally {
    addCategoryLoading.value = false
  }
}

// Category modal functions
const openAddCategoryModal = () => {
  newCategoryName.value = ''
  editingCategory.value = null
  showAddCategoryModal.value = true
}

const openCategoryManagerModal = () => {
  showCategoryManagerModal.value = true
}

const closeAddCategoryModal = () => {
  newCategoryName.value = ''
  editingCategory.value = null
  showAddCategoryModal.value = false
}

const closeCategoryManagerModal = () => {
  showCategoryManagerModal.value = false
}

// Edit category function
const editCategory = (category: Category) => {
  editingCategory.value = category
  newCategoryName.value = category.category
  showCategoryManagerModal.value = false
  showAddCategoryModal.value = true
}

// Confirm delete category
const confirmDeleteCategory = (category: Category) => {
  // You can implement a separate delete confirmation modal here
  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.category}"?`)) {
    deleteCategory(category.id)
  }
}

// Delete category function
const deleteCategory = async (categoryId: string) => {
  try {
    await deleteCategoryAPI(categoryId)
    
    // Remove from local array
    categories.value = categories.value.filter(cat => cat.id !== categoryId)
    
    showAlert('success', 'Berhasil', 'Kategori berhasil dihapus')
  } catch (error: any) {
    console.error('Failed to delete category:', error)
    showAlert('error', 'Gagal', 'Gagal menghapus kategori')
  }
}

// Get category name by ID
const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category?.category || 'Unknown Category'
}

// Modal functions
const openFileInput = () => {
  fileInputRef.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (isEditMode.value && editingProduct.value && existingAssets.value.length > 0) {
      // Edit mode: Store file for replacement but don't call API yet
      pendingMainImageFile.value = file
      isReplacingMainImage.value = true
      
      // Create preview for UI
      const reader = new FileReader()
      reader.onload = (e) => {
        newProduct.value.image = e.target?.result as string
      }
      reader.readAsDataURL(file)
      
      // Update uploadedFiles to ensure main image is first
      uploadedFiles.value = [file, ...uploadedFiles.value.filter((_, index) => index !== 0)]
    } else {
      // Create mode: Store file for upload later
      uploadedFiles.value = [file]
      
      // Create preview for UI
      const reader = new FileReader()
      reader.onload = (e) => {
        newProduct.value.image = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

const handleAdditionalImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    // Hitung current additional images (excludes main image)
    const currentAdditionalImages = additionalImagesCount.value
    const availableSlots = 7 - currentAdditionalImages // Max 7 additional images
    
    console.log(`Current additional images: ${currentAdditionalImages}, Available slots: ${availableSlots}`)
    
    if (availableSlots <= 0) {
      error('Upload Gagal', 'Maksimal 7 gambar tambahan')
      target.value = '' // Reset file input
      return
    }
    
    // Batasi files yang akan diproses sesuai slot yang tersedia
    const filesToProcess = Array.from(files).slice(0, availableSlots)
    
    if (filesToProcess.length < files.length) {
      error('Upload Terbatas', `Hanya ${filesToProcess.length} gambar yang dapat ditambahkan. Maksimal 7 gambar tambahan.`)
    }
    
    // Process files yang diizinkan
    filesToProcess.forEach(file => {
      // Add to appropriate storage
      if (isEditMode.value) {
        if (isReplacingMainImage.value) {
          uploadedFiles.value.push(file) // Add after main image
        } else {
          uploadedFiles.value.push(file)
        }
      } else {
        // Create mode: add to additional images tracking
        additionalImageFiles.value.push(file)
      }
      
      // Create preview for UI
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!newProduct.value.images) {
          newProduct.value.images = []
        }
        newProduct.value.images.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
    
    // Reset file input
    target.value = ''
  }
}

const removeAdditionalImage = (index: number) => {
  if (newProduct.value.images) {
    // Get sorted existing assets (order 2+ for additional images)
    const additionalAssets = existingAssets.value
      .filter(asset => asset.order > 1)
      .sort((a, b) => a.order - b.order)
    
    console.log(`Removing image at index ${index}`)
    console.log('Additional assets:', additionalAssets.map(a => `${a.id} (order: ${a.order})`))
    console.log('Current images array length:', newProduct.value.images.length)
    
    if (index < additionalAssets.length) {
      // This is an existing image - mark for deletion
      const assetToDelete = additionalAssets[index]
      if (assetToDelete && !assetsToDelete.value.includes(assetToDelete.id)) {
        assetsToDelete.value.push(assetToDelete.id)
        console.log(`Marked asset ${assetToDelete.id} (order: ${assetToDelete.order}) for deletion`)
        
        // Remove from existingAssets tracking array immediately to prevent double processing
        const assetIndex = existingAssets.value.findIndex(asset => asset.id === assetToDelete.id)
        if (assetIndex !== -1) {
          existingAssets.value.splice(assetIndex, 1)
          console.log(`Removed asset from existingAssets tracking`)
        }
      }
    } else {
      // This is a new uploaded file
      const newFileIndex = index - additionalAssets.length
      
      if (isEditMode.value) {
        // Edit mode: remove from uploadedFiles
        if (newFileIndex >= 0 && newFileIndex < uploadedFiles.value.length) {
          const startIndex = isReplacingMainImage.value ? 1 : 0
          const actualIndex = startIndex + newFileIndex
          if (actualIndex < uploadedFiles.value.length) {
            uploadedFiles.value.splice(actualIndex, 1)
            console.log(`Removed uploaded file at index ${actualIndex}`)
          }
        }
      } else {
        // Create mode: remove from additionalImageFiles
        if (newFileIndex >= 0 && newFileIndex < additionalImageFiles.value.length) {
          additionalImageFiles.value.splice(newFileIndex, 1)
          console.log(`Removed additional image file at index ${newFileIndex}`)
        }
      }
    }
    
    // Remove from UI display array
    newProduct.value.images.splice(index, 1)
    console.log(`Removed from UI, new images length: ${newProduct.value.images.length}`)
  }
}

const removeMainImage = () => {
  console.log('Removing main image')
  
  if (isEditMode.value) {
    // Edit mode: check if there's an existing main image to delete
    const mainAsset = existingAssets.value.find(asset => asset.order === 1)
    if (mainAsset) {
      // Mark existing main image for deletion
      if (!assetsToDelete.value.includes(mainAsset.id)) {
        assetsToDelete.value.push(mainAsset.id)
        console.log(`Marked main image asset ${mainAsset.id} for deletion`)
      }
      
      // Remove from existingAssets tracking
      const assetIndex = existingAssets.value.findIndex(asset => asset.id === mainAsset.id)
      if (assetIndex !== -1) {
        existingAssets.value.splice(assetIndex, 1)
        console.log('Removed main image from existingAssets tracking')
      }
    }
    
    // Clear pending main image file if any
    pendingMainImageFile.value = null
    isReplacingMainImage.value = false
    
    // Remove from uploaded files if it's the first item
    if (uploadedFiles.value.length > 0) {
      uploadedFiles.value.splice(0, 1)
      console.log('Removed main image from uploadedFiles')
    }
  } else {
    // Create mode: just remove from uploadedFiles
    if (uploadedFiles.value.length > 0) {
      uploadedFiles.value.splice(0, 1)
      console.log('Removed main image from uploadedFiles (create mode)')
    }
  }
  
  // Clear main image preview
  newProduct.value.image = ''
  console.log('Cleared main image preview')
}

const openAdditionalFileInput = () => {
  additionalFileInputRef.value?.click()
}

const resetForm = () => {
  newProduct.value = {
    name: '',
    price: null,
    status: 'draft',
    image: '',
    images: [],
    description: '',
    category_id: '',
    category_name: '',
    specifications: '',
    discount: 0
  }
  // Reset price formatting
  formattedPrice.value = ''
  formattedDiscountedPrice.value = ''
  
  // Reset uploaded files and tracking arrays
  uploadedFiles.value = []
  additionalImageFiles.value = []
  assetsToDelete.value = []
  existingAssets.value = []
  isReplacingMainImage.value = false
  
  // Clear pending changes
  pendingMainImageFile.value = null
  originalAssets.value = []
  originalMainImage.value = ''
}

const loadProductData = () => {
  if (editingProduct.value) {
    // Sort assets by order field to ensure correct sequence
    const sortedAssets = editingProduct.value.assets 
      ? [...editingProduct.value.assets].sort((a, b) => a.order - b.order)
      : []
    
    // Store existing assets for tracking (sorted)
    existingAssets.value = [...sortedAssets]
    
    // Main image is always order 1
    const mainImage = sortedAssets.find(asset => asset.order === 1)
    
    // Additional images are order 2, 3, 4, etc. (sorted)
    const additionalAssets = sortedAssets.filter(asset => asset.order > 1)
    
    console.log('Loading product data:')
    console.log('Sorted assets:', sortedAssets.map(a => `${a.id} (order: ${a.order})`))
    console.log('Additional assets:', additionalAssets.map(a => `${a.id} (order: ${a.order})`))
    
    newProduct.value = {
      name: editingProduct.value.name,
      price: editingProduct.value.price,
      status: editingProduct.value.status, // This should already be in 'active'/'draft' format from fetchProducts
      image: mainImage ? getImageOrAlt(mainImage.url) : '',
      images: additionalAssets.map(asset => getImageOrAlt(asset.url)), // Ordered 2,3,4...
      description: editingProduct.value.description || '',
      category_id: editingProduct.value.category_id || '', // Use category_id instead of category
      category_name: '',
      specifications: editingProduct.value.specifications || '',
      discount: editingProduct.value.discount || 0
    }
    
    // Set formatted price for editing
    formattedPrice.value = formatPriceForInput(editingProduct.value.price)
    
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
const openEditModal = async (product: Product) => {
  // Refresh product data from backend to ensure consistency
  try {
    await fetchProducts()
    
    // Find the updated product from the refreshed list
    const updatedProduct = products.value.find(p => p.id === product.id)
    if (updatedProduct) {
      editingProduct.value = { ...updatedProduct }
      
      // Backup original state for cancel functionality
      originalAssets.value = updatedProduct.assets ? [...updatedProduct.assets] : []
      originalMainImage.value = updatedProduct.image || ''
    } else {
      editingProduct.value = { ...product }
      originalAssets.value = product.assets ? [...product.assets] : []
      originalMainImage.value = product.image || ''
    }
  } catch (error) {
    console.error('Failed to refresh product data:', error)
    // Fallback to original product data
    editingProduct.value = { ...product }
    originalAssets.value = product.assets ? [...product.assets] : []
    originalMainImage.value = product.image || ''
  }
  
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  setTimeout(() => {
    // Restore original state if in edit mode and there were pending changes
    if (isEditMode.value && editingProduct.value) {
      // Restore original assets and image
      existingAssets.value = [...originalAssets.value]
      if (editingProduct.value) {
        editingProduct.value.assets = [...originalAssets.value]
        editingProduct.value.image = originalMainImage.value
      }
      
      // Update product in list if there were visual changes
      const index = products.value.findIndex(p => p.id === editingProduct.value!.id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          image: originalMainImage.value,
          assets: [...originalAssets.value]
        }
      }
    }
    
    resetForm()
    editingProduct.value = null
    
    // Clear pending changes
    pendingMainImageFile.value = null
    isReplacingMainImage.value = false
    originalAssets.value = []
    originalMainImage.value = ''
  }, 300)
}

// Fungsi untuk menyimpan atau update produk
const saveProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.price) {
    showAlert('error', 'Validasi Error', 'Mohon lengkapi data produk yang wajib diisi (Nama Produk dan Harga)')
    return
  }

  // Validasi category - hanya pilih dari kategori yang tersedia
  if (!newProduct.value.category_id) {
    showAlert('error', 'Validasi Error', 'Mohon pilih kategori produk')
    return
  }

  addLoading.value = true
  try {
    if (isEditMode.value && editingProduct.value) {
      // Update existing product - INTEGRASI DENGAN DATABASE
      const productData: CreateProductData = {
        name: newProduct.value.name,
        price: newProduct.value.price!,
        description: newProduct.value.description,
        specification: newProduct.value.specifications, // backend uses 'specification' (singular)
        discount: newProduct.value.discount || 0,
        featured: false,
        status: newProduct.value.status === 'active' ? 'active' : 'draft' // Convert to database format
      }

      
      // Set category ID (sekarang menggunakan ID dari database)
      productData.category_id = newProduct.value.category_id

      try {
        // First, handle main image replacement if needed
        if (isReplacingMainImage.value && pendingMainImageFile.value) {
          await replaceMainImageAPI(editingProduct.value.id, pendingMainImageFile.value)
          
          // After replacing main image, refresh product data to get updated assets
          await fetchProducts()
          const refreshedProduct = products.value.find(p => p.id === editingProduct.value!.id)
          if (refreshedProduct) {
            editingProduct.value = { ...refreshedProduct }
            existingAssets.value = refreshedProduct.assets ? [...refreshedProduct.assets] : []
          }
        }
        
        // Delete assets that were marked for deletion (with updated asset list)
        for (const assetId of assetsToDelete.value) {
          try {
            // Double-check if asset still exists in current product assets
            const assetExists = editingProduct.value.assets?.some(asset => asset.id === assetId)
            if (assetExists) {
              await deleteProductAssetAPI(editingProduct.value.id, assetId)
              console.log(`Successfully deleted asset ${assetId}`)
            } else {
              console.log(`Asset ${assetId} no longer exists (possibly replaced), skipping delete`)
            }
          } catch (error: any) {
            // If asset doesn't exist, it's likely been replaced - this is not an error
            if (error.response?.status === 404 || error.response?.data?.message?.includes('not found')) {
              console.log(`Asset ${assetId} already removed or replaced, skipping`)
            } else {
              console.warn(`Failed to delete asset ${assetId}:`, error.response?.data?.message || error.message)
            }
            // Continue with other deletions even if one fails
          }
        }
        
        // Upload additional images (skip main image if it was replaced)
        const additionalFiles = uploadedFiles.value.filter((file, index) => {
          // Skip first file if it's a main image replacement
          return !(index === 0 && isReplacingMainImage.value)
        })
        
        const response = await updateProductAPI(editingProduct.value.id, productData, additionalFiles)
        
        // Update product in local list with proper status conversion
        const index = products.value.findIndex(p => p.id === editingProduct.value!.id)
        if (index !== -1) {
          // Calculate discounted price for immediate UI update
          const discount = newProduct.value.discount || 0
          const discountedPrice = discount > 0 ? calculateDiscountedPrice(response.price, discount) : 0
          
          products.value[index] = {
            ...response,
            status: response.status === 'active' ? 'active' : 'draft', // Convert back to frontend format
            category: response.category?.category, // Category name for display
            category_id: response.category_id, // Category ID for editing
            specifications: response.specification,
            image: getImageUrl(response.assets?.[0]?.url),
            images: response.assets?.slice(1).map((asset: any) => getImageUrl(asset.url)) || [],
            discount: discount,
            discounted_price: discountedPrice
          }
        }
        
        showAlert('success', 'Berhasil', 'Produk berhasil diperbarui!')
        
        // Refresh products list to ensure all data is up to date
        await fetchProducts()
        
        // Refresh editingProduct with updated data to ensure images are current
        if (editingProduct.value) {
          const updatedProduct = products.value.find(p => p.id === editingProduct.value!.id)
          if (updatedProduct) {
            editingProduct.value = { ...updatedProduct }
            // Update original tracking data with new values
            originalAssets.value = updatedProduct.assets ? [...updatedProduct.assets] : []
            originalMainImage.value = updatedProduct.image || ''
            // Reload form data with fresh product data
            loadProductData()
            
            // Clear all pending changes since update was successful
            pendingMainImageFile.value = null
            isReplacingMainImage.value = false
            assetsToDelete.value = []
            uploadedFiles.value = []
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to update product:', error)
        showAlert('error', 'Gagal', 'Gagal memperbarui produk: ' + (error.response?.data?.message || error.message))
        return
      }
    } else {
      
      // Create new product - INTEGRASI DENGAN DATABASE
      const productData: CreateProductData = {
        name: newProduct.value.name,
        price: newProduct.value.price!,
        description: newProduct.value.description,
        specification: newProduct.value.specifications, // backend uses 'specification' (singular)
        discount: newProduct.value.discount,
        featured: false,
        status: newProduct.value.status === 'active' ? 'active' : 'draft'
      }

      // Set category ID (sekarang menggunakan ID dari database)
      productData.category_id = newProduct.value.category_id

      // Combine main image and additional images for create mode
      const allFiles = [...uploadedFiles.value, ...additionalImageFiles.value]
      console.log('All files to upload:', allFiles.length, 'Main:', uploadedFiles.value.length, 'Additional:', additionalImageFiles.value.length)

      // Call API menggunakan FormData dengan file upload
      const savedProduct = await createProductAPI(productData, allFiles)
      
      // Get category name for display using ID
      const categoryName = getCategoryName(newProduct.value.category_id)
      
      // Calculate discounted price for immediate UI update
      const discount = newProduct.value.discount || 0
      const discountedPrice = discount > 0 ? calculateDiscountedPrice(savedProduct.price, discount) : 0
      
      // Add to local products list untuk immediate UI update
      const newProductForList: Product = {
        id: savedProduct.id,
        name: savedProduct.name,
        price: savedProduct.price,
        status: savedProduct.status === 'active' ? 'active' : 'draft',
        image: getImageUrl(savedProduct.assets?.[0]?.url),
        images: savedProduct.assets?.slice(1).map((asset: any) => getImageUrl(asset.url)) || [],
        description: savedProduct.description,
        category: categoryName,
        category_id: savedProduct.category_id,
        specifications: savedProduct.specification,
        discount: discount,
        discounted_price: discountedPrice
      }
      
      products.value.unshift(newProductForList)
      
      showAlert('success', 'Berhasil', 'Produk berhasil disimpan ke database dengan kategori dan aset!')
    }
    
    closeModal()
  } catch (err: any) {
    console.error('Error saving product:', err)
    
    let errorMessage = 'Produk gagal disimpan ke database.'
    
    if (err.response) {
      const status = err.response.status
      if (status === 413) {
        errorMessage = 'Data terlalu besar untuk dikirim ke server.'
      } else if (status === 401) {
        errorMessage = 'Anda tidak memiliki akses. Silakan login ulang.'
      } else if (status === 422) {
        errorMessage = 'Data tidak valid. Periksa kembali input Anda.'
      } else if (status === 400) {
        errorMessage = `Validasi error: ${err.response.data?.message || 'Data tidak sesuai format'}`
      } else {
        errorMessage = `Server error: ${err.response.data?.message || 'Unknown error'}`
      }
    } else if (err.request) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    }
    
    showAlert('error', 'Gagal', errorMessage)
  } finally {
    addLoading.value = false
  }
}

// Fungsi untuk membuka dialog konfirmasi hapus produk
const openDeleteDialog = (product: Product) => {
  productToDelete.value = product
  showDeleteDialog.value = true
}

// Fungsi untuk menutup dialog konfirmasi
const closeDeleteDialog = () => {
  productToDelete.value = null
  showDeleteDialog.value = false
}

// Fungsi untuk hapus produk
const deleteProduct = async () => {
  if (!productToDelete.value) return
  
  deleteLoading.value = true
  const product = productToDelete.value

  try {
    await deleteProductAPI(product.id)
    
    // Remove product from local list
    products.value = products.value.filter(p => p.id !== product.id)
    
    showAlert('success', 'Berhasil', `Produk "${product.name}" berhasil dihapus`)
    closeDeleteDialog()
    
  } catch (error: any) {
    console.error('❌ Failed to delete product:', error)
    
    let errorMessage = 'Gagal menghapus produk'
    
    if (error.response?.status === 404) {
      errorMessage = 'Produk tidak ditemukan'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showAlert('error', 'Gagal', errorMessage)
  } finally {
    deleteLoading.value = false
  }
}

// Watch for modal opening and load data accordingly
watch(() => showAddModal.value, (newVal) => {
  if (newVal) {
    loadProductData()
  }
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
                        :src="getMainImageUrl(product)"
                        :alt="product.name"
                        cover
                        eager
                      >
                        <template v-slot:error>
                          <v-img 
                            :src="altImageUrl"
                            :alt="`${product.name} - Alt Image`"
                            cover
                          />
                        </template>
                      </v-img>
                    </v-avatar>
                  </v-col>
                  
                  <!-- Product Info -->
                  <v-col cols="4" md="5" class="pl-4">
                    <h3 class="text-h6 font-weight-medium mb-1">{{ product.name }}</h3>
                    
                    <!-- Harga Display -->
                    <div v-if="product.discount && product.discount > 0" class="d-flex flex-column">
                      <!-- Harga Setelah Discount -->
                      <p class="text-body-1 font-weight-bold text-success mb-0">
                        {{ formatPrice(product.discounted_price || calculateDiscountedPrice(product.price, product.discount)) }}
                      </p>
                      <!-- Harga Asli (Dicoret) -->
                      <p class="text-body-2 text-grey text-decoration-line-through mb-0">
                        {{ formatPrice(product.price) }}
                      </p>
                      <!-- Badge Discount -->
                      <v-chip color="red" size="x-small" variant="flat" class="mt-1 align-self-start">
                        -{{ product.discount }}%
                      </v-chip>
                    </div>
                    
                    <!-- Harga Normal (Tanpa Discount) -->
                    <p v-else class="text-body-2 text-grey-darken-1 mb-0">{{ formatPrice(product.price) }}</p>
                  </v-col>
                  
                  <!-- Status Display -->
                  <v-col cols="3" md="3" class="text-center">
                    <v-chip
                      :color="product.status === 'active' ? 'success' : 'warning'"
                      variant="flat"
                      size="default"
                      :prepend-icon="product.status === 'active' ? 'mdi-check' : 'mdi-clock'"
                    >
                      {{ product.status === 'active' ? 'active' : 'Draft' }}
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
                        @click="openDeleteDialog(product)"
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
                  <!-- Main Image -->
                  <v-card
                    height="200"
                    variant="outlined"
                    class="d-flex align-center justify-center mb-4 image-upload-card position-relative"
                    @click="!newProduct.image ? openFileInput() : null"
                  >
                    <div v-if="!newProduct.image" class="text-center">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-camera</v-icon>
                      <p class="text-grey-darken-1">Gambar Utama</p>
                    </div>
                    <v-img 
                      v-else
                      :src="newProduct.image"
                      cover
                      height="100%"
                      class="rounded"
                      eager
                    >
                      <template v-slot:error>
                        <v-img 
                          :src="altImageUrl"
                          alt="Main Product Image - Alt"
                          cover
                          height="100%"
                          class="rounded"
                        />
                      </template>
                    </v-img>
                    
                    <!-- Delete button overlay for main image -->
                    <div v-if="newProduct.image" class="image-overlay">
                      <v-btn
                        icon
                        size="small"
                        color="error"
                        variant="elevated"
                        class="delete-btn"
                        @click.stop="removeMainImage"
                      >
                        <v-icon size="20">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </v-card>
                  
                  <v-btn
                    block
                    variant="outlined"
                    :prepend-icon="newProduct.image ? 'mdi-pencil' : 'mdi-plus'"
                    @click="openFileInput"
                    class="mb-4"
                  >
                    {{ newProduct.image ? 'Edit Gambar Utama' : 'Tambah Gambar Utama' }}
                  </v-btn>

                  <!-- Additional Images Section -->
                  <div class="additional-images-section">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h4 class="text-subtitle-1 font-weight-medium">Gambar Tambahan</h4>
                      <v-chip 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      >
                        {{ additionalImagesCount }}/7
                      </v-chip>
                    </div>

                    <!-- Additional Images Slider -->
                    <div class="additional-images-container mb-3">
                      <div class="images-slider-wrapper">
                        <div 
                          class="images-slider" 
                          ref="imagesSlider"
                        >
                          <!-- Existing Images -->
                          <div
                            v-for="(imageUrl, index) in newProduct.images"
                            :key="`image-${index}-${imageUrl.slice(-10)}`"
                            class="image-item-slider"
                          >
                            <v-card
                              height="45"
                              width="45"
                              variant="outlined"
                              class="image-preview-card position-relative flex-shrink-0"
                              @mouseenter="$event.currentTarget.classList.add('image-hover')"
                              @mouseleave="$event.currentTarget.classList.remove('image-hover')"
                            >
                              <v-img
                                :src="imageUrl"
                                cover
                                height="100%"
                                class="rounded image-preview"
                                eager
                              >
                                <template v-slot:error>
                                  <v-img 
                                    :src="altImageUrl"
                                    alt="Additional Image - Alt"
                                    cover
                                    height="100%"
                                    class="rounded image-preview"
                                  />
                                </template>
                              </v-img>
                              <div class="image-overlay">
                                <v-btn
                                  icon
                                  size="x-small"
                                  color="error"
                                  variant="elevated"
                                  class="delete-btn"
                                  @click="removeAdditionalImage(index)"
                                >
                                  <v-icon size="12">mdi-close</v-icon>
                                </v-btn>
                              </div>
                            </v-card>
                          </div>
                          
                          <!-- Add more images button -->
                          <div
                            v-if="additionalImagesCount < 7"
                            class="image-item-slider"
                          >
                            <v-card
                              height="45"
                              width="45"
                              variant="outlined"
                              class="d-flex align-center justify-center image-upload-card add-image-card flex-shrink-0"
                              @click="openAdditionalFileInput"
                            >
                              <v-icon size="20" color="grey-lighten-1">mdi-plus</v-icon>
                            </v-card>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Add images button -->
                    <v-btn
                      block
                      variant="outlined"
                      prepend-icon="mdi-image-multiple"
                      @click="openAdditionalFileInput"
                      :disabled="isImageLimitReached"
                      size="small"
                    >
                      {{ additionalImagesCount > 0 ? 'Tambah Gambar' : 'Tambah Gambar Lainnya' }}
                    </v-btn>
                  </div>
                  
                  <!-- Hidden file inputs -->
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageUpload"
                  />
                  <input
                    ref="additionalFileInputRef"
                    type="file"
                    accept="image/*"
                    multiple
                    style="display: none"
                    @change="handleAdditionalImageUpload"
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
                      v-model="formattedPrice"
                      label="Harga"
                      :rules="priceRules"
                      variant="outlined"
                      prefix="Rp"
                      placeholder="30.000"
                      @input="handlePriceInput"
                      required
                    />
                  </v-col>
                  
                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="newProduct.status"
                      :items="productStatusOptions"
                      label="Status Produk"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  
                  <!-- Discount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="newProduct.discount"
                      label="Discount"
                      type="number"
                      :rules="discountRules"
                      variant="outlined"
                      suffix="%"
                      hint="Masukkan persentase discount (0-100)"
                      placeholder="0"
                    />
                    
                    <!-- Preview Harga Setelah Discount -->
                    <div v-if="newProduct.discount && newProduct.discount > 0 && newProduct.price" class="mt-2">
                      <v-chip
                        color="success"
                        variant="tonal"
                        size="small"
                      >
                        <v-icon start icon="mdi-tag"></v-icon>
                        Harga Setelah Discount: {{ formatPrice(previewDiscountedPrice || 0) }}
                      </v-chip>
                    </div>
                  </v-col>
                  
                  <!-- Spesifikasi Produk -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="newProduct.specifications"
                      label="Spesifikasi Produk"
                      variant="outlined"
                      rows="4"
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
              
              <!-- Kategori Produk Section -->
              <v-col cols="12">
                <v-card variant="outlined" class="category-section">
                  <v-card-title class="text-subtitle-1 font-weight-medium py-3 px-4 bg-grey-lighten-5">
                    <v-icon class="mr-2" color="primary">mdi-tag-multiple</v-icon>
                    Kategori Produk
                  </v-card-title>
                  
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center gap-3">
                      <v-select
                        v-model="newProduct.category_id"
                        :items="categoryOptions"
                        :loading="loadingCategories"
                        label="Pilih Kategori"
                        variant="outlined"
                        density="comfortable"
                        placeholder="Pilih kategori produk..."
                        class="flex-grow-1"
                        prepend-inner-icon="mdi-tag"
                        required
                        :error-messages="!newProduct.category_id && formSubmitted ? 'Kategori produk wajib dipilih' : ''"
                      >
                        <template v-slot:no-data>
                          <v-list-item>
                            <v-list-item-title class="text-grey-darken-1">
                              Tidak ada kategori tersedia
                            </v-list-item-title>
                          </v-list-item>
                        </template>
                      </v-select>
                      
                      <v-btn
                        color="primary"
                        variant="elevated"
                        size="large"
                        @click="openAddCategoryModal"
                        :disabled="loadingCategories"
                        class="category-add-btn"
                      >
                        <v-icon>mdi-plus</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Tambah Kategori Baru
                        </v-tooltip>
                      </v-btn>
                      
                      <v-btn
                        color="info"
                        variant="outlined"
                        size="large"
                        @click="openCategoryManagerModal"
                        :disabled="loadingCategories"
                        class="category-manage-btn"
                      >
                        <v-icon>mdi-cog</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Kelola Kategori
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
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
            :disabled="!newProduct.name || !newProduct.price || !newProduct.category_id"
          >
            {{ saveButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modal Tambah/Edit Kategori -->
    <v-dialog
      v-model="showAddCategoryModal"
      max-width="600px"
      persistent
      class="category-modal"
    >
      <v-card class="category-modal-card">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-primary">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="white">mdi-tag-plus</v-icon>
            <span class="text-h5 text-white font-weight-medium">
              {{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeAddCategoryModal"
            :disabled="addCategoryLoading"
          />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="createCategory">
            <div class="mb-4">
              <v-icon class="mr-2" color="primary">mdi-information</v-icon>
              <span class="text-body-2 text-grey-darken-1">
                {{ editingCategory ? 'Ubah nama kategori produk' : 'Masukkan nama kategori produk baru yang ingin ditambahkan' }}
              </span>
            </div>
            
            <v-text-field
              v-model="newCategoryName"
              label="Nama Kategori"
              variant="outlined"
              density="comfortable"
              :rules="categoryNameRules"
              placeholder="Contoh: Elektronik, Fashion, Makanan..."
              prepend-inner-icon="mdi-tag"
              autofocus
              required
              :error-messages="formSubmitted && !newCategoryName.trim() ? 'Nama kategori wajib diisi' : ''"
              class="mb-4"
            >
              <template v-slot:details>
                <div class="text-caption text-grey-darken-1 mt-1">
                  Nama kategori harus unik dan mudah dipahami
                </div>
              </template>
            </v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            size="large"
            @click="closeAddCategoryModal"
            :disabled="addCategoryLoading"
            class="mr-3"
          >
            <v-icon start>mdi-close</v-icon>
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            @click="createCategory"
            :loading="addCategoryLoading"
            :disabled="!newCategoryName.trim()"
          >
            <v-icon start>{{ editingCategory ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modal Kelola Kategori -->
    <v-dialog
      v-model="showCategoryManagerModal"
      max-width="800px"
      persistent
      class="category-manager-modal"
    >
      <v-card class="category-manager-card">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-info">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="white">mdi-cog</v-icon>
            <span class="text-h5 text-white font-weight-medium">
              Kelola Kategori Produk
            </span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeCategoryManagerModal"
          />
        </v-card-title>
        
        <v-card-text class="pa-0">
          <!-- Header Section -->
          <div class="pa-6 bg-grey-lighten-5 border-b">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h3 class="text-h6 font-weight-medium mb-1">Daftar Kategori</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Kelola semua kategori produk Anda
                </p>
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="openAddCategoryModal"
              >
                Tambah Kategori
              </v-btn>
            </div>
            
            <!-- Stats -->
            <div class="mt-4">
              <v-chip
                color="info"
                variant="tonal"
                size="small"
                prepend-icon="mdi-tag-multiple"
              >
                Total: {{ categories.length }} kategori
              </v-chip>
            </div>
          </div>
          
          <!-- Categories List -->
          <div class="category-list">
            <div v-if="loadingCategories" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4 text-grey-darken-1">Memuat kategori...</p>
            </div>
            
            <div v-else-if="categories.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-tag-off</v-icon>
              <h3 class="text-h6 text-grey-darken-1 mb-2">Belum Ada Kategori</h3>
              <p class="text-body-2 text-grey-darken-1 mb-4">
                Tambahkan kategori pertama untuk mengorganisir produk Anda
              </p>
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="openAddCategoryModal"
              >
                Tambah Kategori Pertama
              </v-btn>
            </div>
            
            <div v-else>
              <div
                v-for="(category, index) in categories"
                :key="category.id"
                class="category-item"
              >
                <v-row class="pa-4 align-center" no-gutters>
                  <!-- Category Icon & Info -->
                  <v-col cols="8" class="d-flex align-center">
                    <v-avatar
                      size="48"
                      color="primary"
                      variant="tonal"
                      class="mr-4"
                    >
                      <v-icon color="primary">mdi-tag</v-icon>
                    </v-avatar>
                    
                    <div>
                      <h4 class="text-h6 font-weight-medium mb-1">
                        {{ category.category }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-1 mb-0">
                        ID: {{ category.id }}
                      </p>
                      <v-chip
                        color="success"
                        variant="tonal"
                        size="x-small"
                        class="mt-1"
                      >
                        active
                      </v-chip>
                    </div>
                  </v-col>
                  
                  <!-- Actions -->
                  <v-col cols="4" class="text-right">
                    <div class="d-flex justify-end align-center ga-2">
                      <v-btn
                        icon="mdi-pencil"
                        variant="outlined"
                        size="small"
                        color="primary"
                        @click="editCategory(category)"
                      >
                        <v-tooltip activator="parent" location="top">
                          Edit Kategori
                        </v-tooltip>
                      </v-btn>
                      
                      <v-btn
                        icon="mdi-delete"
                        variant="outlined"
                        size="small"
                        color="error"
                        @click="confirmDeleteCategory(category)"
                      >
                        <v-tooltip activator="parent" location="top">
                          Hapus Kategori
                        </v-tooltip>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
                <v-divider v-if="index < categories.length - 1" />
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 bg-grey-lighten-5">
          <v-spacer />
          <v-btn
            variant="outlined"
            size="large"
            @click="closeCategoryManagerModal"
          >
            <v-icon start>mdi-close</v-icon>
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modal Konfirmasi Delete -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
      persistent
    >
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Konfirmasi Hapus
        </v-card-title>
        
        <v-card-text>
          <div class="text-body-1 mb-2">
            Apakah Anda yakin ingin menghapus produk ini?
          </div>
          <v-alert 
            type="warning" 
            variant="tonal" 
            density="compact"
            class="mb-2"
          >
            <strong>{{ productToDelete?.name }}</strong>
          </v-alert>
          <div class="text-caption text-medium-emphasis">
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait produk ini.
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDeleteDialog"
            :disabled="deleteLoading"
          >
            Batal
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteProduct"
            :loading="deleteLoading"
          >
            Hapus
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

/* Additional Images Styling */
.additional-images-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.additional-images-container {
  width: 100%;
}

.images-slider-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  padding: 8px;
}

.images-slider {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px 0;
  /* Hide scrollbar for cleaner look while keeping functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.images-slider::-webkit-scrollbar {
  height: 6px;
}

.images-slider::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.images-slider::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.images-slider::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.image-item-slider {
  position: relative;
  flex-shrink: 0;
}

/* Remove old grid styling */
.images-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.image-item {
  position: relative;
  flex-shrink: 0;
}

.image-preview-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.image-preview {
  transition: all 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* Main image hover effect */
.image-upload-card:hover .image-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: all;
}

.image-preview-card.image-hover .image-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: all;
}

.image-preview-card.image-hover .image-preview {
  filter: blur(2px);
  transform: scale(1.05);
}

.delete-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.add-image-card {
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.add-image-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Navigation buttons styling */
.additional-images-container .v-btn--icon {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .images-slider {
    gap: 6px;
  }
  
  .image-item-slider .image-preview-card,
  .image-item-slider .add-image-card {
    height: 60px !important;
    width: 60px !important;
  }
  
  .images-slider-wrapper {
    padding: 6px;
  }
}

/* Enhanced slider styling */
.images-slider-wrapper:hover .images-slider::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.4);
}

/* Smooth transitions */
.image-item-slider {
  transition: transform 0.2s ease;
}

.image-item-slider:hover {
  transform: translateY(-2px);
}

/* Counter chip styling */
.v-chip {
  font-size: 0.75rem;
  height: 20px;
}

/* Category Section Styling */
.category-section {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.category-section:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}
.category-add-btn, .category-manage-btn {
  top: -10px;
  margin-left: 8px;
  min-width: 48px;
  height: 48px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.3);
}

.category-manage-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-info), 0.3);
}

/* Category Modal Styling */
.category-modal :deep(.v-overlay__scrim),
.category-manager-modal :deep(.v-overlay__scrim) {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.category-modal-card,
.category-manager-card {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  overflow: hidden;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

/* Enhanced transitions */
.v-btn {
  transition: all 0.2s ease;
}

.v-avatar {
  transition: transform 0.2s ease;
}

.category-item:hover .v-avatar {
  transform: scale(1.1);
}
</style>
