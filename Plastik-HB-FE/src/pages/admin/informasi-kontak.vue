<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { fetchContactInfo, updateContactInfo } from "../../api/contactApi";

interface ContactInfo {
  mapUrl: string;
  address: string;
  phoneNumber: string;
}

// Alert state
const alertVisible = ref(false);
const alertType = ref<"success" | "error">("success");
const alertTitle = ref("");
const alertMessage = ref("");

// Form state
const loading = ref(false);
const saveLoading = ref(false);

// Contact information data
const contactInfo = ref<ContactInfo>({
  mapUrl: "",
  address: "",
  phoneNumber: "",
});

// Alert functions
const showAlert = (
  type: "success" | "error",
  title: string,
  message: string
) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;

  // Auto hide after 5 seconds
  setTimeout(() => {
    alertVisible.value = false;
  }, 5000);
};

// Watch for changes in Google Maps link
watch(
  () => contactInfo.value.mapUrl,
  () => {
    if (!contactInfo.value.mapUrl) {
      contactInfo.value.mapUrl = "";
    }
  },
  { immediate: true }
);

// Format WhatsApp number
const formatWhatsAppNumber = () => {
  let number = contactInfo.value.phoneNumber.replace(/\D/g, "");
  if (number.startsWith("0")) {
    number = "62" + number.substring(1);
  } else if (!number.startsWith("62")) {
    number = "62" + number;
  }
  return number;
};

const saveContactInfo = async () => {
  saveLoading.value = true;
  try {
    await nextTick();
    await updateContactInfo({
      phoneNumber: formatWhatsAppNumber(),
      address: contactInfo.value.address,
      mapUrl: contactInfo.value.mapUrl,
    });
    showAlert("success", "Berhasil", "Informasi kontak berhasil disimpan!");
  } catch (error) {
    console.log("Error saving contact info:", error);
    showAlert(
      "error",
      "Gagal",
      "Gagal menyimpan informasi kontak. Silakan coba lagi."
    );
  } finally {
    saveLoading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await fetchContactInfo();
    contactInfo.value = { ...data };
  } catch (error) {
    showAlert(
      "error",
      "Gagal",
      "Gagal memuat informasi kontak. Silakan coba lagi."
    );
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
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
        <h1 class="text-h4 font-weight-bold">Informasi Kontak</h1>
        <p class="text-body-2 text-grey-darken-1">
          Kelola informasi kontak dan lokasi toko
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat informasi kontak...</p>
    </div>

    <!-- Contact Form -->
    <v-card v-else variant="outlined" class="pa-6">
      <v-form @submit.prevent="saveContactInfo">
        <v-row>
          <!-- WhatsApp Number -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="contactInfo.phoneNumber"
              label="Nomor WhatsApp"
              variant="outlined"
              prepend-inner-icon="mdi-whatsapp"
              placeholder="0812312332"
              required
            />
          </v-col>

          <!-- Address -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="contactInfo.address"
              label="Alamat Toko"
              variant="outlined"
              prepend-inner-icon="mdi-map-marker"
              placeholder="Jl Dipatiukur No 11"
              required
            />
          </v-col>

          <!-- Link Google Maps -->
          <v-col cols="12" md="12">
            <v-text-field
              v-model="contactInfo.mapUrl"
              label="Link Google Maps"
              variant="outlined"
              prepend-inner-icon="mdi-google-maps"
              placeholder="https://maps.google.com/?q=-6.9175,107.6191"
              hint="Salin link dari Google Maps (format: https://maps.google.com/?q=lat,lng atau link tempat)"
              persistent-hint
              required
            />
          </v-col>

          <!-- Maps Preview Section -->
          <v-col cols="12">
            <v-row>
              <!-- Map Embed -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" height="300">
                  <v-card-title class="text-center">
                    <v-icon class="mr-2">mdi-map</v-icon>
                    Maps Preview
                  </v-card-title>
                  <v-card-text class="pa-0">
                    <div v-if="contactInfo.mapUrl" class="map-container">
                      <iframe
                        :src="contactInfo.mapUrl"
                        width="100%"
                        height="240"
                        style="border: 0"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div
                      v-else
                      class="d-flex align-center justify-center"
                      style="height: 240px"
                    >
                      <div class="text-center text-grey-darken-1">
                        <v-icon size="48" class="mb-2">mdi-map-outline</v-icon>
                        <p>Masukkan link Google Maps untuk preview</p>
                        <small class="text-caption">
                          Contoh: https://maps.google.com/?q=-6.9175,107.6191
                        </small>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Contact Info Preview -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" height="300" class="pa-4">
                  <v-card-title class="text-center pa-0 mb-4">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    Informasi Kontak
                  </v-card-title>

                  <v-list density="compact" class="pa-0">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="green">mdi-whatsapp</v-icon>
                      </template>
                      <v-list-item-title>WhatsApp</v-list-item-title>
                      <v-list-item-subtitle>{{
                        contactInfo.phoneNumber || "Belum diisi"
                      }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn
                          v-if="contactInfo.phoneNumber"
                          :href="`https://wa.me/${formatWhatsAppNumber()}`"
                          target="_blank"
                          icon="mdi-open-in-new"
                          variant="text"
                          size="small"
                        />
                      </template>
                    </v-list-item>

                    <v-divider class="my-2" />

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="red">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Alamat</v-list-item-title>
                      <v-list-item-subtitle>{{
                        contactInfo.address || "Belum diisi"
                      }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-2" />

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="blue">mdi-google-maps</v-icon>
                      </template>
                      <v-list-item-title>Google Maps</v-list-item-title>
                      <v-list-item-subtitle class="text-truncate">
                        {{ contactInfo.mapUrl || "Belum diisi" }}
                      </v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn
                          v-if="contactInfo.mapUrl"
                          :href="contactInfo.mapUrl"
                          target="_blank"
                          icon="mdi-open-in-new"
                          variant="text"
                          size="small"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <v-row>
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="saveLoading"
                    :disabled="
                      !contactInfo.phoneNumber ||
                      !contactInfo.address ||
                      !contactInfo.mapUrl
                    "
                    block
                    class="text-uppercase mt-4"
                    md="12"
                  >
                    Simpan
                  </v-btn>
                </v-col>
              </v-row>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<style scoped>
.map-container iframe {
  border-radius: 8px;
}

.v-list-item-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
