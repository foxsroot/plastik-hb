<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app permanent>
      <AdminSidebar />
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AdminSidebar from "@/components/AdminSidebar.vue";

const drawer = ref(true);
</script>
