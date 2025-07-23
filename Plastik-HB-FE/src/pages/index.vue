<template>
  <div class="home-page">
    <!-- Banner Section -->
    <Banner />
    
    <!-- Achievement Section -->
    <Pencapaian />
    
    <!-- Featured Products Section -->
    <ProdukAndalan />
  </div>
</template>

<script lang="ts" setup>
import Banner from './home/Banner.vue'
import Pencapaian from './home/Pencapaian.vue'
import ProdukAndalan from './home/ProdukAndalan.vue'
</script>
