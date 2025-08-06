<script setup lang="ts"></script>

<route>
{
    meta: {
      requiresAuth: true,
        layout: 'admin'
    }
}
</route>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Selamat Datang di Plastik HB</h1>
        <p class="text-body-1">Halaman beranda website Plastik HB.</p>
      </v-col>
    </v-row>
  </v-container>
</template>
