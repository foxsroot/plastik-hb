<template>
  <div class="pagination-container mt-6 mb-4">
    <div class="d-flex align-center justify-center">
      <v-btn
        :disabled="currentPage === 1"
        icon
        variant="text"
        color="white"
        class="pagination-arrow"
        @click="emit('prev')"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="pagination-dots mx-4">
        <div class="d-flex align-center gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            :class="[
              'pagination-dot',
              { 'pagination-dot-active': page === currentPage },
            ]"
            @click="emit('goToPage', page)"
          >
            <span class="pagination-dot-number">{{ page }}</span>
          </button>
        </div>
      </div>
      <v-btn
        :disabled="currentPage === totalPages"
        icon
        variant="text"
        color="white"
        class="pagination-arrow"
        @click="emit('next')"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <div class="text-center mt-3">
      <span class="text-grey-lighten-2 text-caption">
        Halaman {{ currentPage }} dari {{ totalPages }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps<{ currentPage: number; totalPages: number }>();
const emit = defineEmits(["goToPage", "next", "prev"]);
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px 0;
}

.pagination-dots {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
  padding: 8px 0;
}

.pagination-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #444;
  background: rgba(34, 34, 34, 0.8);
  color: #bdbdbd;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  flex-shrink: 0;
}

.pagination-dot:hover {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  color: #1976d2;
  transform: scale(1.1);
}

.pagination-dot-active {
  background-color: #1976d2 !important;
  border-color: #1976d2 !important;
  color: white !important;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
  transform: scale(1.05);
}

.pagination-dot-number {
  font-size: 11px;
  font-weight: 600;
}

.pagination-arrow {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid #444 !important;
  transition: all 0.3s ease !important;
  min-width: 44px !important;
  height: 44px !important;
}

.pagination-arrow:hover:not(:disabled) {
  background-color: rgba(25, 118, 210, 0.2) !important;
  border-color: #1976d2 !important;
  transform: scale(1.05);
}

.pagination-arrow:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

.pagination-arrow .v-icon {
  color: #bdbdbd;
}

.pagination-arrow:hover:not(:disabled) .v-icon {
  color: #1976d2;
}

/* Scrollable dots for many pages */
.pagination-dots::-webkit-scrollbar {
  height: 4px;
}

.pagination-dots::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.pagination-dots::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.pagination-dots::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
