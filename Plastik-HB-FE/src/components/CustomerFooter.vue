<template>
  <v-footer color="#333333" class="text-white pa-8">
    <v-container>
      <v-row>
        <!-- Company Info Section -->
        <v-col cols="12" md="3" class="mb-6">
          <div class="mb-4">
            <h3 class="text-h5 mb-2 font-weight-bold">PLASTIK HB</h3>
            <p class="text-caption text-grey-lighten-2">
              SOLUSI PLASTIK TERBAIK
            </p>
          </div>

          <!-- Address (from backend) -->
          <div class="mb-4">
            <p class="text-body-2 mb-1">
              {{ contactInfo?.address || "Alamat tidak tersedia" }}
            </p>
          </div>

          <!-- Contact Info (from backend) -->
          <div class="contact-info">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-phone" size="16" class="me-2" />
              <span class="text-body-2">{{
                contactInfo?.phoneNumber || "N/A"
              }}</span>
            </div>
          </div>
        </v-col>

        <!-- Services Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold text-uppercase">
            LAYANAN
          </h4>
          <div class="footer-links">
            <div class="mb-2">
              <router-link to="/katalog" class="footer-link"
                >KATALOG PRODUK</router-link
              >
            </div>
            <div class="mb-2">
              <a
                :href="
                  contactInfo?.phoneNumber
                    ? `https://wa.me/${contactInfo.phoneNumber}`
                    : '#'
                "
                class="footer-link"
                target="_blank"
                rel="noopener"
              >
                PESANAN CUSTOM
              </a>
            </div>
            <div class="mb-2">
              <a
                :href="
                  contactInfo?.phoneNumber
                    ? `https://wa.me/${contactInfo.phoneNumber}`
                    : '#'
                "
                class="footer-link"
                target="_blank"
                rel="noopener"
              >
                PEMBELIAN GROSIR
              </a>
            </div>
          </div>
        </v-col>

        <!-- Information Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold text-uppercase">
            INFORMASI
          </h4>
          <div class="footer-links">
            <div class="mb-2">
              <router-link to="/tentang-kami" class="footer-link"
                >TENTANG KAMI</router-link
              >
            </div>
            <div class="mb-2">
              <a
                :href="
                  contactInfo?.phoneNumber
                    ? `https://wa.me/${contactInfo.phoneNumber}`
                    : '#'
                "
                class="footer-link"
                target="_blank"
                rel="noopener"
              >
                HUBUNGI KAMI
              </a>
            </div>
            <div class="mb-2">
              <router-link to="#" class="footer-link"
                >KEBIJAKAN PRIVASI</router-link
              >
            </div>
            <div class="mb-2">
              <router-link to="#" class="footer-link"
                >SYARAT & KETENTUAN</router-link
              >
            </div>
          </div>
        </v-col>

        <!-- Support Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold text-uppercase">
            DUKUNGAN
          </h4>
          <div class="footer-links">
            <div class="mb-2">
              <router-link to="#" class="footer-link"
                >PUSAT BANTUAN</router-link
              >
            </div>
            <div class="mb-2">
              <router-link to="#" class="footer-link">FAQ</router-link>
            </div>
            <div class="mb-2">
              <router-link to="#" class="footer-link"
                >PANDUAN PEMBELIAN</router-link
              >
            </div>
          </div>
        </v-col>

        <!-- About Section -->
        <v-col cols="12" md="3" class="mb-6">
          <h4 class="text-subtitle-1 mb-4 font-weight-bold text-uppercase">
            TENTANG KAMI
          </h4>
          <div class="footer-links">
            <div class="mb-2">
              <router-link to="/tentang-kami" class="footer-link"
                >PROFIL PERUSAHAAN</router-link
              >
            </div>
            <div class="mb-2">
              <router-link to="#" class="footer-link">KARIR</router-link>
            </div>
            <div class="mb-2">
              <router-link to="/#trustedby" class="footer-link"
                >MITRA KAMI</router-link
              >
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Divider -->
      <v-divider class="my-6 border-opacity-25" />

      <!-- Social Media and Copyright Section -->
      <v-row align="center">
        <v-col cols="12" md="6"> </v-col>

        <v-col cols="12" md="6">
          <div class="text-center text-md-end">
            <p class="text-body-2 text-grey-lighten-1 mb-0">
              ©Copyright. All rights reserved.
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axiosInstance from "../utils/axiosInstance";

const contactInfo = ref<{
  phoneNumber: string;
  address: string;
  mapUrl: string;
} | null>(null);

onMounted(async () => {
  try {
    const res = await axiosInstance.get("/contact");
    contactInfo.value = res.data.data;
  } catch (err) {
    contactInfo.value = {
      phoneNumber: "N/A",
      address: "Alamat tidak tersedia",
      mapUrl: "",
    };
  }
});
</script>

<style scoped>
.contact-info .v-icon {
  color: rgba(255, 255, 255, 0.7);
}

.contact-info span {
  color: rgba(255, 255, 255, 0.9);
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
}

.social-btn {
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.social-btn:hover {
  border-color: rgba(255, 255, 255, 0.6) !important;
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-footer {
  margin-top: auto;
}
</style>
