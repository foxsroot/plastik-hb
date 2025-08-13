<template>
  <v-app :theme="theme">
    <v-main class="d-flex align-center justify-center loading-page">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// You can dynamically change dark/light theme if needed
const theme = "dark";
</script>

<style scoped>
.loading-page {
  min-height: 100vh;
  background: #121212; /* dark base */
  color: #fff;
  overflow: hidden;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-float 2.5s ease-in-out infinite;
}

.logo-text {
  font-size: 3rem;
  font-weight: 600;
  font-family: "Inter", "Roboto", sans-serif;
  letter-spacing: 1px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

/* Animation for smooth pulse + slight float */
@keyframes pulse-float {
  0% {
    transform: scale(1) translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.06) translateY(-6px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 0.9;
  }
}
</style>
