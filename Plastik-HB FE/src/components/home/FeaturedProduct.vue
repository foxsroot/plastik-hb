<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchEndpoint } from './../fetchEndpoint';

interface Product {
    id: number;
    name: string;
    type: string;
    description: string;
    category: string[];
    price: string | number;
    image: string;
    stock?: number;
    featured?: boolean;
    created_at?: string;
    updated_at?: string;
}

const productsWrapper = ref<HTMLElement | null>(null);
const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);


// Fetch products from backend using fetchEndpoint utility
const fetchProducts = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/products/featured`;
        const data = await fetchEndpoint(endpoint, 'GET');

        if (data && data.success) {
            products.value = data.data || [];
        } else if (Array.isArray(data)) {
            // Handle case where API returns array directly without wrapper
            products.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch products');
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock data for development');
            products.value = getMockProducts();
        }
    } finally {
        loading.value = false;
    }
};

const fetchProductsWithAuth = async (token?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const endpoint = `/products/featured`;
        const data = await fetchEndpoint(endpoint, 'GET', token);

        if (data && data.success) {
            products.value = data.data || [];
        } else if (Array.isArray(data)) {
            products.value = data;
        } else {
            throw new Error(data?.message || 'Failed to fetch products');
        }

        // If authenticated, fetch additional product data (like favorites/wishlist)
        if (token) {
            try {
                const wishlistResponse = await fetchEndpoint('/user/wishlist', 'GET', token);
                const wishlistArray = wishlistResponse.data || wishlistResponse;

                if (Array.isArray(wishlistArray)) {
                    const wishlistProductIds = new Set(wishlistArray.map((item: any) => item.product_id));
                    products.value.forEach((product: Product) => {
                        (product as any).isWishlisted = wishlistProductIds.has(product.id);
                    });
                }
            } catch (err) {
                console.error('Error fetching wishlist:', err);
            }
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        error.value = err instanceof Error ? err.message : 'An unknown error occurred';

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
            console.warn('Using fallback mock data for development');
            products.value = getMockProducts();
        }
    } finally {
        loading.value = false;
    }
};

// Utility functions
const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    }
    return price;
};

const openProductDetail = (product: Product): void => {
    // Emit event or navigate to product detail
    console.log('Opening product detail:', product);
    // Example: router.push(`/products/${product.id}`);
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
const getMockProducts = (): Product[] => [
    {
        id: 1,
        name: 'Plastic Container Large',
        type: 'Storage Containers',
        description: 'Heavy-duty plastic container perfect for bulk storage. Made from high-quality, BPA-free materials with reinforced corners for maximum durability.',
        category: ['BPA-Free', 'Heavy-Duty', 'Stackable'],
        price: 125000,
        image: 'https://placehold.co/300x250/4CAF50/ffffff?text=Container+Large',
        stock: 50,
        featured: true
    },
    {
        id: 2,
        name: 'Food Grade Plastic Box',
        type: 'Food Containers',
        description: 'Premium food-grade storage solution with airtight seal technology. Keeps food fresh longer with innovative vacuum-lock design.',
        category: ['Food-Safe', 'Airtight', 'Microwave-Safe'],
        price: 89000,
        image: 'https://placehold.co/300x250/2196F3/ffffff?text=Food+Box',
        stock: 30,
        featured: true
    },
    {
        id: 3,
        name: 'Transparent Storage Bin',
        type: 'Storage Solutions',
        description: 'Crystal-clear storage bin with easy-grip handles. Perfect for organizing and quick identification of contents. Impact-resistant design.',
        category: ['Crystal-Clear', 'Easy-Grip', 'Impact-Resistant'],
        price: 75000,
        image: 'https://placehold.co/300x250/FF9800/ffffff?text=Storage+Bin',
        stock: 25,
        featured: true
    },
    {
        id: 4,
        name: 'Stackable Plastic Drawer',
        type: 'Organization',
        description: 'Modular drawer system with smooth sliding mechanism. Maximizes space efficiency with interlocking design and premium finish.',
        category: ['Modular', 'Smooth-Slide', 'Space-Efficient'],
        price: 95000,
        image: 'https://placehold.co/300x250/9C27B0/ffffff?text=Drawer',
        stock: 40,
        featured: true
    },
    {
        id: 5,
        name: 'Heavy Duty Plastic Crate',
        type: 'Industrial',
        description: 'Industrial-strength crate designed for heavy loads and harsh environments. Features reinforced base and UV-resistant coating.',
        category: ['Industrial-Grade', 'UV-Resistant', 'Heavy-Load'],
        price: 180000,
        image: 'https://placehold.co/300x250/F44336/ffffff?text=Heavy+Crate',
        stock: 15,
        featured: true
    }
];

// Lifecycle
onMounted(() => {
    const token = getAuthToken();
    if (isAuthenticated() && token) {
        fetchProductsWithAuth(token);
    } else {
        fetchProducts();
    }
});
</script>

<template>
    <section class="featured-products-section">
        <v-container>
            <v-row justify="center">
                <v-col cols="12">
                    <h2 class="text-h3 text-center font-weight-bold mb-8 text-grey-darken-3">
                        Featured Products
                    </h2>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12">
                    <!-- Loading State -->
                    <div v-if="loading" class="text-center py-8">
                        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
                        <p class="mt-4 text-grey-darken-1">Loading products...</p>
                    </div>

                    <!-- Error State -->
                    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4" closable
                        @click:close="error = null">
                        <v-alert-title>Error Loading Products</v-alert-title>
                        {{ error }}
                        <template #append>
                            <v-btn color="error" variant="outlined" size="small" @click="fetchProducts">
                                Retry
                            </v-btn>
                        </template>
                    </v-alert>

                    <!-- Products List -->
                    <div v-else-if="products.length > 0" class="products-container">
                        <div class="products-wrapper" ref="productsWrapper">
                            <v-card v-for="(product, index) in products" :key="`product-${product.id || index}`"
                                class="product-card mx-3" elevation="4" rounded="lg" hover>
                                <div class="product-image-container">
                                    <v-img :src="product.image" :alt="product.name" height="200" cover
                                        class="product-image">
                                        <div class="product-overlay">
                                            <v-btn color="primary" variant="elevated" size="small"
                                                class="quick-view-btn" @click="openProductDetail(product)">
                                                <v-icon start>mdi-eye</v-icon>
                                                Quick View
                                            </v-btn>
                                        </div>
                                    </v-img>
                                </div>

                                <v-card-text class="product-info pa-6">
                                    <h3 class="text-h6 font-weight-bold text-grey-darken-3 mb-2">
                                        {{ product.name }}
                                    </h3>

                                    <v-chip color="primary" size="small" variant="outlined" class="mb-3">
                                        {{ product.type }}
                                    </v-chip>

                                    <p class="text-body-2 text-grey-darken-1 mb-4">
                                        {{ product.description }}
                                    </p>

                                    <div class="product-features mb-4">
                                        <v-chip v-for="cat in product.category" :key="cat" size="x-small"
                                            color="grey-lighten-2" text-color="grey-darken-2" class="mr-1 mb-1">
                                            {{ cat }}
                                        </v-chip>
                                    </div>

                                    <div class="text-h5 font-weight-bold text-primary">
                                        {{ formatPrice(product.price) }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-8">
                        <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
                        <h3 class="text-h6 text-grey-darken-1 mt-4">No Products Found</h3>
                        <p class="text-body-2 text-grey-darken-1">
                            There are no featured products available at the moment.
                        </p>
                        <v-btn color="primary" variant="outlined" class="mt-4" @click="fetchProducts">
                            Refresh
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<style scoped>
.featured-products-section {
    padding: 4rem 0;
    background-color: #f8f9fa;
}

.products-container {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px 0;
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
}

.products-container::-webkit-scrollbar {
    height: 8px;
}

.products-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.products-container::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.products-container::-webkit-scrollbar-thumb:hover {
    background: #999;
}

.products-wrapper {
    display: flex;
    gap: 20px;
    padding: 0 10px;
    min-width: min-content;
}

.product-card {
    width: 320px !important;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.product-card:hover {
    transform: translateY(-8px);
}

.product-image-container {
    position: relative;
    overflow: hidden;
}

.product-image {
    transition: transform 0.3s ease;
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
    opacity: 1;
}

.quick-view-btn {
    text-transform: none !important;
    letter-spacing: normal !important;
}

.product-features {
    display: flex;
    flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .product-card {
        width: 280px !important;
    }
}

@media (max-width: 768px) {
    .product-card {
        width: 240px !important;
    }

    .products-wrapper {
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .featured-products-section {
        padding: 2rem 0;
    }

    .product-card {
        width: 200px !important;
    }

    .products-wrapper {
        gap: 10px;
    }
}
</style>