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

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_API_URL}${imagePath}`;
}

onMounted(async () => {
  await fetchPageData();
  trackPageView(
    pageData.value?.id || "unknown",
    pageData.value?.slug || "unknown",
  );
});
</script>

<template>
  <v-container fluid class="pa-6 bg-grey-darken-4 text-white">
    <AboutHero
      :title="pageData?.sections[0].data.title || ''"
      :description="pageData?.sections[0].data.description || ''"
      :imageUrl="getImageUrl(pageData?.sections[0].data.imageUrl)"
    />
    <AboutValues :values="pageData?.sections[1].data.values || []" />
    <AboutMissionVision
      :mission="pageData?.sections[2].data.mission || ''"
      :vision="pageData?.sections[2].data.vision || ''"
    />
    <AboutHistory :history="pageData?.sections[3].data.history || []" />
    <AboutContactMap
      :mapUrl="pageData?.sections[4].data.mapUrl || ''"
      :address="pageData?.sections[4].data.address || ''"
      :phoneNumber="pageData?.sections[4].data.phoneNumber || ''"
    />
  </v-container>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
