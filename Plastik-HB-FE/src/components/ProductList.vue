<template>
  <v-row>
    <v-col
      v-for="product in products"
      :key="product.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <ProductCard
        :product="product"
        :imageUrl="getMainImageUrl(product)"
        :altImageUrl="altImageUrl"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import ProductCard from "./ProductCard.vue";

const props = defineProps<{
  products: any[];
  getMainImageUrl: (product: any) => string;
  altImageUrl: string;
}>();
</script>
