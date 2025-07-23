<template>
  <Loading v-if="showLoading" />
  <v-container v-else fluid class="pa-4 dark-bg">
    <v-row>
      <!-- Filter Sidebar -->
      <v-col
        cols="12"
        md="2"
        class="mb-4 mb-md-0"
      >
        <v-card class="pa-4 elevation-2 rounded-lg" dark>
          <v-card-title class="text-h6 font-weight-medium text-white">Filter</v-card-title>
          <v-divider class="my-3" color="#333" />
          <div class="text-body-1 font-weight-medium mb-2 text-grey-lighten-2">Harga</div>
          <v-row dense>
            <v-col cols="5">
              <v-text-field
                v-model.number="priceMin"
                label="Min"
                type="number"
                :min="0"
                :max="priceMax"
                variant="outlined"
                density="compact"
                hide-details
                color="white"
                class="dark-input"
              />
            </v-col>
            <v-col cols="2" class="text-center d-flex align-center justify-center text-grey-lighten-2">–</v-col>
            <v-col cols="5">
              <v-text-field
                v-model.number="priceMax"
                label="Max"
                type="number"
                :min="priceMin"
                :max="1000000"
                variant="outlined"
                density="compact"
                hide-details
                color="white"
                class="dark-input"
              />
            </v-col>
          </v-row>
          <div class="text-body-1 font-weight-medium my-3 text-grey-lighten-2">Kategori</div>
          <div>
            <v-checkbox
              v-for="cat in dummyCategories"
              :key="cat.id"
              v-model="filter[cat.id]"
              :label="cat.name"
              hide-details
              density="comfortable"
              color="primary"
              class="text-white"
            />
          </div>
        </v-card>
      </v-col>
      <!-- Product List -->
      <v-col cols="12" md="10">
        <v-row>
          <v-col
            v-for="product in filteredProducts"
            :key="product.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="pa-2 elevation-1 rounded-lg product-card transition-card dark-product-card"
              outlined
              dark
            >
              <v-img
                :src="product.image"
                height="150"
                cover
                class="rounded mb-2"
                style="background: #222;"
              />
              <v-card-title class="text-subtitle-1 font-weight-medium mb-1 text-white">
                {{ product.name }}
              </v-card-title>
              <v-card-subtitle class="text-grey-lighten-2 mb-2">
                Rp {{ product.price }}
              </v-card-subtitle>
              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="small"
                  block
                  class="text-capitalize"
                >
                  Detail Produk
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <!-- Loading Spinner -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="d-block mx-auto mt-4"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import Loading from '../components/Loading.vue';

const showLoading = ref(true);
const products = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const filter = reactive<Record<number, boolean>>({});
const priceMin = ref(0);
const priceMax = ref(1000000);

const dummyCategories = [
  { id: 1, name: 'Kategori 1' },
  { id: 2, name: 'Kategori 2' },
  // Add more categories as needed
];

watch([priceMin, priceMax], ([min, max]) => {
  if (priceMin.value < min) priceMin.value = min;
  if (priceMax.value > max) priceMax.value = max;
  if (min > max) {
    priceMax.value = min;
  }
});

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const price = Number(product.price);
    const matchPrice = price >= priceMin.value && price <= priceMax.value;
    // Category filter
    const selectedCatIds = Object.keys(filter).filter(id => filter[Number(id)]);
    let matchCategory = true;
    if (selectedCatIds.length > 0) {
      matchCategory = selectedCatIds.includes(String(dummyCategories.find(cat => cat.name === product.category)?.id));
    }
    return matchPrice && matchCategory;
  });
});

const dummyProducts = [
  {
    id: 1,
    name: 'Nama Barang 1',
    price: 94882,
    image: 'https://via.placeholder.com/140x140?text=Image1',
    category: 'Kategori 1',
  },
  {
    id: 2,
    name: 'Nama Barang 2',
    price: 27501,
    image: 'https://via.placeholder.com/140x140?text=Image2',
    category: 'Kategori 2',
  },
  {
    id: 3,
    name: 'Nama Barang 3',
    price: 76609,
    image: 'https://via.placeholder.com/140x140?text=Image3',
    category: 'Kategori 1',
  },
  {
    id: 4,
    name: 'Nama Barang 4',
    price: 48140,
    image: 'https://via.placeholder.com/140x140?text=Image4',
    category: 'Kategori 2',
  },
  {
    id: 5,
    name: 'Nama Barang 5',
    price: 41885,
    image: 'https://via.placeholder.com/140x140?text=Image5',
    category: 'Kategori 1',
  },
  {
    id: 6,
    name: 'Nama Barang 6',
    price: 3838,
    image: 'https://via.placeholder.com/140x140?text=Image6',
    category: 'Kategori 2',
  },
  {
    id: 7,
    name: 'Nama Barang 7',
    price: 88900,
    image: 'https://via.placeholder.com/140x140?text=Image7',
    category: 'Kategori 1',
  },
  {
    id: 8,
    name: 'Nama Barang 8',
    price: 8013,
    image: 'https://via.placeholder.com/140x140?text=Image8',
    category: 'Kategori 2',
  },
  {
    id: 9,
    name: 'Nama Barang 9',
    price: 79307,
    image: 'https://via.placeholder.com/140x140?text=Image9',
    category: 'Kategori 1',
  },
  {
    id: 10,
    name: 'Nama Barang 10',
    price: 95016,
    image: 'https://via.placeholder.com/140x140?text=Image10',
    category: 'Kategori 2',
  },
  // Add more if needed
];

const fetchProducts = async () => {
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
  // Simulate paginated response
  const start = (page.value - 1) * pageSize;
  const end = start + pageSize;
  const newProducts = dummyProducts.slice(start, end);
  products.value.push(...newProducts);
  loading.value = false;
  showLoading.value = false;
};

const handleScroll = () => {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  if (bottom && !loading.value) {
    page.value++;
    fetchProducts();
  }
};

onMounted(() => {
  fetchProducts();
  window.addEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.dark-bg {
  background-color: #181818 !important;
  min-height: 100vh;
}
.transition-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.transition-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}
.product-card {
  background-color: #222 !important;
}
.dark-product-card {
  border: 1px solid #333 !important;
}
.v-card-title, .v-card-subtitle, .text-white {
  color: #fff !important;
}
.text-grey-lighten-2 {
  color: #bdbdbd !important;
}
.dark-input .v-input__control {
  background-color: #222 !important;
  color: #fff !important;
}
.v-btn:focus,
.v-card:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
</style>
