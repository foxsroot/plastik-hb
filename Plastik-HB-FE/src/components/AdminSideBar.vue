<template>
  <v-container class="d-flex flex-column pa-0 fill-height">
    <!-- Logo -->
    <div class="pa-4 d-flex justify-center">
      <img
        src="/logo.png"
        alt="Logo"
        class="logo"
        style="width: 100px; height: auto"
      />
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
        @click="handleLogout"
      >
        Logout
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"; // Import Vue Router
import { logout } from "@/api/authenticationApi"; // Import logout API function

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

const router = useRouter(); // Initialize Vue Router

async function handleLogout() {
  const token = localStorage.getItem("sessionToken");
  if (!token) {
    console.warn("No session token found. Redirecting to login...");
    router.push("/admin/login");
    return;
  }

  try {
    await logout(token); // Call backend API to invalidate session
    console.log("Logout successful.");
    localStorage.removeItem("sessionToken"); // Remove token from localStorage
    router.push("/admin/login"); // Redirect to login
  } catch (error: any) {
    console.error("Logout failed:", error);
    localStorage.removeItem("sessionToken"); // Remove token even if logout fails
    router.push("/admin/login"); // Redirect to login
  }
}
</script>
