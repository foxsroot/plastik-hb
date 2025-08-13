<template>
  <v-row class="mb-12">
    <v-col cols="12">
      <h2 class="text-h5 font-weight-bold mb-6 text-center">Our Values</h2>
    </v-col>
    <v-col
      v-for="(value, index) in values"
      :key="index"
      cols="12"
      sm="6"
      md="3"
      class="d-flex"
    >
      <v-card
        class="pa-6 text-center bg-grey-darken-3 rounded-lg elevation-1 flex-grow-1"
        style="height: 100%"
      >
        <v-icon color="primary" size="36" class="mb-2">mdi-star-circle</v-icon>
        <p class="text-subtitle-1 font-weight-medium">{{ value }}</p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{ values: string[] }>();
</script>
