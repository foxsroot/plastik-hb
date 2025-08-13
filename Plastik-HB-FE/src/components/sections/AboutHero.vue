<template>
  <v-row align="center" class="mb-10">
    <v-col cols="12" md="6">
      <h1 class="text-h4 font-weight-bold mb-4">{{ title }}</h1>
      <p class="text-body-1">{{ description }}</p>
    </v-col>
    <v-col cols="12" md="6">
      <v-img :src="imageUrl" height="320" cover class="rounded-lg elevation-1">
        <template v-slot:error>
          <v-icon size="60" color="primary">mdi-package-variant</v-icon>
        </template>
      </v-img>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{
  title: string;
  description: string;
  imageUrl: string;
}>();
</script>
