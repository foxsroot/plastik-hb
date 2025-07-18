<template>
    <v-sheet class="banner-container" rounded="0">
        <!-- Loading State -->
        <div v-if="loading" class="banner-loading">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            <p class="mt-4 text-grey-darken-1">Loading banners...</p>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
            <v-alert-title>Error Loading Banners</v-alert-title>
            {{ error }}
            <template #append>
                <v-btn color="error" variant="outlined" size="small" @click="fetchBanners">
                    Retry
                </v-btn>
            </template>
        </v-alert>

        <!-- Banner Carousel -->
        <v-carousel v-else-if="slides.length > 0" v-model="currentSlide" height="350" cycle interval="5000"
            hide-delimiter-background show-arrows="hover" delimiter-icon="mdi-circle" class="custom-carousel">
            <v-carousel-item v-for="(slide, index) in slides" :key="index" :src="slide.image" cover
                class="carousel-slide">
                <v-sheet class="slide-overlay" color="transparent">
                    <v-container fluid class="fill-height">
                        <v-row align="center" justify="center" class="fill-height">
                            <v-col cols="12" class="text-center">
                                <v-sheet color="transparent" class="slide-content">
                                    <h1 class="slide-title text-white font-weight-bold mb-4">
                                        {{ slide.title }}
                                    </h1>
                                    <p class="slide-subtitle text-white mb-6">
                                        {{ slide.subtitle }}
                                    </p>
                                    <v-btn color="primary" size="large" variant="elevated" class="cta-button" rounded
                                        @click="onCtaClick(slide)">
                                        <v-icon start>mdi-shopping</v-icon>
                                        {{ slide.cta_text || 'Lihat Produk' }}
                                    </v-btn>
                                </v-sheet>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-sheet>
            </v-carousel-item>
        </v-carousel>

        <!-- Empty State -->
        <div v-else class="banner-empty text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-image-off</v-icon>
            <h3 class="text-h6 text-grey-darken-1 mt-4">No Banners Available</h3>
            <p class="text-body-2 text-grey-darken-1">
                There are no banners to display at the moment.
            </p>
            <v-btn color="primary" variant="outlined" class="mt-4" @click="fetchBanners">
                Refresh
            </v-btn>
        </div>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchEndpoint } from './../fetchEndpoint';

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    cta_text?: string;
    cta_link?: string;
    active?: boolean;
    order?: number;
    created_at?: string;
    updated_at?: string;
}

interface ApiResponse {
    success: boolean;
    data: Banner[];
    message?: string;
    total?: number;
    page?: number;
    limit?: number;
}

// Reactive state
const currentSlide = ref(0);
const slides = ref<Banner[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch banners from backend using fetchEndpoint utility
const fetchBanners = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/banners/active`;
        const data = await fetchEndpoint(endpoint, 'GET');

        if (data && data.success) {
            slides.value = data.data || [];
        } else if (Array.isArray(data)) {
            // Handle case where API returns array directly without wrapper
            slides.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch banners');
        }
    } catch (err) {
        console.error('Error fetching banners:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock banner data for development');
            slides.value = getMockBanners();
        }
    } finally {
        loading.value = false;
    }
};

// Alternative method with authentication token (if needed for personalized banners)
const fetchBannersWithAuth = async (token?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/banners/active`;
        const data = await fetchEndpoint(endpoint, 'GET', token);

        if (data && data.success) {
            slides.value = data.data || [];
        } else if (Array.isArray(data)) {
            slides.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch banners');
        }
    } catch (err) {
        console.error('Error fetching banners:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock banner data for development');
            slides.value = getMockBanners();
        }
    } finally {
        loading.value = false;
    }
};

// Handle CTA button click
const onCtaClick = (slide: Banner): void => {
    if (slide.cta_link) {
        // Navigate to the specified link
        window.open(slide.cta_link, '_self');
    } else {
        // Default action - navigate to products page
        console.log('Navigate to products page from banner:', slide);
        // Example: router.push('/products');
    }
};

// Function to get auth token (implement based on your auth system)
const getAuthToken = (): string | null => {
    // Example implementations:
    // return localStorage.getItem('authToken');
    // return store.getters.authToken;
    // return useAuthStore().token;
    return null;
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
    const token = getAuthToken();
    return !!token;
};

// Mock data fallback
const getMockBanners = (): Banner[] => [
    {
        id: 1,
        title: 'Produk Plastik Berkualitas',
        subtitle: 'Solusi terbaik untuk kebutuhan kemasan plastik Anda dengan kualitas premium dan harga terjangkau',
        image: 'https://placehold.co/1200x350/4CAF50/ffffff?text=Produk+Plastik+Berkualitas',
        cta_text: 'Lihat Produk',
        cta_link: '/products',
        active: true,
        order: 1
    },
    {
        id: 2,
        title: 'Inovasi Teknologi Terdepan',
        subtitle: 'Menggunakan teknologi modern untuk menghasilkan produk plastik yang ramah lingkungan',
        image: 'https://placehold.co/1200x350/2196F3/ffffff?text=Inovasi+Teknologi',
        cta_text: 'Pelajari Lebih Lanjut',
        cta_link: '/about',
        active: true,
        order: 2
    },
    {
        id: 3,
        title: 'Layanan Terpercaya',
        subtitle: 'Melayani pelanggan dengan profesional dan memberikan jaminan kualitas terbaik',
        image: 'https://placehold.co/1200x350/FF9800/ffffff?text=Layanan+Terpercaya',
        cta_text: 'Hubungi Kami',
        cta_link: '/contact',
        active: true,
        order: 3
    }
];

// Lifecycle
onMounted(() => {
    const token = getAuthToken();
    if (isAuthenticated() && token) {
        // Use authenticated endpoint if you have user-specific banners
        fetchBannersWithAuth(token);
    } else {
        fetchBanners();
    }
});
</script>

<style scoped>
.banner-container {
    width: 100%;
    max-width: 100vw;
    margin: 0 0 2rem 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    min-height: 350px;
}

.banner-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 350px;
    background: #f5f5f5;
}

.banner-empty {
    height: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
}

.custom-carousel {
    border-radius: 0;
}

.carousel-slide {
    position: relative;
}

.slide-overlay {
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
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
}

.slide-title {
    font-size: 2.2rem !important;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    animation: slideInUp 1s ease-out;
    line-height: 1.2;
}

.slide-subtitle {
    font-size: 1.1rem !important;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    animation: slideInUp 1s ease-out 0.2s both;
    opacity: 0.95;
}

.cta-button {
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    animation: slideInUp 1s ease-out 0.4s both;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3) !important;
}

/* Custom carousel navigation styling */
:deep(.v-carousel__controls) {
    background: transparent;
}

:deep(.v-btn--icon.v-btn--density-default) {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 50%;
}

:deep(.v-btn--icon.v-btn--density-default:hover) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

:deep(.v-carousel__controls__item) {
    margin: 0 4px;
}

:deep(.v-carousel__controls__item .v-btn) {
    width: 12px;
    height: 12px;
    border: 2px solid white;
    background: transparent;
}

:deep(.v-carousel__controls__item--active .v-btn) {
    background: white;
    transform: scale(1.2);
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
    .banner-container :deep(.v-carousel) {
        height: 300px !important;
    }

    .banner-loading,
    .banner-empty {
        height: 300px;
    }

    .slide-title {
        font-size: 1.8rem !important;
    }

    .slide-subtitle {
        font-size: 1rem !important;
    }

    .slide-content {
        padding: 0 1.5rem;
    }
}

@media (max-width: 768px) {
    .banner-container :deep(.v-carousel) {
        height: 250px !important;
    }

    .banner-loading,
    .banner-empty {
        height: 250px;
    }

    .slide-title {
        font-size: 1.5rem !important;
        margin-bottom: 0.8rem !important;
    }

    .slide-subtitle {
        font-size: 0.9rem !important;
        margin-bottom: 1rem !important;
    }

    .slide-content {
        padding: 0 1rem;
    }

    .cta-button {
        font-size: 0.9rem !important;
    }
}

@media (max-width: 480px) {
    .banner-container :deep(.v-carousel) {
        height: 200px !important;
    }

    .banner-loading,
    .banner-empty {
        height: 200px;
    }

    .slide-title {
        font-size: 1.2rem !important;
    }

    .slide-subtitle {
        font-size: 0.8rem !important;
        margin-bottom: 0.8rem !important;
    }

    .slide-content {
        padding: 0 0.75rem;
    }

    .cta-button {
        font-size: 0.8rem !important;
        padding: 0.5rem 1rem !important;
    }

    :deep(.v-carousel__controls__item .v-btn) {
        width: 10px;
        height: 10px;
    }
}
</style>