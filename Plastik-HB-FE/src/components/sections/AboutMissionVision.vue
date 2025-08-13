<template>
  <v-row class="mb-12">
    <v-col cols="12" md="6" class="d-flex">
      <v-card
        class="pa-6 bg-grey-darken-3 rounded-lg elevation-1 flex-grow-1"
        style="height: 100%"
      >
        <h3 class="text-h6 font-weight-bold mb-3">Our Mission</h3>
        <p class="text-body-1">{{ mission }}</p>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" class="d-flex">
      <v-card
        class="pa-6 bg-grey-darken-3 rounded-lg elevation-1 flex-grow-1"
        style="height: 100%"
      >
        <h3 class="text-h6 font-weight-bold mb-3">Our Vision</h3>
        <p class="text-body-1">{{ vision }}</p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{ mission: string; vision: string }>();
</script>
