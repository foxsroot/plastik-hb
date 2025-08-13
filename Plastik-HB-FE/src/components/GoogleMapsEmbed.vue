<template>
  <v-card variant="outlined" height="300">
    <v-card-title class="text-center">
      <v-icon class="mr-2">mdi-map</v-icon>
      Maps Preview
    </v-card-title>
    <v-card-text class="pa-0">
      <div v-if="mapUrl" class="map-container">
        <iframe
          :src="mapUrl"
          width="100%"
          height="240"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
      <div
        v-else
        class="d-flex align-center justify-center"
        style="height: 240px"
      >
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
</template>

<script setup lang="ts">
const props = defineProps({
  mapUrl: String,
});
</script>
