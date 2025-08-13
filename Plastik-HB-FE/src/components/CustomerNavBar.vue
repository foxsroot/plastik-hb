<template>
  <v-app-bar elevation="1" color="#333333" height="80" border="b1">
    <v-container fluid class="d-flex align-center pl-0 pr-6">
      <!-- Logo -->
      <RouterLink to="/" class="logo-link">
        <v-img
          src="/logo.png"
          alt="Plastik HB Company Logo"
          width="100"
          cover
          class="logo-img"
          ml-5
        />
      </RouterLink>

      <v-spacer />

      <!-- Desktop Navigation -->
      <v-btn-group variant="text" class="d-none d-md-flex">
        <NavButton to="/" label="Home" />
        <NavButton to="/katalog" label="Katalog Produk" />
        <NavButton to="/tentang-kami" label="Tentang Kami" />
      </v-btn-group>

      <v-spacer />

      <!-- Mobile Menu -->
      <v-menu
        v-model="mobileMenu"
        :close-on-content-click="true"
        location="bottom end"
        class="d-md-none"
      >
        <template #activator="{ props }">
          <v-btn
            icon="mdi-menu"
            variant="text"
            v-bind="props"
            class="d-md-none"
          />
        </template>

        <v-list>
          <v-list-item
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            @click="mobileMenu = false"
            link
          >
            <v-list-item-title>{{ link.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// State
const mobileMenu = ref(false);

// Navigation links (single source of truth)
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/katalog", label: "Katalog Produk" },
  { to: "/tentang-kami", label: "Tentang Kami" },
];
</script>

<style scoped>
/* Logo styles */
.logo-link {
  display: inline-flex;
  align-items: center;
  padding: 0;
  text-decoration: none;
}

.app-logo {
  display: block;
}

@media (max-width: 600px) {
  .app-logo {
    height: 45px !important;
  }
}

/* Nav button styles */
.nav-link {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #1976d2;
}

.nav-link.active {
  color: #1976d2;
  font-weight: 600;
}
</style>
