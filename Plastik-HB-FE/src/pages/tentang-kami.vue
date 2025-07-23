<script setup lang="ts">
import { ref } from "vue";

const data = ref({
  aboutImage:
    "https://media.istockphoto.com/id/1958541858/photo/office-building-dusk.jpg?s=612x612&w=0&k=20&c=foJIkTuT63ak-Fg76ts-gc3gyz_3PwqrIZf_T2GHiTE=",
  headline: "Crafting Excellence Together",
  subheadline: "We believe in collaboration to achieve outstanding results.",
  description:
    "At Plastik HB, we are committed to delivering exceptional service with innovative and sustainable solutions. Our skilled professionals work closely with our clients to transform ideas into lasting results.",
  values: [
    "Innovation & Excellence",
    "Sustainable Growth",
    "Customer-Centric Service",
    "Building Stronger Communities",
  ],
  mission:
    "To deliver high-quality solutions that exceed client expectations by combining innovation, technical skill, and transparency. We are dedicated to sustainability, trust, and building stronger communities.",
  vision:
    "To become a leading force in the industry by continuously evolving and embracing modern challenges, while staying rooted in the principles that built our foundation.",
  history: [
    "Started from humble beginnings in Bandung.",
    "Expanded across Java with strategic milestones.",
    "Built a legacy of trust in quality materials and service.",
    "Shaping the future while rooted in the past.",
  ],
  mapUrl:
    "https://www.google.com/maps?q=-6.914744,107.609810&z=15&output=embed",
  contact: {
    address: "Jl. Plastik HB No. 123, Bandung",
    support: "0812-3456-7890 (Senin - Jumat, 08.00 - 17.00)",
  },
});
</script>

<template>
  <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
    <!-- Hero Section -->
    <v-row align="center" class="mb-10">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold mb-4">{{ data.headline }}</h1>
        <p class="text-subtitle-1 mb-3">{{ data.subheadline }}</p>
        <p class="text-body-1">{{ data.description }}</p>
      </v-col>
      <v-col cols="12" md="6">
        <v-img
          :src="data.aboutImage"
          height="320"
          cover
          class="rounded-lg elevation-1"
        />
      </v-col>
    </v-row>

    <!-- Our Values Section -->
    <v-row class="mb-12">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-6 text-center">Our Values</h2>
      </v-col>
      <v-col
        v-for="(value, index) in data.values"
        :key="index"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          class="pa-6 text-center bg-grey-darken-3 rounded-lg elevation-1"
        >
          <v-icon color="amber" size="36" class="mb-2">mdi-star-circle</v-icon>
          <p class="text-subtitle-1 font-weight-medium">{{ value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mission / Vision -->
    <v-row class="mb-12">
      <v-col cols="12" md="6">
        <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
          <h3 class="text-h6 font-weight-bold mb-3">Our Mission</h3>
          <p class="text-body-1">{{ data.mission }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
          <h3 class="text-h6 font-weight-bold mb-3">Our Vision</h3>
          <p class="text-body-1">{{ data.vision }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- History -->
    <v-row class="mb-12">
      <v-col cols="12">
        <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
          <h3 class="text-h6 font-weight-bold mb-4">Our History</h3>
          <ul class="pl-4">
            <li v-for="item in data.history" :key="item" class="mb-2">
              <v-icon start color="amber">mdi-circle-small</v-icon> {{ item }}
            </li>
          </ul>
        </v-card>
      </v-col>
    </v-row>

    <!-- Map + Contact -->
    <v-row class="mb-12">
      <v-col cols="12" md="6">
        <v-responsive class="rounded-lg elevation-1" style="height: 350px">
          <iframe
            :src="data.mapUrl"
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
            {{ data.contact.address }}
          </p>
          <p class="text-body-1">
            <strong>Customer Support:</strong><br />
            {{ data.contact.support }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
