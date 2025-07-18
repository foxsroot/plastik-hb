<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import Banner from './components/home/Banner.vue';
import Achievement from './components/home/Achievement.vue';
import FeaturedProduct from './components/home/FeaturedProduct.vue';
</script>

<template>
  <header>
    <Navbar />
  </header>

  <main>
    <Banner />
    <Achievement />
    <FeaturedProduct />
  </main>
</template>
