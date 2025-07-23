<template>
  <v-container class="banner-section py-12">
    <v-row>
      <v-col cols="12">
        <div class="banner-container">
          <v-carousel
            v-model="currentSlide"
            :continuous="true"
            :cycle="true"
            interval="5000"
            height="400"
            hide-delimiter-background
            hide-delimiters
            show-arrows="false"
            class="custom-carousel"
          >
            <v-carousel-item
              v-for="(banner, index) in banners"
              :key="index"
              :src="banner.image"
              cover
              class="banner-item"
            >
              <div class="banner-overlay">
                <v-container class="fill-height">
                  <v-row align="center" justify="center">
                    <v-col cols="12" md="8" class="text-center">
                      <h1 class="banner-title text-white mb-4">
                        {{ banner.title }}
                      </h1>
                      <p class="banner-subtitle text-white mb-6">
                        {{ banner.subtitle }}
                      </p>
                      <v-btn
                        v-if="banner.buttonText"
                        :to="banner.buttonLink"
                        color="primary"
                        size="large"
                        rounded
                        class="banner-btn"
                      >
                        {{ banner.buttonText }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-carousel-item>
          </v-carousel>

          <!-- Custom Dots Indicator -->
          <div class="banner-dots">
            <v-btn
              v-for="(banner, index) in banners"
              :key="index"
              icon
              size="small"
              variant="text"
              class="banner-dot"
              :class="{ 'active': currentSlide === index }"
              @click="goToSlide(index)"
            >
              <v-icon size="12">mdi-circle</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentSlide = ref(0)
let autoScrollInterval: number | null = null

// Sample banner data - replace with your actual data
const banners = ref([
  {
    image: '/src/assets/banner1.jpg',
    title: 'Solusi Plastik Berkualitas Tinggi',
    subtitle: 'Menyediakan berbagai produk plastik untuk kebutuhan industri dan rumah tangga',
    buttonText: 'Lihat Produk',
    buttonLink: '/katalog'
  },
  {
    image: '/src/assets/banner2.jpg',
    title: 'Custom Order Tersedia',
    subtitle: 'Kami melayani pesanan custom sesuai dengan kebutuhan spesifik Anda',
    buttonText: 'Pesan Sekarang',
    buttonLink: '/custom-order'
  },
  {
    image: '/src/assets/banner3.jpg',
    title: 'Pembelian Grosir dengan Harga Terbaik',
    subtitle: 'Dapatkan harga khusus untuk pembelian dalam jumlah besar',
    buttonText: 'Hubungi Kami',
    buttonLink: '/kontak'
  }
])

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % banners.value.length
  }, 5000) // Change slide every 5 seconds
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

onMounted(() => {
  startAutoScroll()
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<style scoped>
.banner-section {
  background-color: #ffffff;
}

.banner-container {
  position: relative;
  overflow: hidden;
}

.custom-carousel {
  border-radius: 8px;
}

.banner-item {
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-title {
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  margin: 0 auto;
}

.banner-btn {
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 0.5px;
}

.banner-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.banner-dot {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.banner-dot.active {
  background: rgba(255, 255, 255, 0.9);
}

.banner-dot:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .banner-dots {
    bottom: 10px;
  }
}
</style>