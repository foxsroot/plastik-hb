<template>
    <div class="banner-container">
        <div class="carousel">
            <div class="carousel-wrapper" :style="{ transform: `translateX(-${currentSlide * 33.33}%)` }">
                <div v-for="(slide, index) in slides" :key="index" class="slide"
                    :style="{ backgroundImage: `url(${slide.image})` }">
                    <div class="slide-content">
                        <div class="slide-text">
                            <h1 class="slide-title">{{ slide.title }}</h1>
                            <p class="slide-subtitle">{{ slide.subtitle }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation Dots -->
            <div class="dots-container">
                <button v-for="(slide, index) in slides" :key="index" class="dot"
                    :class="{ active: currentSlide === index }" @click="goToSlide(index)"></button>
            </div>

            <!-- Navigation Arrows -->
            <button class="nav-arrow prev" @click="prevSlide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
            <button class="nav-arrow next" @click="nextSlide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentSlide = ref(0);
const autoScrollInterval = ref<ReturnType<typeof setInterval> | null>(null);
const slides = [
    {
        title: 'Produk Plastik Berkualitas',
        subtitle: 'Solusi terbaik untuk kebutuhan kemasan plastik Anda dengan kualitas premium dan harga terjangkau',
        image: 'https://placehold.co/900x250/4CAF50/ffffff?text=Produk+Plastik+Berkualitas'
    },
    {
        title: 'Inovasi Teknologi Terdepan',
        subtitle: 'Menggunakan teknologi modern untuk menghasilkan produk plastik yang ramah lingkungan',
        image: 'https://placehold.co/900x250/2196F3/ffffff?text=Inovasi+Teknologi'
    },
    {
        title: 'Layanan Terpercaya',
        subtitle: 'Melayani pelanggan dengan profesional dan memberikan jaminan kualitas terbaik',
        image: 'https://placehold.co/900x250/FF9800/ffffff?text=Layanan+Terpercaya'
    }
];

function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
}

function prevSlide() {
    currentSlide.value = currentSlide.value === 0 ? slides.length - 1 : currentSlide.value - 1;
}

function goToSlide(index: number) {
    currentSlide.value = index;
    resetAutoScroll();
}

function startAutoScroll() {
    autoScrollInterval.value = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopAutoScroll() {
    if (autoScrollInterval.value) {
        clearInterval(autoScrollInterval.value);
        autoScrollInterval.value = null;
    }
}

function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
}

onMounted(() => {
    startAutoScroll();
});

onBeforeUnmount(() => {
    stopAutoScroll();
});
</script>

<style scoped>
.banner-container {
    width: 100%;
    max-width: 100vw;
    height: 350px;
    position: relative;
    overflow: hidden;
    margin: 0 0 2rem 0;
    border-radius: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel {
    width: 100%;
    height: 100%;
    position: relative;
}

.carousel-wrapper {
    width: 300%;
    height: 100%;
    display: flex;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide {
    width: 33.333333%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.slide::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
}

.slide-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: white;
    max-width: 800px;
    padding: 0 40px;
}

.slide-title {
    font-size: 2.2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    animation: slideInUp 1s ease-out;
}

.slide-subtitle {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    animation: slideInUp 1s ease-out 0.2s both;
}

.cta-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    animation: slideInUp 1s ease-out 0.4s both;
}

.cta-button:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.dots-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 3;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.active {
    background: white;
    transform: scale(1.2);
}

.dot:hover {
    background: rgba(255, 255, 255, 0.7);
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 3;
    backdrop-filter: blur(10px);
}

.nav-arrow:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
}

.nav-arrow.prev {
    left: 20px;
}

.nav-arrow.next {
    right: 20px;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 1024px) {
    .banner-container {
        height: 300px;
    }

    .slide-title {
        font-size: 1.8rem;
    }

    .slide-subtitle {
        font-size: 1rem;
    }

    .slide-content {
        padding: 0 30px;
    }
}

@media (max-width: 768px) {
    .banner-container {
        height: 250px;
    }

    .slide-title {
        font-size: 1.5rem;
        margin-bottom: 0.8rem;
    }

    .slide-subtitle {
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .slide-content {
        padding: 0 20px;
    }

    .cta-button {
        padding: 10px 20px;
        font-size: 0.9rem;
    }

    .nav-arrow {
        width: 35px;
        height: 35px;
    }

    .nav-arrow.prev {
        left: 15px;
    }

    .nav-arrow.next {
        right: 15px;
    }
}

@media (max-width: 480px) {
    .banner-container {
        height: 200px;
    }

    .slide-title {
        font-size: 1.2rem;
    }

    .slide-subtitle {
        font-size: 0.8rem;
        margin-bottom: 0.8rem;
    }

    .slide-content {
        padding: 0 15px;
    }

    .cta-button {
        padding: 8px 16px;
        font-size: 0.8rem;
    }

    .dots-container {
        bottom: 15px;
    }

    .dot {
        width: 8px;
        height: 8px;
    }

    .nav-arrow {
        width: 30px;
        height: 30px;
    }

    .nav-arrow.prev {
        left: 10px;
    }

    .nav-arrow.next {
        right: 10px;
    }
}
</style>