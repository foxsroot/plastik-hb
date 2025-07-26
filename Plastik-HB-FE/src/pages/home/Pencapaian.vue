<template>
  <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
    <v-row>
      <v-col cols="12">
        <div class="text-center mb-8">
          <h2 class="text-h5 font-weight-bold mb-6">
            Achievement
          </h2>
        </div>
      </v-col>
    </v-row>

    <v-row class="achievement-content mb-12">
      <!-- Left Side - Large Image or Achievement Items -->
      <v-col cols="12" md="6" class="left-section">
        <div v-if="leftSideAchievements.length === 0" class="large-image-placeholder">
          <v-card class="fill-height d-flex align-center justify-center bg-grey-darken-3 rounded-lg elevation-1" outlined>
            <div class="text-center pa-8">
              <v-icon size="80" color="amber">mdi-image-outline</v-icon>
              <p class="text-white mt-4">Large Image Placeholder</p>
            </div>
          </v-card>
        </div>
        
        <!-- Left Achievement Items -->
        <div v-else class="achievement-grid">
          <v-card
            v-for="achievement in leftSideAchievements"
            :key="achievement.id"
            class="achievement-card mb-4 pa-6 bg-grey-darken-3 rounded-lg elevation-1"
          >
            <v-card-text class="d-flex align-center pa-0">
              <!-- Achievement Icon/Image -->
              <v-avatar size="60" class="mr-4">
                <v-img
                  v-if="achievement.image"
                  :src="achievement.image"
                  :alt="achievement.title"
                />
                <v-icon v-else size="40" color="amber">mdi-trophy</v-icon>
              </v-avatar>
              
              <!-- Achievement Content -->
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <h3 class="achievement-percentage text-h4 font-weight-bold text-amber">
                    {{ achievement.percentage }}%
                  </h3>
                </div>
                <p class="achievement-description text-body-1 mb-0 text-white">
                  {{ achievement.description }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- Right Side - Achievement Items -->
      <v-col cols="12" md="6" class="right-section">
        <div class="achievement-grid">
          <v-card
            v-for="achievement in rightSideAchievements"
            :key="achievement.id"
            class="achievement-card mb-4 pa-6 bg-grey-darken-3 rounded-lg elevation-1"
          >
            <v-card-text class="d-flex align-center pa-0">
              <!-- Achievement Icon/Image -->
              <v-avatar size="60" class="mr-4">
                <v-img
                  v-if="achievement.image"
                  :src="achievement.image"
                  :alt="achievement.title"
                />
                <v-icon v-else size="40" color="amber">mdi-trophy</v-icon>
              </v-avatar>
              
              <!-- Achievement Content -->
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <h3 class="achievement-percentage text-h4 font-weight-bold text-amber">
                    {{ achievement.percentage }}%
                  </h3>
                </div>
                <p class="achievement-description text-body-1 mb-0 text-white">
                  {{ achievement.description }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Achievement {
  id: number
  title: string
  percentage: number
  description: string
  image?: string
}

// Sample achievement data - this will be replaced with data from admin panel later
const achievements = ref<Achievement[]>([
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
  },
  {
    id: 3,
    title: 'On-Time Delivery',
    percentage: 92,
    description: 'Ketepatan waktu pengiriman pesanan kepada pelanggan',
    image: ''
  },
  {
    id: 4,
    title: 'Environmental Friendly',
    percentage: 88,
    description: 'Komitmen terhadap produk ramah lingkungan dan berkelanjutan',
    image: ''
  },
  {
    id: 5,
    title: 'Innovation',
    percentage: 90,
    description: 'Inovasi berkelanjutan dalam pengembangan produk plastik',
    image: ''
  }
])

// Computed properties for layout distribution
const leftSideAchievements = computed(() => {
  const total = achievements.value.length
  if (total === 0) return []
  
  // Left side gets the extra item for odd numbers
  const leftCount = Math.ceil(total / 2)
  return achievements.value.slice(0, leftCount)
})

const rightSideAchievements = computed(() => {
  const total = achievements.value.length
  const leftCount = Math.ceil(total / 2)
  return achievements.value.slice(leftCount)
})
</script>

<style scoped>
.large-image-placeholder {
  height: 400px;
}

.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.achievement-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.left-section, .right-section {
  display: flex;
  flex-direction: column;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .achievement-content {
    flex-direction: column;
  }
  
  .large-image-placeholder {
    height: 250px;
    margin-bottom: 2rem;
  }
  
  .achievement-card {
    margin-bottom: 1rem;
  }
}
</style>