<template>
  <v-card
    class="pa-2 elevation-1 rounded-lg product-card transition-card dark-product-card"
    outlined
    dark
  >
    <v-img
      :src="imageUrl"
      :alt="product.name"
      height="150"
      cover
      class="rounded mb-2"
    >
      <template #error>
        <v-img
          :src="altImageUrl"
          :alt="product.name"
          height="150"
          cover
          class="rounded mb-2"
        />
      </template>
    </v-img>
    <v-card-title class="text-subtitle-1 font-weight-medium mb-1 text-white">
      {{ product.name }}
    </v-card-title>
    <v-card-subtitle class="text-grey-lighten-2 mb-1">
      {{ product.category?.category || "Kategori tidak tersedia" }}
    </v-card-subtitle>
    <v-card-subtitle class="text-primary font-weight-bold mb-2">
      <span v-if="product.discount > 0">
        {{
          formatPrice(calculateDiscountedPrice(product.price, product.discount))
        }}
        <span class="text-red text-decoration-line-through ml-2">
          {{ formatPrice(product.price) }}
        </span>
        <v-chip size="x-small" color="error" variant="flat" class="ml-2">
          -{{ product.discount }}%
        </v-chip>
      </span>
      <span v-else>
        {{ formatPrice(product.price) }}
      </span>
    </v-card-subtitle>
    <v-card-actions>
      <v-btn
        :to="{ path: '/detail-produk', query: { id: product.id } }"
        color="primary"
        variant="elevated"
        size="small"
        block
        class="text-capitalize"
      >
        Detail Produk
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { formatPrice, calculateDiscountedPrice } from "@/utils/formatters";

const props = defineProps<{
  product: any;
  imageUrl: string;
  altImageUrl: string;
}>();
</script>

<style scoped>
.product-card {
  background-color: #222 !important;
}
</style>
