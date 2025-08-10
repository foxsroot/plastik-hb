<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getPage, updateAboutPage } from "../../api/pageApi";
import { uploadImage } from "../../api/uploadApi";
import AboutPage from "../tentang-kami.vue";

// --- Types ---
interface Section {
  id: string;
  type: string;
  order: number;
  data: any;
  visible: boolean;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: Section[];
}

// --- State ---
const loading = ref(false);
const saveLoading = ref(false);
const alertVisible = ref(false);
const alertType = ref<"success" | "error">("success");
const alertTitle = ref("");
const alertMessage = ref("");
const previewKey = ref(0);
const previewTimestamp = ref(Date.now());
const fileInputRef = ref<HTMLInputElement | null>(null);

const pageId = ref<string>("");
const pageTitle = ref<string>("");
const pageDescription = ref<string>("");
const pagePublished = ref<boolean>(true);
const sections = ref<Section[]>([]);

// --- Section Helpers ---
function getSection(type: string): Section | undefined {
  return sections.value.find((s) => s.type === type);
}

// --- Computed for Editor Fields ---
const infoSection = computed(() => getSection("INFO"));
const valuesSection = computed(() => getSection("VALUES"));
const goalsSection = computed(() => getSection("GOALS"));
const historySection = computed(() => getSection("HISTORY"));
const addressSection = computed(() => getSection("ADDRESS"));

// --- INFO Section ---
const infoImageUrl = computed({
  get: () => infoSection.value?.data.imageUrl ?? "",
  set: (val: string) => {
    if (infoSection.value) infoSection.value.data.imageUrl = val;
  },
});
const infoTitle = computed({
  get: () => infoSection.value?.data.title ?? "",
  set: (val: string) => {
    if (infoSection.value) infoSection.value.data.title = val;
  },
});
const infoDescription = computed({
  get: () => infoSection.value?.data.description ?? "",
  set: (val: string) => {
    if (infoSection.value) infoSection.value.data.description = val;
  },
});

// --- VALUES Section ---
const valueItems = computed(() => {
  const arr = valuesSection.value?.data.values ?? [];
  // Always 4 items
  if (arr.length < 4) {
    for (let i = arr.length; i < 4; i++) arr.push("");
  }
  return arr.map((_, idx) =>
    computed({
      get: () => arr[idx] ?? "",
      set: (val: string) => {
        arr[idx] = val;
      },
    })
  );
});

// --- GOALS Section ---
const mission = computed({
  get: () => goalsSection.value?.data.mission ?? "",
  set: (val: string) => {
    if (goalsSection.value) goalsSection.value.data.mission = val;
  },
});
const vision = computed({
  get: () => goalsSection.value?.data.vision ?? "",
  set: (val: string) => {
    if (goalsSection.value) goalsSection.value.data.vision = val;
  },
});

// --- HISTORY Section ---
const historyItems = computed(() => {
  const arr = historySection.value?.data.history ?? [];
  return arr.map((_, idx) =>
    computed({
      get: () => arr[idx] ?? "",
      set: (val: string) => {
        arr[idx] = val;
      },
    })
  );
});
function addHistory() {
  if (historySection.value) historySection.value.data.history.push("");
}
function removeHistory(idx: number) {
  if (historySection.value && historySection.value.data.history.length > 1) {
    historySection.value.data.history.splice(idx, 1);
  }
}

// --- Alert ---
function showAlert(type: "success" | "error", title: string, message: string) {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;
  setTimeout(() => (alertVisible.value = false), 5000);
}

// --- Preview ---
const refreshPreview = () => {
  previewKey.value += 1;
  previewTimestamp.value = Date.now();
};
const openAboutPage = () => {
  window.open("/tentang-kami", "_blank");
};

// --- Image Upload ---
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      const imageUrl = await uploadImage(file);
      infoImageUrl.value = getImageUrl(imageUrl);
    } catch (error) {
      showAlert("error", "Upload Gagal", "Gagal upload gambar");
    }
  }
};
const openFileInput = () => {
  fileInputRef.value?.click();
};

// --- Fetch Data ---
const fetchAboutData = async () => {
  loading.value = true;
  try {
    const page = await getPage("tentang-kami");
    pageId.value = page.id;
    pageTitle.value = page.title;
    pageDescription.value = page.description;
    pagePublished.value = page.published;
    sections.value = page.sections;
    // Ensure values section always has 4 items
    const valuesSec = getSection("VALUES");
    if (valuesSec && Array.isArray(valuesSec.data.values)) {
      while (valuesSec.data.values.length < 4) valuesSec.data.values.push("");
      if (valuesSec.data.values.length > 4)
        valuesSec.data.values = valuesSec.data.values.slice(0, 4);
    }
    // Ensure image path is always a valid URL
    const infoSec = getSection("INFO");
    if (infoSec && infoSec.data.imageUrl) {
      infoSec.data.imageUrl = getImageUrl(infoSec.data.imageUrl);
    }
  } catch (error) {
    showAlert("error", "Gagal Memuat", "Gagal memuat data tentang kami");
  } finally {
    loading.value = false;
  }
};

// --- Save Data ---
const saveAboutData = async () => {
  saveLoading.value = true;
  try {
    // Ensure values section always has 4 items before saving
    const valuesSec = getSection("VALUES");
    if (valuesSec && Array.isArray(valuesSec.data.values)) {
      while (valuesSec.data.values.length < 4) valuesSec.data.values.push("");
      if (valuesSec.data.values.length > 4)
        valuesSec.data.values = valuesSec.data.values.slice(0, 4);
    }
    await updateAboutPage(pageId.value, {
      id: pageId.value,
      title: pageTitle.value,
      description: pageDescription.value,
      published: pagePublished.value,
      sections: sections.value,
    });
    showAlert("success", "Berhasil", "Data tentang kami berhasil disimpan!");
    setTimeout(() => {
      refreshPreview();
    }, 1000);
  } catch (error) {
    showAlert("error", "Gagal Simpan", "Gagal menyimpan data tentang kami");
  } finally {
    saveLoading.value = false;
  }
};

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "";
  // If already absolute (starts with http), use as is
  if (imagePath.startsWith("http")) return imagePath;
  // If starts with /uploads, prepend backend host
  if (imagePath.startsWith("/uploads"))
    return `http://localhost:5000${imagePath}`;
  // If only filename, prepend /uploads and backend host
  return `http://localhost:5000/uploads/${imagePath}`;
}

onMounted(fetchAboutData);
</script>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'admin'
  }
}
</route>

<template>
  <v-container class="pa-6">
    <!-- Alert -->
    <v-alert
      v-model="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :text="alertMessage"
      closable
      class="mb-4"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      "
    />

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Tentang Kami</h1>
        <p class="text-body-2 text-grey-darken-1">
          Kelola informasi tentang perusahaan dan lihat preview halaman publik
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat data tentang kami...</p>
    </div>

    <!-- Main Content -->
    <v-row v-else>
      <!-- Left Side - Form -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Editor Konten
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveAboutData">
              <!-- Hero Section -->
              <div class="mb-6">
                <h3 class="text-h6 mb-4">Hero Section</h3>
                <!-- Image Upload -->
                <div class="mb-4">
                  <v-card
                    height="200"
                    variant="outlined"
                    class="d-flex align-center justify-center mb-2 image-upload-card"
                    @click="openFileInput"
                  >
                    <div v-if="!infoImageUrl" class="text-center">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2"
                        >mdi-camera</v-icon
                      >
                      <p class="text-grey-darken-1">Gambar Hero</p>
                    </div>
                    <v-img
                      v-else
                      :src="infoImageUrl"
                      cover
                      height="100%"
                      class="rounded"
                    />
                  </v-card>
                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-pencil"
                    @click="openFileInput"
                    size="small"
                  >
                    Edit Gambar
                  </v-btn>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageUpload"
                  />
                </div>
                <v-text-field
                  v-model="infoTitle"
                  label="Title"
                  variant="outlined"
                  class="mb-3"
                />
                <v-textarea
                  v-model="infoDescription"
                  label="Description"
                  variant="outlined"
                  rows="4"
                  class="mb-3"
                />
              </div>

              <!-- Values Section -->
              <div class="mb-6">
                <h3 class="text-h6 mb-4">Our Values</h3>
                <div
                  v-for="(item, index) in valueItems"
                  :key="index"
                  class="mb-2"
                >
                  <v-text-field
                    v-model="valueItems[index].value"
                    :label="`Value ${index + 1}`"
                    variant="outlined"
                    density="compact"
                    :maxlength="100"
                    :counter="100"
                    required
                  />
                </div>
              </div>

              <!-- Mission & Vision -->
              <div class="mb-6">
                <h3 class="text-h6 mb-4">Mission & Vision</h3>
                <v-textarea
                  v-model="mission"
                  label="Mission"
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                />
                <v-textarea
                  v-model="vision"
                  label="Vision"
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                />
              </div>

              <!-- History Section -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">History</h3>
                  <v-btn
                    @click="addHistory"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                <div
                  v-for="(item, index) in historyItems"
                  :key="index"
                  class="mb-2"
                >
                  <v-text-field
                    v-model="historyItems[index].value"
                    :label="`History ${index + 1}`"
                    variant="outlined"
                    density="compact"
                  >
                    <template #append-inner>
                      <v-btn
                        @click="removeHistory(index)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :disabled="historyItems.length <= 1"
                        class="delete-btn-inside"
                      />
                    </template>
                  </v-text-field>
                </div>
              </div>

              <!-- Save Button -->
              <v-row align="center" class="mb-4">
                <v-col cols="12" md="12" class="d-flex align-center">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="saveLoading"
                    block
                    size="large"
                    class="mt-0"
                  >
                    Simpan
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Side - Preview -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined">
          <v-card-title
            class="bg-grey text-white d-flex justify-space-between align-center"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-eye</v-icon>
              Live Preview
            </div>
            <div class="d-flex gap-2">
              <v-btn
                @click="refreshPreview"
                icon="mdi-refresh"
                variant="text"
                size="small"
                color="white"
                title="Refresh preview"
              />
              <v-btn
                @click="openAboutPage"
                icon="mdi-open-in-new"
                variant="text"
                size="small"
                color="white"
                title="Open about page in new tab"
              />
            </div>
          </v-card-title>
          <v-card-text class="pa-0">
            <div class="preview-container">
              <div :key="previewKey" class="preview-wrapper">
                <AboutPage />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.image-upload-card {
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.image-upload-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.preview-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.preview-wrapper {
  transform: scale(0.75);
  transform-origin: top left;
  width: 133.33%;
  min-height: 600px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Square border for icon buttons */
.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}

/* Scrollbar styling for preview */
.preview-container::-webkit-scrollbar {
  width: 6px;
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Hide any navbar/footer that might be in the about page component */
.preview-wrapper :deep(.navbar),
.preview-wrapper :deep(.footer),
.preview-wrapper :deep(nav),
.preview-wrapper :deep(footer) {
  display: none !important;
}

/* Ensure full width for preview content */
.preview-wrapper :deep(.container),
.preview-wrapper :deep(.v-container) {
  max-width: 100% !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

/* Responsive scaling */
@media (max-width: 1400px) {
  .preview-wrapper {
    transform: scale(0.65);
    width: 153.85%;
  }
}

@media (max-width: 1200px) {
  .preview-wrapper {
    transform: scale(0.55);
    width: 181.82%;
  }
}

@media (max-width: 992px) {
  .preview-wrapper {
    transform: scale(0.8);
    width: 125%;
  }
}

@media (max-width: 768px) {
  .preview-wrapper {
    transform: scale(1);
    width: 100%;
  }
}
</style>
