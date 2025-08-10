<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPage } from "../api/pageApi";
import { useAnalytics } from "../composables/useAnalytics";

interface PageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: Array<{
    type: string;
    order: number;
    visible: boolean;
    data: {
      imageUrl?: string;
      title?: string;
      description?: string;
      values?: string[];
      vision?: string;
      mission?: string;
      history?: string[];
      mapUrl?: string;
      address?: string;
      phoneNumber?: string;
    };
  }>;
}

const { trackPageView } = useAnalytics();

const pageData = ref<PageData | null>(null);
const errorMessage = ref("");

async function fetchPageData() {
  try {
    pageData.value = (await getPage("tentang-kami")) as PageData; // Fetch data by slug
  } catch (error: any) {
    console.error("Failed to fetch page data:", error);
    errorMessage.value =
      error.response?.data?.message || "Failed to load page data.";
  }
}

onMounted(async () => {
  await fetchPageData();
  trackPageView(
    pageData.value?.id || "unknown",
    pageData.value?.slug || "unknown"
  );
});
</script>

<template>
  <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
    <!-- Hero Section -->
    <v-row align="center" class="mb-10">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold mb-4">
          {{ pageData?.sections[0].data.title }}
        </h1>
        <p class="text-subtitle-1 mb-3">
          {{ pageData?.sections[0].data.description }}
        </p>
        <p class="text-body-1">{{ pageData?.sections[0].data.description }}</p>
      </v-col>
      <v-col cols="12" md="6">
        <v-img
          :src="pageData?.sections[0].data.imageUrl"
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
        v-for="(value, index) in pageData?.sections[1].data.values"
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
          <p class="text-body-1">{{ pageData?.sections[2].data.mission }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
          <h3 class="text-h6 font-weight-bold mb-3">Our Vision</h3>
          <p class="text-body-1">{{ pageData?.sections[2].data.vision }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- History -->
    <v-row class="mb-12">
      <v-col cols="12">
        <v-card class="pa-6 bg-grey-darken-3 rounded-lg elevation-1">
          <h3 class="text-h6 font-weight-bold mb-4">Our History</h3>
          <ul class="pl-4">
            <li
              v-for="item in pageData?.sections[3].data.history"
              :key="item"
              class="mb-2"
            >
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
            :src="pageData?.sections[4].data.mapUrl"
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
            {{ pageData?.sections[4].data.address }}
          </p>
          <p class="text-body-1">
            <strong>Customer Support:</strong><br />
            {{ pageData?.sections[4].data.phoneNumber }}
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
