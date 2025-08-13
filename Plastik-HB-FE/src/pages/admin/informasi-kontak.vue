<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { fetchContactInfo, updateContactInfo } from "../../api/contactApi";
import AppAlert from '../../components/AppAlert.vue';
import ContactInfoPreview from '../../components/ContactInfoPreview.vue';
import GoogleMapsEmbed from '../../components/GoogleMapsEmbed.vue';

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
    <AppAlert
      v-model="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :text="alertMessage"
      class="mb-4"
      style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"
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
                <GoogleMapsEmbed :mapUrl="contactInfo.mapUrl" />
              </v-col>
              <!-- Contact Info Preview -->
              <v-col cols="12" md="6">
                <ContactInfoPreview
                  :phoneNumber="contactInfo.phoneNumber"
                  :address="contactInfo.address"
                  :mapUrl="contactInfo.mapUrl"
                />
              </v-col>
              <v-row>
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="saveLoading"
                    :disabled="!contactInfo.phoneNumber || !contactInfo.address || !contactInfo.mapUrl"
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
