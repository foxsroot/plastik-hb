<template>
  <v-row class="mb-12">
    <v-col cols="12" md="6">
      <v-responsive class="rounded-lg elevation-1" style="height: 350px">
        <iframe
          :src="mapUrl"
          width="100%"
          height="100%"
          frameborder="0"
          style="border: 0"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </v-responsive>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
        <h3 class="text-h6 font-weight-bold mb-3">Contact Us</h3>
        <p class="text-body-1 mb-3">
          <strong>Address:</strong><br />
          {{ address }}
        </p>
        <p class="text-body-1">
          <strong>Customer Support:</strong><br />
          {{ phoneNumber }}
        </p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{
  mapUrl: string;
  address: string;
  phoneNumber: string;
}>();
</script>
