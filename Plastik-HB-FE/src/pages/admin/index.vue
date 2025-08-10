<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { fetchAnalytics } from "../../api/analyticApi";
import { fetchProducts } from "../../api/productApi";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

// --- Export analyticsOverview as JSON ---
const exportData = () => {
  const exportPayload = {
    overview: analyticsOverview.value,
    timeline: visitorData.value,
    products: products.value,
    productClicks: productClickData.value,
  };
  const dataStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "analytics-data.json";
  link.click();
  URL.revokeObjectURL(url);
};

// --- State ---
const loading = ref(false);
const analyticsOverview = ref({
  totalVisitors: 0,
  totalPageViews: 0,
  totalProductClicks: 0,
});
const visitorData = ref<
  { date: string; visitors: number; pageViews: number; productClicks: number }[]
>([]);
const productClickData = ref<
  { id: string; productName: string; clicks: number; lastClicked?: string }[]
>([]);
const products = ref<any[]>([]);

// --- Filters & Sorting ---
const productSearch = ref("");
const categoryFilter = ref("");
const sortBy = ref("clicks");
const sortOrder = ref("desc");

const categories = computed(() => {
  // Extract unique category names from products
  const allCategories = products.value
    .map((p) => p.category?.category)
    .filter((c) => !!c);
  // Remove duplicates, sort, and add "Semua" at the beginning
  const uniqueCategories = Array.from(new Set(allCategories)).sort();
  return ["Semua", ...uniqueCategories];
});

// --- Fetch & Map Analytics ---
const fetchAnalyticsData = async () => {
  loading.value = true;
  try {
    const data = await fetchAnalytics();
    const fetchedProducts = await fetchProducts();
    products.value = Array.isArray(fetchedProducts) ? fetchedProducts : [];

    // Overview
    analyticsOverview.value = {
      totalVisitors: data.pengunjung ?? 0,
      totalPageViews: data.pageViews ?? 0,
      totalProductClicks: data.productClicks ?? 0,
    };

    // Timeline for chart
    visitorData.value = Object.entries(data.timeline ?? {}).map(
      ([date, stats]) => {
        const s = stats as {
          pengunjung?: number;
          pageViews?: number;
          productClicks?: number;
        };
        return {
          date,
          visitors: s.pengunjung ?? 0,
          pageViews: s.pageViews ?? 0,
          productClicks: s.productClicks ?? 0,
        };
      }
    );

    // Product Clicks for table/chart
    productClickData.value = Object.entries(data.clicksPerProduct ?? {}).map(
      ([id, info]) => ({
        id,
        productName: products.value.find((p) => p.id === id)?.name ?? "Unknown",
        clicks: Number((info as { clicks?: number }).clicks ?? 0),
        lastClicked:
          (info as { lastClicked?: string }).lastClicked ?? undefined,
      })
    );
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    analyticsOverview.value = {
      totalVisitors: 0,
      totalPageViews: 0,
      totalProductClicks: 0,
    };
    visitorData.value = [];
    productClickData.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAnalyticsData);

// --- Chart Options ---
const visitorChartOptions = computed(() => ({
  title: {
    text: "Pengunjung Website",
    left: "center",
    textStyle: { fontSize: 16, fontWeight: "bold" },
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: any[]) => {
      const date = params[0].axisValue;
      const lines = params.map(
        (data) =>
          `${data.marker} ${data.seriesName}: ${data.value.toLocaleString()}`
      );
      return `${date}<br/>${lines.join("<br/>")}`;
    },
  },
  legend: {
    bottom: 10,
    data: ["Pengunjung", "Page Views", "Product Clicks"],
    textStyle: { color: "#ffffff" },
  },
  grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: visitorData.value.map((d) => d.date),
  },
  yAxis: {
    type: "value",
    axisLabel: { formatter: (value: number) => value.toLocaleString() },
  },
  series: [
    {
      name: "Pengunjung",
      type: "line",
      smooth: true,
      data: visitorData.value.map((d) => d.visitors),
      itemStyle: { color: "#1976d2" },
      areaStyle: { opacity: 0.1 },
    },
    {
      name: "Page Views",
      type: "line",
      smooth: true,
      data: visitorData.value.map((d) => d.pageViews),
      itemStyle: { color: "#388e3c" },
      areaStyle: { opacity: 0.1 },
    },
    {
      name: "Product Clicks",
      type: "line",
      smooth: true,
      data: visitorData.value.map((d) => d.productClicks),
      itemStyle: { color: "#f57c00" },
      areaStyle: { opacity: 0.1 },
    },
  ],
  dataZoom: [
    { type: "inside", start: 0, end: 100 },
    { start: 0, end: 100, height: 20, bottom: 40 },
  ],
}));

const topProductsChartOptions = computed(() => {
  // Sort and take top 10 products by clicks
  const topProducts = [...productClickData.value]
    .sort((b, a) => b.clicks - a.clicks)
    .slice(0, 10);

  const productIds = topProducts.map((p) => p.productName);
  const productClicks = topProducts.map((p) => p.clicks);

  // Generate distinct colors for each product
  const colors = [
    "#1976d2",
    "#388e3c",
    "#f57c00",
    "#d32f2f",
    "#7b1fa2",
    "#0288d1",
    "#c2185b",
    "#009688",
    "#fbc02d",
    "#512da8",
  ];

  return {
    title: {
      text: "Top Products",
      left: "center",
      textStyle: { fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        return params
          .map(
            (data) =>
              `<span style="color:${data.color}">\u25A0</span> ${
                data.name
              }: ${data.value.toLocaleString()}`
          )
          .join("<br/>");
      },
    },
    grid: { left: "10%", right: "10%", bottom: "10%", containLabel: true },
    xAxis: {
      type: "value",
      axisLabel: { formatter: (value: number) => value.toLocaleString() },
    },
    yAxis: {
      type: "category",
      data: productIds,
      axisLabel: {
        formatter: (id: string) => {
          // Optionally map product ID to name if available
          const product = products.value.find((p: any) => p.id === id);
          return product?.name ?? id;
        },
        rotate: 0,
      },
    },
    series: [
      {
        name: "Clicks",
        type: "bar",
        data: productClicks.map((clicks, idx) => ({
          value: clicks,
          itemStyle: { color: colors[idx % colors.length] },
        })),
        barWidth: 24,
        label: {
          show: true,
          position: "right",
          formatter: (params: any) => params.value.toLocaleString(),
        },
      },
    ],
  };
});

const formatNumber = (num: number) => num.toLocaleString("id-ID");

const formatDate = (date: string | null) => {
  if (!date) return "-";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};

const filteredProductData = computed(() => {
  // Map all products, merging with click data if available
  let merged = products.value.map((product) => {
    const clickInfo = productClickData.value.find((c) => c.id === product.id);
    return {
      id: product.id,
      name: product.name,
      category: product.category?.category ?? "-",
      image: product.assets?.[0]?.url ?? "",
      clicks: clickInfo?.clicks ?? 0,
      clickTrend: [], // Optionally fill with timeline data if available
      lastClicked: clickInfo?.lastClicked ?? null, // Fill if available, else null
    };
  });

  // Filter by search
  if (productSearch.value) {
    merged = merged.filter((item) =>
      item.name.toLowerCase().includes(productSearch.value.toLowerCase())
    );
  }
  // Filter by category
  if (categoryFilter.value && categoryFilter.value !== "Semua") {
    merged = merged.filter((item) => item.category === categoryFilter.value);
  }

  // Sort
  merged = merged.sort((a, b) => {
    if (sortBy.value === "clicks") {
      return sortOrder.value === "desc"
        ? b.clicks - a.clicks
        : a.clicks - b.clicks;
    }
    if (sortBy.value === "name") {
      return sortOrder.value === "desc"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    }
    if (sortBy.value === "category") {
      return sortOrder.value === "desc"
        ? b.category.localeCompare(a.category)
        : a.category.localeCompare(b.category);
    }
    return 0;
  });

  return merged;
});
</script>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'admin'
  }
}
</route>

<template>
  <v-container class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold">Analytics Dashboard</h1>
        <p class="text-body-2 text-grey-darken-1">
          Monitor website traffic dan product engagement
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn color="primary" prepend-icon="mdi-download" @click="exportData">
          Export Data
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4">Memuat data analytics...</p>
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-4 text-center" color="blue-lighten-5">
            <v-icon size="40" color="blue">mdi-account-group</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">
              {{ formatNumber(analyticsOverview.totalVisitors) }}
            </h3>
            <p class="text-body-2 text-grey-darken-1">Total Pengunjung</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-4 text-center" color="green-lighten-5">
            <v-icon size="40" color="green">mdi-eye</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">
              {{ formatNumber(analyticsOverview.totalPageViews) }}
            </h3>
            <p class="text-body-2 text-grey-darken-1">Page Views</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-4 text-center" color="orange-lighten-5">
            <v-icon size="40" color="orange">mdi-mouse</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">
              {{ formatNumber(analyticsOverview.totalProductClicks) }}
            </h3>
            <p class="text-body-2 text-grey-darken-1">Product Clicks</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mb-6">
        <!-- Visitor Chart -->
        <v-col cols="12" lg="8">
          <v-card class="pa-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Website Traffic Analytics
            </v-card-title>
            <v-card-text>
              <v-chart
                :option="visitorChartOptions"
                :autoresize="true"
                style="height: 400px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Top Products Chart -->
        <v-col cols="12" lg="4">
          <v-card class="pa-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-chart-bar</v-icon>
              Top Products
            </v-card-title>
            <v-card-text>
              <v-chart
                :option="topProductsChartOptions"
                :autoresize="true"
                style="height: 400px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Product Click Analytics -->

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-mouse</v-icon>
              Product Click Analytics
            </v-card-title>

            <!-- Filters -->
            <v-card-text class="pb-0">
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="productSearch"
                    label="Cari produk..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="categoryFilter"
                    :items="categories"
                    label="Filter Kategori"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="sortBy"
                    :items="[
                      { title: 'Jumlah Klik', value: 'clicks' },
                      { title: 'Nama Produk', value: 'name' },
                      { title: 'Kategori', value: 'category' },
                    ]"
                    label="Urutkan berdasarkan"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn-toggle v-model="sortOrder" mandatory density="compact">
                    <v-btn value="desc" icon="mdi-sort-descending" />
                    <v-btn value="asc" icon="mdi-sort-ascending" />
                  </v-btn-toggle>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Product List -->
            <v-card-text>
              <v-data-table
                :headers="[
                  { title: 'Produk', key: 'name', sortable: false },
                  { title: 'Kategori', key: 'category' },
                  { title: 'Total Klik', key: 'clicks', align: 'center' },
                  {
                    title: 'Terakhir Diklik',
                    key: 'lastClicked',
                    align: 'center',
                  },
                ]"
                :items="filteredProductData"
                :items-per-page="10"
                class="elevation-0"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="40" class="mr-3">
                      <v-img v-if="item.image" :src="item.image" />
                      <v-icon v-else color="primary"
                        >mdi-package-variant</v-icon
                      >
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-grey-darken-1">
                        ID: {{ item.id }}
                      </div>
                    </div>
                  </div>
                </template>

                <template #item.category="{ item }">
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ item.category }}
                  </v-chip>
                </template>

                <template #item.clicks="{ item }">
                  <div class="text-center">
                    <div class="font-weight-bold text-h6">
                      {{ formatNumber(item.clicks) }}
                    </div>
                  </div>
                </template>

                <template #item.trend="{ item }">
                  <div class="text-center">
                    <v-sparkline
                      :value="item.clickTrend"
                      color="primary"
                      line-width="2"
                      padding="4"
                      smooth="10"
                      width="60"
                      height="20"
                    />
                  </div>
                </template>

                <template #item.lastClicked="{ item }">
                  <div class="text-center">
                    <div class="text-body-2">
                      {{ formatDate(item.lastClicked) }}
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{
                        item.lastClicked
                          ? Math.floor(
                              (Date.now() -
                                new Date(item.lastClicked).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) + " hari lalu"
                          : "-"
                      }}
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
