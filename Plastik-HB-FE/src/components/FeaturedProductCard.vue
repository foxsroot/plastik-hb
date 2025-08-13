<template>
  <v-card variant="outlined" class="pa-4 featured-product-card">
    <div class="d-flex align-center mb-3">
      <div class="featured-product-img">
        <v-img :src="product.assets[0]?.url || '/placeholder.jpg'" width="64" height="64" cover />
      </div>
      <div class="flex-grow-1">
        <h4 class="text-subtitle-1">{{ product.name }}</h4>
        <p class="text-caption text-grey-darken-1 mb-0">{{ product.category?.category }}</p>
      </div>
      <v-btn @click="$emit('remove')" icon="mdi-delete" variant="text" size="small" color="error" />
    </div>
    <div class="d-flex mb-3 align-center">
      <div class="flex-grow-1">
        <p class="text-body-2 mb-2">{{ product.description }}</p>
        <div class="d-flex align-center">
          <span v-if="product.discount && product.discount > 0" class="text-h6 font-weight-bold text-primary mr-2">
            {{ formatPrice(product.price - (product.price * product.discount / 100)) }}
          </span>
          <span v-if="product.discount && product.discount > 0" class="text-h6 font-weight-bold text-grey-darken-1 mr-2" style="text-decoration: line-through;">
            {{ formatPrice(product.price) }}
          </span>
          <span v-else class="text-h6 font-weight-bold text-primary">
            {{ formatPrice(product.price) }}
          </span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps({
  product: { type: Object, required: true },
  formatPrice: { type: Function, required: true },
});
</script>
