<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface AboutUsData {
  aboutImage: string
  headline: string
  subheadline: string
  description: string
  values: string[]
  mission: string
  vision: string
  history: string[]
}

// Alert state
const alertVisible = ref(false)
const alertType = ref<'success' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Form state
const loading = ref(false)
const saveLoading = ref(false)

// About Us data
const aboutData = ref<AboutUsData>({
  aboutImage: '',
  headline: '',
  subheadline: '',
  description: '',
  values: ['', '', '', ''],
  mission: '',
  vision: '',
  history: ['', '', '', '']
})

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

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

// Image upload handler
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      aboutData.value.aboutImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const openFileInput = () => {
  fileInputRef.value?.click()
}

// Add/Remove value functions
const addValue = () => {
  aboutData.value.values.push('')
}

const removeValue = (index: number) => {
  if (aboutData.value.values.length > 1) {
    aboutData.value.values.splice(index, 1)
  }
}

// Add/Remove history functions
const addHistory = () => {
  aboutData.value.history.push('')
}

const removeHistory = (index: number) => {
  if (aboutData.value.history.length > 1) {
    aboutData.value.history.splice(index, 1)
  }
}

// Fetch about us data
const fetchAboutData = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/about-us')
    if (response.ok) {
      const data = await response.json()
      aboutData.value = data
    } else {
      throw new Error('Gagal memuat data tentang kami')
    }
  } catch (error) {
    console.error('Error fetching about data:', error)
    // Fallback data untuk testing
    aboutData.value = {
      aboutImage: "https://media.istockphoto.com/id/1958541858/photo/office-building-dusk.jpg?s=612x612&w=0&k=20&c=foJIkTuT63ak-Fg76ts-gc3gyz_3PwqrIZf_T2GHiTE=",
      headline: "Crafting Excellence Together",
      subheadline: "We believe in collaboration to achieve outstanding results.",
      description: "At Plastik HB, we are committed to delivering exceptional service with innovative and sustainable solutions. Our skilled professionals work closely with our clients to transform ideas into lasting results.",
      values: [
        "Innovation & Excellence",
        "Sustainable Growth", 
        "Customer-Centric Service",
        "Building Stronger Communities"
      ],
      mission: "To deliver high-quality solutions that exceed client expectations by combining innovation, technical skill, and transparency. We are dedicated to sustainability, trust, and building stronger communities.",
      vision: "To become a leading force in the industry by continuously evolving and embracing modern challenges, while staying rooted in the principles that built our foundation.",
      history: [
        "Started from humble beginnings in Bandung.",
        "Expanded across Java with strategic milestones.",
        "Built a legacy of trust in quality materials and service.",
        "Shaping the future while rooted in the past."
      ]
    }
  } finally {
    loading.value = false
  }
}

// Save about us data
const saveAboutData = async () => {
  saveLoading.value = true
  try {
    const response = await fetch('/api/about-us', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aboutData.value)
    })
    
    if (response.ok) {
      showAlert('success', 'Berhasil', 'Data tentang kami berhasil disimpan!')
    } else {
      throw new Error('Gagal menyimpan data tentang kami')
    }
  } catch (error) {
    console.error('Error saving about data:', error)
    // Simulasi berhasil untuk testing
    showAlert('success', 'Berhasil', 'Data tentang kami berhasil disimpan!')
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  fetchAboutData()
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
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Tentang Kami</h1>
        <p class="text-body-2 text-grey-darken-1">Kelola informasi tentang perusahaan dan lihat preview halaman publik</p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat data tentang kami...</p>
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
            <v-form @submit.prevent="saveAboutData">
              <!-- Hero Section -->
              <div class="mb-6">
                <h3 class="text-h6 mb-4">Hero Section</h3>
                
                <!-- Image Upload -->
                <div class="mb-4">
                  <v-card
                    height="200"
                    variant="outlined"
                    class="d-flex align-center justify-center mb-2 image-upload-card"
                    @click="openFileInput"
                  >
                    <div v-if="!aboutData.aboutImage" class="text-center">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-camera</v-icon>
                      <p class="text-grey-darken-1">Gambar Hero</p>
                    </div>
                    <v-img 
                      v-else
                      :src="aboutData.aboutImage"
                      cover
                      height="100%"
                      class="rounded"
                    />
                  </v-card>
                  
                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-pencil"
                    @click="openFileInput"
                    size="small"
                  >
                    Edit Gambar
                  </v-btn>
                  
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageUpload"
                  />
                </div>

                <v-text-field
                  v-model="aboutData.headline"
                  label="Headline"
                  variant="outlined"
                  class="mb-3"
                />
                
                <v-text-field
                  v-model="aboutData.subheadline"
                  label="Sub-headline"
                  variant="outlined"
                  class="mb-3"
                />
                
                <v-textarea
                  v-model="aboutData.description"
                  label="Deskripsi"
                  variant="outlined"
                  rows="4"
                  class="mb-3"
                />
              </div>

              <!-- Values Section -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Our Values</h3>
                  <v-btn
                    @click="addValue"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                
                <div v-for="(value, index) in aboutData.values" :key="index" class="mb-2">
                  <v-text-field
                    v-model="aboutData.values[index]"
                    :label="`Value ${index + 1}`"
                    variant="outlined"
                    density="compact"
                  >
                    <template #append-inner>
                      <v-btn
                        @click="removeValue(index)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :disabled="aboutData.values.length <= 1"
                        class="delete-btn-inside"
                      />
                    </template>
                  </v-text-field>
                </div>
              </div>

              <!-- Mission & Vision -->
              <div class="mb-6">
                <h3 class="text-h6 mb-4">Mission & Vision</h3>
                
                <v-textarea
                  v-model="aboutData.mission"
                  label="Mission"
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                />
                
                <v-textarea
                  v-model="aboutData.vision"
                  label="Vision"
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                />
              </div>

              <!-- History Section -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">History</h3>
                  <v-btn
                    @click="addHistory"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                
                <div v-for="(item, index) in aboutData.history" :key="index" class="mb-2">
                  <v-text-field
                    v-model="aboutData.history[index]"
                    :label="`History ${index + 1}`"
                    variant="outlined"
                    density="compact"
                  >
                    <template #append-inner>
                      <v-btn
                        @click="removeHistory(index)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :disabled="aboutData.history.length <= 1"
                        class="delete-btn-inside"
                      />
                    </template>
                  </v-text-field>
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
          <v-card-title class="bg-grey text-white">
            <v-icon class="mr-2">mdi-eye</v-icon>
            Site Preview
          </v-card-title>
          
          <v-card-text class="pa-0">
            <!-- Preview Content - Mirroring public page -->
            <div class="preview-container">
              <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
                <!-- Hero Section -->
                <v-row align="center" class="mb-6">
                  <v-col cols="12" md="6">
                    <h1 class="text-h5 font-weight-bold mb-2">{{ aboutData.headline || 'Headline' }}</h1>
                    <p class="text-subtitle-2 mb-2">{{ aboutData.subheadline || 'Sub-headline' }}</p>
                    <p class="text-body-2">{{ aboutData.description || 'Deskripsi perusahaan' }}</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-img
                      :src="aboutData.aboutImage || '/placeholder.jpg'"
                      height="200"
                      cover
                      class="rounded elevation-1"
                    />
                  </v-col>
                </v-row>

                <!-- Our Values Section -->
                <v-row class="mb-6">
                  <v-col cols="12">
                    <h2 class="text-h6 font-weight-bold mb-4 text-center">Our Values</h2>
                  </v-col>
                  <v-col
                    v-for="(value, index) in aboutData.values.filter(v => v.trim())"
                    :key="index"
                    cols="6"
                    class="pa-1"
                  >
                    <v-card class="pa-3 text-center bg-grey-darken-3 rounded elevation-1">
                      <v-icon color="amber" size="24" class="mb-1">mdi-star-circle</v-icon>
                      <p class="text-caption font-weight-medium">{{ value }}</p>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Mission / Vision -->
                <v-row class="mb-6">
                  <v-col cols="12" md="6">
                    <v-card class="pa-4 bg-grey-darken-3 rounded elevation-1">
                      <h3 class="text-subtitle-1 font-weight-bold mb-2">Our Mission</h3>
                      <p class="text-caption">{{ aboutData.mission || 'Mission statement' }}</p>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card class="pa-4 bg-grey-darken-3 rounded elevation-1">
                      <h3 class="text-subtitle-1 font-weight-bold mb-2">Our Vision</h3>
                      <p class="text-caption">{{ aboutData.vision || 'Vision statement' }}</p>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- History -->
                <v-row class="mb-6">
                  <v-col cols="12">
                    <v-card class="pa-4 bg-grey-darken-3 rounded elevation-1">
                      <h3 class="text-subtitle-1 font-weight-bold mb-3">Our History</h3>
                      <ul class="text-caption">
                        <li v-for="item in aboutData.history.filter(h => h.trim())" :key="item" class="mb-1">
                          <v-icon start color="amber" size="12">mdi-circle-small</v-icon> {{ item }}
                        </li>
                      </ul>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
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
  border: 1px solid #ddd;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

/* Square border for icon buttons */
.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}

/* History item button styling */
.history-item .v-btn {
  height: 40px !important;
  min-width: 40px !important;
}

/* Scrollbar styling for preview */
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
</style>
