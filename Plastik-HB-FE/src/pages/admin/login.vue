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

      <v-form @submit.prevent="login" ref="formRef" v-model="valid">
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
import { ref } from "vue";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const valid = ref(false);
const formRef = ref();

const rules = {
  required: (v: string) => !!v || "Wajib diisi",
  email: (v: string) => /.+@.+\..+/.test(v) || "Format email tidak valid",
};

function login() {
  if (formRef.value?.validate()) {
    console.log("Login with", email.value, password.value);
  }
}
</script>
