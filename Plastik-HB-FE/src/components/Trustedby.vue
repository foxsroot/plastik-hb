<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

interface TrustedByPartner {
  order: number;
  title: string;
  image: string;
}

const props = defineProps<{
  trustedByList: TrustedByPartner[];
  trustedByRepeatedList: TrustedByPartner[];
}>();

const trustedByMarquee = ref<HTMLElement | null>(null);
const trustedByTrack = ref<HTMLElement | null>(null);
let trustedByIsDragging = false;
let trustedByStartX = 0;
let trustedByScrollLeft = 0;
let trustedByAutoScrollId: number | null = null;

const startTrustedByAutoScroll = () => {
  if (trustedByAutoScrollId) return;
  trustedByAutoScrollId = window.setInterval(() => {
    if (!trustedByMarquee.value || !trustedByTrack.value) return;
    trustedByMarquee.value.scrollLeft += 1;
    const maxScroll = trustedByTrack.value.scrollWidth / 2;
    trustedByMarquee.value.scrollLeft =
      ((trustedByMarquee.value.scrollLeft % maxScroll) + maxScroll) % maxScroll;
  }, 16);
};
const stopTrustedByAutoScroll = () => {
  if (trustedByAutoScrollId) {
    clearInterval(trustedByAutoScrollId);
    trustedByAutoScrollId = null;
  }
};

const onTrustedByMouseDown = (e: MouseEvent) => {
  if (!trustedByMarquee.value) return;
  trustedByIsDragging = true;
  trustedByMarquee.value.classList.add("dragging");
  trustedByStartX = e.pageX - trustedByMarquee.value.offsetLeft;
  trustedByScrollLeft = trustedByMarquee.value.scrollLeft;
};
const onTrustedByMouseLeave = () => {
  trustedByIsDragging = false;
  if (trustedByMarquee.value)
    trustedByMarquee.value.classList.remove("dragging");
};
const onTrustedByMouseUp = () => {
  trustedByIsDragging = false;
  if (trustedByMarquee.value)
    trustedByMarquee.value.classList.remove("dragging");
};
const onTrustedByMouseMove = (e: MouseEvent) => {
  if (!trustedByIsDragging || !trustedByMarquee.value) return;
  e.preventDefault();
  const x = e.pageX - trustedByMarquee.value.offsetLeft;
  const walk = (x - trustedByStartX) * 1.2;
  if (trustedByTrack.value) {
    const maxScroll = trustedByTrack.value.scrollWidth / 2;
    let newScrollLeft = trustedByScrollLeft - walk;
    trustedByMarquee.value.scrollLeft =
      ((newScrollLeft % maxScroll) + maxScroll) % maxScroll;
  }
};

onMounted(async () => {
  await nextTick();
  if (trustedByMarquee.value) {
    trustedByMarquee.value.addEventListener("mousedown", onTrustedByMouseDown);
    trustedByMarquee.value.addEventListener(
      "mouseleave",
      onTrustedByMouseLeave,
    );
    trustedByMarquee.value.addEventListener("mouseup", onTrustedByMouseUp);
    trustedByMarquee.value.addEventListener("mousemove", onTrustedByMouseMove);
  }
  startTrustedByAutoScroll();
});

onUnmounted(() => {
  stopTrustedByAutoScroll();
  if (trustedByMarquee.value) {
    trustedByMarquee.value.removeEventListener(
      "mousedown",
      onTrustedByMouseDown,
    );
    trustedByMarquee.value.removeEventListener(
      "mouseleave",
      onTrustedByMouseLeave,
    );
    trustedByMarquee.value.removeEventListener("mouseup", onTrustedByMouseUp);
    trustedByMarquee.value.removeEventListener(
      "mousemove",
      onTrustedByMouseMove,
    );
  }
});
</script>

<template>
  <v-row class="trusted-by-section py-10">
    <v-col cols="12" class="text-center mb-4">
      <h2 class="text-h6 font-weight-bold mb-2">Trusted By</h2>
    </v-col>
    <v-col cols="12">
      <div
        class="trusted-by-marquee"
        ref="trustedByMarquee"
        style="cursor: grab; user-select: none"
      >
        <div class="trusted-by-track" ref="trustedByTrack">
          <div
            v-for="(partner, idx) in props.trustedByList"
            :key="'main-' + idx + '-' + partner.order"
            class="trusted-by-logo d-flex align-center justify-center"
          >
            <template v-if="partner.image && partner.image.trim()">
              <v-img
                :src="partner.image"
                height="40"
                width="120"
                class="trusted-by-img mr-2"
                style="object-fit: contain; background: transparent"
              />
            </template>
            <template v-else>
              <v-icon size="40" color="amber" class="mr-2"
                >mdi-handshake-outline</v-icon
              >
            </template>
          </div>
          <!-- Duplicate for seamless loop -->
          <div
            v-for="(partner, idx) in props.trustedByRepeatedList"
            :key="'dup-' + idx + '-' + partner.order"
            class="trusted-by-logo d-flex align-center justify-center"
          >
            <template v-if="partner.image && partner.image.trim()">
              <v-img
                :src="partner.image"
                height="40"
                width="120"
                class="trusted-by-img mr-2"
                style="object-fit: contain; background: transparent"
              />
            </template>
            <template v-else>
              <v-icon size="40" color="amber" class="mr-2"
                >mdi-handshake-outline</v-icon
              >
            </template>
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.trusted-by-section {
  background: #222;
}

.trusted-by-marquee {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  background: transparent;
  padding: 24px 0;
  position: relative;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.trusted-by-marquee.dragging {
  cursor: grabbing;
}

.trusted-by-marquee::-webkit-scrollbar {
  display: none;
}

.trusted-by-track {
  display: flex;
  align-items: center;
  will-change: transform;
  /* Remove animation for manual scroll */
}

.trusted-by-logo {
  min-width: 180px;
  width: 180px;
  height: 60px;
  margin: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #222;
  border-radius: 8px;
  border: 2px solid #888;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .trusted-by-item {
    flex: 1 1 100%;
  }
}
</style>
