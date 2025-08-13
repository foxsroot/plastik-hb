<template>
  <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
    <v-row>
      <v-col cols="12">
        <div class="banner-container">
          <v-carousel
            v-model="localCurrentSlide"
            :continuous="true"
            :cycle="true"
            interval="5000"
            height="450"
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
            <div
              v-for="(banner, index) in banners"
              :key="index"
              class="banner-dot"
              :class="{ active: localCurrentSlide === index }"
              @click="emitGoToSlide(index)"
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
const props = defineProps<{ banners: any[]; currentSlide: number }>();
const emit = defineEmits(["update:currentSlide", "goToSlide"]);
const localCurrentSlide = ref(props.currentSlide);

watch(
  () => props.currentSlide,
  (val) => {
    localCurrentSlide.value = val;
  },
);
watch(localCurrentSlide, (val) => {
  emit("update:currentSlide", val);
});
function emitGoToSlide(index: number) {
  emit("goToSlide", index);
}
</script>

<style scoped>
.banner-container {
  position: relative;
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
}
.banner-dot.active {
  background: #1976d2;
  transform: scale(1.2);
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
</style>
