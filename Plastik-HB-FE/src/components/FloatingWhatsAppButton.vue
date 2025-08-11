<template>
  <a
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="floating-whatsapp"
    aria-label="Chat WhatsApp"
  >
    <v-btn icon color="success" size="large" elevation="8" class="whatsapp-btn">
      <v-icon size="32">mdi-whatsapp</v-icon>
    </v-btn>
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchContactInfo } from "../api/contactApi";

// --- State ---
const phoneNumber = ref<string>(""); // fallback default
const whatsappUrl = ref<string>(`https://wa.me/${phoneNumber.value}`);

// --- Logic ---
const setWhatsappUrl = (phone: string) => {
  // Remove non-digit characters, ensure starts with country code
  const cleanPhone = phone.replace(/\D/g, "");
  whatsappUrl.value = `https://wa.me/${cleanPhone}`;
};

// --- Fetch Contact Info ---
onMounted(async () => {
  try {
    const contact = await fetchContactInfo();
    if (contact?.phoneNumber) {
      phoneNumber.value = contact.phoneNumber;
      setWhatsappUrl(contact.phoneNumber.value);
    }
  } catch (err) {
    // Error handling: fallback to default number
    setWhatsappUrl(phoneNumber.value);
  }
});
</script>

<style scoped>
.floating-whatsapp {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
  text-decoration: none;
}
.whatsapp-btn {
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
