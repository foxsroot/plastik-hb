<template>
    <section class="achievement-section">
        <v-container>
            <v-row justify="center">
                <v-col cols="12">
                    <h2 class="text-h3 text-center font-weight-bold mb-8 text-grey-darken-3">
                        Achievement
                    </h2>
                </v-col>
            </v-row>

            <!-- Loading State -->
            <v-row v-if="loading" justify="center">
                <v-col cols="12" class="text-center py-8">
                    <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
                    <p class="mt-4 text-grey-darken-1">Loading achievements...</p>
                </v-col>
            </v-row>

            <!-- Error State -->
            <v-row v-else-if="error" justify="center">
                <v-col cols="12">
                    <v-alert type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
                        <v-alert-title>Error Loading Achievements</v-alert-title>
                        {{ error }}
                        <template #append>
                            <v-btn color="error" variant="outlined" size="small" @click="fetchAchievements">
                                Retry
                            </v-btn>
                        </template>
                    </v-alert>
                </v-col>
            </v-row>

            <!-- Achievement Content -->
            <v-row v-else-if="achievements.length > 0" class="achievement-content">
                <!-- Left side - Main Achievement Card -->
                <v-col cols="12" md="6">
                    <v-card class="achievement-main fill-height" elevation="4" rounded="lg">
                        <v-card-text class="d-flex align-center justify-center fill-height pa-8">
                            <v-sheet color="transparent" class="text-center">
                                <v-icon size="80" color="primary" class="mb-4">
                                    mdi-trophy
                                </v-icon>
                                <h3 class="text-h4 font-weight-bold text-grey-darken-3 mb-4">
                                    {{ mainAchievement.title || 'Pencapaian Utama' }}
                                </h3>
                                <p class="text-body-1 text-grey-darken-1">
                                    {{ mainAchievement.description ||
                                        'Konten utama pencapaian perusahaan dalam ' +
                                        'bidang plastik dan kemasan berkualitas tinggi' }}
                                </p>
                                <v-btn v-if="mainAchievement.link" color="primary" variant="outlined" class="mt-4"
                                    @click="openMainAchievement">
                                    Pelajari Lebih Lanjut
                                </v-btn>
                            </v-sheet>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Right side - Achievement Grid -->
                <v-col cols="12" md="6">
                    <v-row class="achievement-grid">
                        <v-col v-for="(achievement, index) in achievements" :key="achievement.id || index" cols="6">
                            <v-card class="achievement-item" elevation="2" rounded="lg" hover>
                                <v-card-text class="pa-4">
                                    <v-row align="center" no-gutters>
                                        <v-col cols="auto" class="me-3">
                                            <v-avatar size="60" class="achievement-icon">
                                                <v-img :src="achievement.image" :alt="achievement.description" cover />
                                            </v-avatar>
                                        </v-col>
                                        <v-col>
                                            <v-sheet color="transparent" class="achievement-info">
                                                <div class="text-h5 font-weight-bold text-primary mb-1">
                                                    {{ achievement.percentage }}
                                                </div>
                                                <div class="text-body-2 text-grey-darken-1">
                                                    {{ achievement.description }}
                                                </div>
                                            </v-sheet>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

            <!-- Empty State -->
            <v-row v-else justify="center">
                <v-col cols="12" class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-trophy-outline</v-icon>
                    <h3 class="text-h6 text-grey-darken-1 mt-4">No Achievements Found</h3>
                    <p class="text-body-2 text-grey-darken-1">
                        There are no achievements to display at the moment.
                    </p>
                    <v-btn color="primary" variant="outlined" class="mt-4" @click="fetchAchievements">
                        Refresh
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchEndpoint } from './../fetchEndpoint';

interface Achievement {
    id: number;
    image: string;
    percentage: string;
    description: string;
    order?: number;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface MainAchievement {
    id?: number;
    title: string;
    description: string;
    link?: string;
    image?: string;
}

interface ApiResponse {
    success: boolean;
    data: Achievement[];
    main_achievement?: MainAchievement;
    message?: string;
    total?: number;
}

// Reactive state
const achievements = ref<Achievement[]>([]);
const mainAchievement = ref<MainAchievement>({
    title: 'Pencapaian Utama',
    description: 'Konten utama pencapaian perusahaan dalam bidang plastik dan kemasan berkualitas tinggi'
});
const loading = ref(false);
const error = ref<string | null>(null);

// API Configuration
const ACHIEVEMENTS_ENDPOINT = '/achievements/active';

// Fetch achievements from backend using fetchEndpoint utility
const fetchAchievements = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/achievements/active`;
        const data = await fetchEndpoint(endpoint, 'GET');

        if (data && data.success) {
            achievements.value = data.data || [];
            if (data.main_achievement) {
                mainAchievement.value = data.main_achievement;
            }
        } else if (Array.isArray(data)) {
            // Handle case where API returns array directly without wrapper
            achievements.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch achievements');
        }
    } catch (err) {
        console.error('Error fetching achievements:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock achievements data for development');
            achievements.value = getMockAchievements();
        }
    } finally {
        loading.value = false;
    }
};

// Alternative method with authentication token
const fetchAchievementsWithAuth = async (token?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/achievements/active`;
        const data = await fetchEndpoint(endpoint, 'GET', token);

        if (data && data.success) {
            achievements.value = data.data || [];
            if (data.main_achievement) {
                mainAchievement.value = data.main_achievement;
            }
        } else if (Array.isArray(data)) {
            achievements.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch achievements');
        }
    } catch (err) {
        console.error('Error fetching achievements:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock achievements data for development');
            achievements.value = getMockAchievements();
        }
    } finally {
        loading.value = false;
    }
};

// Handle main achievement click
const openMainAchievement = (): void => {
    if (mainAchievement.value.link) {
        window.open(mainAchievement.value.link, '_self');
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
const getMockAchievements = (): Achievement[] => [
    {
        id: 1,
        image: 'https://placehold.co/80x80/4CAF50/ffffff?text=1',
        percentage: '95%',
        description: 'Kepuasan Pelanggan',
        order: 1,
        active: true
    },
    {
        id: 2,
        image: 'https://placehold.co/80x80/2196F3/ffffff?text=2',
        percentage: '87%',
        description: 'Kualitas Produk',
        order: 2,
        active: true
    },
    {
        id: 3,
        image: 'https://placehold.co/80x80/FF9800/ffffff?text=3',
        percentage: '92%',
        description: 'Ketepatan Waktu',
        order: 3,
        active: true
    },
    {
        id: 4,
        image: 'https://placehold.co/80x80/9C27B0/ffffff?text=4',
        percentage: '78%',
        description: 'Inovasi Produk',
        order: 4,
        active: true
    },
    {
        id: 5,
        image: 'https://placehold.co/80x80/F44336/ffffff?text=5',
        percentage: '89%',
        description: 'Efisiensi Produksi',
        order: 5,
        active: true
    }
];

// Lifecycle
onMounted(() => {
    const token = getAuthToken();
    if (isAuthenticated() && token) {
        fetchAchievementsWithAuth(token);
    } else {
        fetchAchievements();
    }
});
</script>

<style scoped>
.achievement-section {
    padding: 4rem 0;
    background-color: #f8f9fa;
}

.achievement-content {
    align-items: stretch;
}

.achievement-main {
    min-height: 400px;
}

.achievement-grid {
    height: 100%;
}

.achievement-item {
    transition: all 0.3s ease;
}

.achievement-item:hover {
    transform: translateY(-4px);
}

.achievement-icon {
    border: 2px solid #e0e0e0;
}

.achievement-info {
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Responsive Design */
@media (max-width: 960px) {
    .achievement-content {
        flex-direction: column;
    }

    .achievement-main {
        min-height: 250px;
    }
}

@media (max-width: 600px) {
    .achievement-section {
        padding: 2rem 0;
    }

    .achievement-main {
        min-height: 200px;
    }

    .achievement-item :deep(.v-card-text) {
        padding: 12px !important;
    }

    .achievement-icon {
        width: 50px !important;
        height: 50px !important;
    }
}

@media (max-width: 480px) {
    .achievement-grid .v-col {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
</style>