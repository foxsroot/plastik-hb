<template>
  <v-card variant="outlined" height="300" class="pa-4">
    <v-card-title class="text-center pa-0 mb-4">
      <v-icon class="mr-2">mdi-information</v-icon>
      Informasi Kontak
    </v-card-title>
    <v-list density="compact" class="pa-0">
      <v-list-item>
        <template #prepend>
          <v-icon color="green">mdi-whatsapp</v-icon>
        </template>
        <v-list-item-title>WhatsApp</v-list-item-title>
        <v-list-item-subtitle>{{ phoneNumber || "Belum diisi" }}</v-list-item-subtitle>
        <template #append>
          <v-btn
            v-if="phoneNumber"
            :href="`https://wa.me/${formattedPhone}`"
            target="_blank"
            icon="mdi-open-in-new"
            variant="text"
            size="small"
          />
        </template>
      </v-list-item>
      <v-divider class="my-2" />
      <v-list-item>
        <template #prepend>
          <v-icon color="red">mdi-map-marker</v-icon>
        </template>
        <v-list-item-title>Alamat</v-list-item-title>
        <v-list-item-subtitle>{{ address || "Belum diisi" }}</v-list-item-subtitle>
      </v-list-item>
      <v-divider class="my-2" />
      <v-list-item>
        <template #prepend>
          <v-icon color="blue">mdi-google-maps</v-icon>
        </template>
        <v-list-item-title>Google Maps</v-list-item-title>
        <v-list-item-subtitle class="text-truncate">
          {{ mapUrl || "Belum diisi" }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            v-if="mapUrl"
            :href="mapUrl"
            target="_blank"
            icon="mdi-open-in-new"
            variant="text"
            size="small"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  phoneNumber: String,
  address: String,
  mapUrl: String,
});
const formattedPhone = computed(() => {
  if (!props.phoneNumber) return "";
  let number = props.phoneNumber.replace(/\D/g, "");
  if (number.startsWith("0")) {
    number = "62" + number.substring(1);
  } else if (!number.startsWith("62")) {
    number = "62" + number;
  }
  return number;
});
</script>
