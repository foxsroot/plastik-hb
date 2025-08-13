<template>
  <v-row>
    <v-col
      v-for="product in products"
      :key="product.id"
      cols="12"
      sm="6"
      md="4"
      lg="2"
      xl="2"
    >
      <ProductCard :product="product" :imageUrl="getMainImageUrl(product)" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import ProductCard from "./ProductCard.vue";

const props = defineProps<{
  products: any[];
  getMainImageUrl: (product: any) => string;
}>();
</script>

<style scoped>
.product-card {
  max-width: 300px;
  margin: auto;
}
</style>
