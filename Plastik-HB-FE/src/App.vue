<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import CustomerLayout from "@/layouts/CustomerLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

const route = useRoute();

const layout = computed(() => {
  switch (route.meta.layout) {
    case "admin":
      return AdminLayout;
    case "auth":
      return AuthLayout;
    default:
      return CustomerLayout;
  }
});
</script>
