<template>
  <v-container class="d-flex flex-column pa-0 fill-height">
    <!-- Logo -->
    <div class="pa-4 d-flex justify-center">
      <h1 class="text-h4 mb-4">Plastik HB</h1>
      <!-- <v-avatar size="48">
        <v-img src="/" alt="Logo" />
      </v-avatar> -->
    </div>

    <!-- Navigation Items -->
    <v-list dense nav class="flex-grow-1">
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        link
        exact
        class="w-100"
        active-class="bg-orange-lighten-2 text-white"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>

        <v-list-item-title class="text-body-2 font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <div class="pa-4">
      <v-btn
        block
        color="error"
        variant="flat"
        class="text-subtitle-2 py-1"
        prepend-icon="mdi-logout"
        @click="logout"
      >
        Logout
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const navItems = [
  { title: "Dashboard", to: "/admin", icon: "mdi-view-dashboard" },
  {
    title: "Halaman Utama",
    to: "/admin/halaman-utama",
    icon: "mdi-home-outline",
  },
  {
    title: "Tentang Kami",
    to: "/admin/tentang-kami",
    icon: "mdi-information-outline",
  },
  {
    title: "Katalog Produk",
    to: "/admin/katalog-produk",
    icon: "mdi-package-variant",
  },
  { title: "Kategori", to: "/admin/kategori", icon: "mdi-shape-outline" },
  {
    title: "Informasi Kontak",
    to: "/admin/informasi-kontak",
    icon: "mdi-phone-outline",
  },
];

function logout() {
  console.log("Logging out...");
  // Replace with your actual logout logic
}
</script>
