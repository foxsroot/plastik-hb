<template>
  <v-app>
    <NavigationBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import NavigationBar from './components/NavigationBar.vue'
</script>
