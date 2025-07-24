<template>
  <v-app-bar elevation="1" color="white" height="80">
    <v-container fluid class="d-flex align-center px-6">
      <v-btn variant="text" to="/" class="logo-btn pa-2" size="large">
        <v-img
          src="/src/assets/logo.png"
          alt="Logo"
          max-height="40"
          max-width="80"
          contain
        />
      </v-btn>

      <v-spacer />

      <v-btn-group variant="text" class="d-none d-md-flex">
        <v-btn
          to="/"
          variant="text"
          size="large"
          class="nav-link px-6"
          :class="{ active: $route.path === '/' }"
        >
          Home
        </v-btn>

        <v-btn
          to="/katalog"
          variant="text"
          size="large"
          class="nav-link px-6"
          :class="{ active: $route.path === '/katalog' }"
        >
          Katalog Produk
        </v-btn>

        <v-btn
          to="/tentang-kami"
          variant="text"
          size="large"
          class="nav-link px-6"
          :class="{ active: $route.path === '/tentang-kami' }"
        >
          Tentang Kami
        </v-btn>
      </v-btn-group>

      <v-spacer />

      <v-menu
        v-model="mobileMenu"
        :close-on-content-click="true"
        location="bottom end"
        class="d-md-none"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-menu"
            variant="text"
            v-bind="props"
            class="d-md-none"
          />
        </template>

        <v-list>
          <v-list-item to="/" @click="mobileMenu = false">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item to="/katalog" @click="mobileMenu = false">
            <v-list-item-title>Katalog Produk</v-list-item-title>
          </v-list-item>

          <v-list-item to="/tentang-kami" @click="mobileMenu = false">
            <v-list-item-title>Tentang Kami</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const mobileMenu = ref(false);
</script>

<style scoped>
.logo-btn {
  min-width: auto !important;
}

.nav-link {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  color: rgba(0, 0, 0, 0.87);
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #1976d2;
}

.nav-link.active {
  color: #1976d2;
  font-weight: 600;
}

.v-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
