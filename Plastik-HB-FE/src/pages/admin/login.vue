<route>
{
  meta: {
    layout: 'auth'
  }
}
</route>

<template>
  <v-container
    fluid
    class="d-flex align-center justify-center fill-height auth-background"
  >
    <v-card elevation="2" max-width="420" class="pa-6 w-100 rounded-lg">
      <v-card-title class="text-h6 text-center font-weight-bold mb-6">
        <span class="text-primary">Plastik HB</span> Admin Login
      </v-card-title>

      <v-form @submit.prevent="handleLogin" ref="formRef" v-model="valid">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-icon="mdi-email"
          :rules="[rules.required, rules.email]"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />

        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          prepend-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
        />

        <!-- Error Alert -->
        <v-alert v-if="errorMessage" type="error" class="mt-4">
          {{ errorMessage }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          class="mt-6"
          block
          :disabled="!valid"
        >
          Login
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // Import Vue Router
import { login, verifySession } from "../../api/authenticationApi"; // Import login and verify API functions

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const valid = ref(false);
const formRef = ref();
const errorMessage = ref("");
const router = useRouter(); // Initialize Vue Router

const rules = {
  required: (v: string) => !!v || "Wajib diisi",
  email: (v: string) => /.+@.+\..+/.test(v) || "Format email tidak valid",
};

/**
 * @desc Validates session token on page load
 */
async function validateSession() {
  const token = localStorage.getItem("sessionToken");
  if (token) {
    try {
      await verifySession(token); // Call backend API to validate session
      console.log("Session is valid. Redirecting to /admin...");
      router.push("/admin"); // Redirect to /admin if session is valid
    } catch (error: any) {
      console.error("Session validation failed:", error);
      localStorage.removeItem("sessionToken"); // Remove invalid token
      errorMessage.value = "Session expired. Please log in again.";
    }
  }
}

/**
 * @desc Handles user login
 */
async function handleLogin() {
  if (formRef.value?.validate()) {
    try {
      const token = await login(email.value, password.value); // Call backend API
      console.log("Login successful, token:", token);
      localStorage.setItem("sessionToken", token); // Store token in localStorage
      errorMessage.value = ""; // Clear error message

      // Redirect to /admin
      router.push("/admin");
    } catch (error: any) {
      console.error("Login failed:", error);
      // Display backend error message
      errorMessage.value =
        error.response?.data?.message || "Login gagal. Silakan coba lagi.";
    }
  }
}

// Validate session on page load
onMounted(() => {
  validateSession();
});
</script>
