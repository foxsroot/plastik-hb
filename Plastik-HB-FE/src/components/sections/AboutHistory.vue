<template>
  <v-row class="mb-12">
    <v-col cols="12">
      <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
        <h3 class="text-h6 font-weight-bold mb-4">Our History</h3>
        <ul class="pl-4">
          <li v-for="item in history" :key="item" class="mb-2">
            <v-icon start color="primary">mdi-circle-small</v-icon> {{ item }}
          </li>
        </ul>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{ history: string[] }>();
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
