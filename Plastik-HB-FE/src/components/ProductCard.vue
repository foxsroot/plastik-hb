<template>
  <v-card
    class="pa-2 elevation-1 rounded-lg product-card transition-card dark-product-card"
    outlined
    dark
  >
    <div
      class="mb-2 rounded"
      style="
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <template v-if="showImage && imageUrl">
        <v-img
          :src="imageUrl"
          :alt="product.name"
          height="150"
          cover
          class="rounded"
          @error="onImageError"
        />
      </template>
      <template v-else>
        <v-icon size="60" color="primary">mdi-package-variant</v-icon>
      </template>
    </div>
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
import { ref } from "vue";
import { defineProps } from "vue";
import { formatPrice, calculateDiscountedPrice } from "@/utils/formatters";

const props = defineProps<{
  product: any;
  imageUrl: string;
}>();

const showImage = ref(!!props.imageUrl);

function onImageError() {
  showImage.value = false;
}
</script>

<style scoped>
.product-card {
  background-color: #222 !important;
}
</style>
