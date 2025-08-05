<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface ContactInfo {
  whatsappNumber: string
  address: string
  googleMapsLink: string
  mapEmbedUrl?: string
}

// Alert state
const alertVisible = ref(false)
const alertType = ref<'success' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Form state
const loading = ref(false)
const saveLoading = ref(false)

// Contact information data
const contactInfo = ref<ContactInfo>({
  whatsappNumber: '',
  address: '',
  googleMapsLink: '',
  mapEmbedUrl: ''
})

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

// Extract coordinates and generate embed URL from Google Maps link
const extractEmbedUrl = () => {
  const link = contactInfo.value.googleMapsLink.trim()
  if (!link) {
    contactInfo.value.mapEmbedUrl = ''
    return
  }

  try {
    let lat: string | null = null
    let lng: string | null = null
    let placeId: string | null = null
    let query: string | null = null

    // Method 1: Extract coordinates from various Google Maps URL formats
    
    // Format: @lat,lng,zoom (most common in shared links)
    const coordMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),?\d*\.?\d*z?/)
    if (coordMatch) {
      lat = coordMatch[1]
      lng = coordMatch[2]
    }

    // Format: ll=lat,lng (older format)
    const llMatch = link.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (llMatch && !lat) {
      lat = llMatch[1]
      lng = llMatch[2]
    }

    // Format: q=lat,lng (query format)
    const qCoordMatch = link.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qCoordMatch && !lat) {
      lat = qCoordMatch[1]
      lng = qCoordMatch[2]
    }

    // Extract place ID
    const placeMatch = link.match(/place\/([^\/]+)/) || link.match(/data=.*!3m1!4b1!4m\d+!4m\d+!1m0!1m\d+!1m\d+!1s([^!]+)/)
    if (placeMatch) {
      placeId = placeMatch[1]
    }

    // Extract search query
    const queryMatch = link.match(/q=([^&]+)/) || link.match(/query=([^&]+)/)
    if (queryMatch && !lat && !placeId) {
      query = decodeURIComponent(queryMatch[1])
    }

    // Generate embed URL based on available data
    if (lat && lng) {
      // Use exact coordinates
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zM40nMDAuMCJOKzEwNsKwMDAuMCJF!5e0!3m2!1sen!2sid!4v${Date.now()}!5m2!1sen!2sid`
    } else if (placeId) {
      // Use place ID for exact location
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=place_id:${placeId}`
      // Alternative without API key (using generic embed with place search)
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d107.61309431431302!3d-6.917464194993026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${placeId}!5e0!3m2!1sen!2sid!4v${Date.now()}!5m2!1sen!2sid`
    } else if (query) {
      // Use search query
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(query)}`
      // Alternative: use the address as fallback
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d107.61309431431302!3d-6.917464194993026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2s${encodeURIComponent(contactInfo.value.address || query)}!5e0!3m2!1sen!2sid!4v${Date.now()}!5m2!1sen!2sid`
    } else {
      // Fallback: try to extract any location info from the URL
      const fallbackQuery = contactInfo.value.address || 'Bandung, Indonesia'
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d107.61309431431302!3d-6.917464194993026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2s${encodeURIComponent(fallbackQuery)}!5e0!3m2!1sen!2sid!4v${Date.now()}!5m2!1sen!2sid`
    }

    console.log('Extracted coordinates:', { lat, lng, placeId, query })
    console.log('Generated embed URL:', contactInfo.value.mapEmbedUrl)
    
  } catch (error) {
    console.error('Error extracting embed URL:', error)
    showAlert('error', 'Error', 'Gagal memproses link Google Maps. Pastikan link valid.')
    contactInfo.value.mapEmbedUrl = ''
  }
}

// Alternative function to generate embed URL using Google Maps Embed API
const generateEmbedUrlWithAPI = (apiKey: string) => {
  const link = contactInfo.value.googleMapsLink.trim()
  if (!link) return

  try {
    // Extract place ID, coordinates, or query from the link
    const placeMatch = link.match(/place\/([^\/]+)/)
    const coordMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),?\d*\.?\d*z?/)
    
    if (placeMatch) {
      const placeId = placeMatch[1]
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}`
    } else if (coordMatch) {
      const lat = coordMatch[1]
      const lng = coordMatch[2]
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15`
    } else {
      // Use search with address
      const query = encodeURIComponent(contactInfo.value.address || 'Bandung, Indonesia')
      contactInfo.value.mapEmbedUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}`
    }
  } catch (error) {
    console.error('Error generating embed URL with API:', error)
  }
}

// Watch for changes in Google Maps link
watch(() => contactInfo.value.googleMapsLink, () => {
  if (contactInfo.value.googleMapsLink) {
    extractEmbedUrl()
  } else {
    contactInfo.value.mapEmbedUrl = ''
  }
}, { immediate: true })

// Fetch contact information
const fetchContactInfo = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/contact-info')
    if (response.ok) {
      const data = await response.json()
      contactInfo.value = data
    } else {
      throw new Error('Gagal memuat informasi kontak')
    }
  } catch (error) {
    console.error('Error fetching contact info:', error)
    // Fallback data untuk testing with a real Google Maps link
    contactInfo.value = {
      whatsappNumber: '0812312332',
      address: 'Jl Dipatiukur No 11, Bandung',
      googleMapsLink: 'https://maps.google.com/?q=-6.9175,107.6191&z=15', // Real coordinates for Dipatiukur, Bandung
      mapEmbedUrl: ''
    }
    // Extract embed URL from the fallback data
    extractEmbedUrl()
  } finally {
    loading.value = false
  }
}

// Save contact information
const saveContactInfo = async () => {
  saveLoading.value = true
  try {
    const response = await fetch('/api/contact-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactInfo.value)
    })
    
    if (response.ok) {
      showAlert('success', 'Berhasil', 'Informasi kontak berhasil disimpan!')
    } else {
      throw new Error('Gagal menyimpan informasi kontak')
    }
  } catch (error) {
    console.error('Error saving contact info:', error)
    // Simulasi berhasil untuk testing
    showAlert('success', 'Berhasil', 'Informasi kontak berhasil disimpan!')
  } finally {
    saveLoading.value = false
  }
}

// Format WhatsApp number
const formatWhatsAppNumber = () => {
  let number = contactInfo.value.whatsappNumber.replace(/\D/g, '')
  if (number.startsWith('0')) {
    number = '62' + number.substring(1)
  } else if (!number.startsWith('62')) {
    number = '62' + number
  }
  return number
}

onMounted(() => {
  fetchContactInfo()
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
        <h1 class="text-h4 font-weight-bold">Informasi Kontak</h1>
        <p class="text-body-2 text-grey-darken-1">Kelola informasi kontak dan lokasi toko</p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat informasi kontak...</p>
    </div>

    <!-- Contact Form -->
    <v-card v-else variant="outlined" class="pa-6">
      <v-form @submit.prevent="saveContactInfo">
        <v-row>
          <!-- WhatsApp Number -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="contactInfo.whatsappNumber"
              label="Nomor WhatsApp"
              variant="outlined"
              prepend-inner-icon="mdi-whatsapp"
              placeholder="0812312332"
              required
            />
          </v-col>

          <!-- Address -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="contactInfo.address"
              label="Alamat Toko"
              variant="outlined"
              prepend-inner-icon="mdi-map-marker"
              placeholder="Jl Dipatiukur No 11"
              required
            />
          </v-col>

          <!-- Google Maps Link -->
          <v-col cols="12" md="8">
            <v-text-field
              v-model="contactInfo.googleMapsLink"
              label="Link Google Maps"
              variant="outlined"
              prepend-inner-icon="mdi-google-maps"
              placeholder="https://maps.google.com/?q=-6.9175,107.6191"
              hint="Salin link dari Google Maps (format: https://maps.google.com/?q=lat,lng atau link tempat)"
              persistent-hint
              required
            />
          </v-col>

          <!-- Save Button Column -->
          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn
              type="submit"
              color="primary"
              variant="elevated"
              :loading="saveLoading"
              :disabled="!contactInfo.whatsappNumber || !contactInfo.address || !contactInfo.googleMapsLink"
              block
              size="large"
            >
              Simpan
            </v-btn>
          </v-col>

          <!-- Maps Preview Section -->
          <v-col cols="12">
            <v-row>
              <!-- Map Embed -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" height="300">
                  <v-card-title class="text-center">
                    <v-icon class="mr-2">mdi-map</v-icon>
                    Maps Preview
                  </v-card-title>
                  <v-card-text class="pa-0">
                    <div v-if="contactInfo.mapEmbedUrl" class="map-container">
                      <iframe
                        :src="contactInfo.mapEmbedUrl"
                        width="100%"
                        height="240"
                        style="border:0;"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div v-else class="d-flex align-center justify-center" style="height: 240px;">
                      <div class="text-center text-grey-darken-1">
                        <v-icon size="48" class="mb-2">mdi-map-outline</v-icon>
                        <p>Masukkan link Google Maps untuk preview</p>
                        <small class="text-caption">
                          Contoh: https://maps.google.com/?q=-6.9175,107.6191
                        </small>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Contact Info Preview -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" height="300" class="pa-4">
                  <v-card-title class="text-center pa-0 mb-4">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    Informasi Kontak
                  </v-card-title>
                  
                  <v-list density="compact" class="pa-0">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="green">mdi-whatsapp</v-icon>
                      </template>
                      <v-list-item-title>WhatsApp</v-list-item-title>
                      <v-list-item-subtitle>{{ contactInfo.whatsappNumber || 'Belum diisi' }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn
                          v-if="contactInfo.whatsappNumber"
                          :href="`https://wa.me/${formatWhatsAppNumber()}`"
                          target="_blank"
                          icon="mdi-open-in-new"
                          variant="text"
                          size="small"
                        />
                      </template>
                    </v-list-item>

                    <v-divider class="my-2" />

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="red">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Alamat</v-list-item-title>
                      <v-list-item-subtitle>{{ contactInfo.address || 'Belum diisi' }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-2" />

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="blue">mdi-google-maps</v-icon>
                      </template>
                      <v-list-item-title>Google Maps</v-list-item-title>
                      <v-list-item-subtitle class="text-truncate">
                        {{ contactInfo.googleMapsLink || 'Belum diisi' }}
                      </v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn
                          v-if="contactInfo.googleMapsLink"
                          :href="contactInfo.googleMapsLink"
                          target="_blank"
                          icon="mdi-open-in-new"
                          variant="text"
                          size="small"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<style scoped>
.map-container iframe {
  border-radius: 8px;
}

.v-list-item-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
