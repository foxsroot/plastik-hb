<template>
  <v-app>
    <v-app-bar v-if="$vuetify.display.smAndDown" app color="bg-gray-4" dark>
      <!-- Burger menu for mobile -->
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Admin Panel</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :temporary="$vuetify.display.smAndDown"
      :permanent="$vuetify.display.mdAndUp"
      width="260"
    >
      <AdminSideBar @close="drawer = false" />
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AdminSideBar from "@/components/AdminSideBar.vue";
import { useDisplay } from "vuetify";

const display = useDisplay();
const drawer = ref(!display.smAndDown.value);
</script>
