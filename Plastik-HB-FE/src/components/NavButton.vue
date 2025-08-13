<template>
  <v-btn
    :to="to"
    variant="text"
    size="large"
    color="white"
    class="nav-link px-6"
    :class="{ active: $route.path === to }"
  >
    {{ label }}
  </v-btn>
</template>

<script lang="ts" setup>
defineProps<{
  to: string;
  label: string;
}>();
</script>

<style scoped>
.nav-link {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #1976d2;
}

.nav-link.active {
  color: #1976d2;
  font-weight: 600;
}
</style>
