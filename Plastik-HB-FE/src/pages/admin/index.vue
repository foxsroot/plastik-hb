<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

// Interfaces
interface VisitorData {
  date: string
  visitors: number
  pageViews: number
  uniqueVisitors: number
}

interface ProductClickData {
  id: number
  name: string
  clicks: number
  category: string
  image: string
  clickTrend: number[] // last 7 days
  lastClicked: string
}

interface AnalyticsOverview {
  totalVisitors: number
  totalPageViews: number
  totalProductClicks: number
  avgSessionDuration: string
  bounceRate: number
  topReferrer: string
}

// State
const loading = ref(false)
const dateRange = ref<string[]>(['2024-01-01', '2024-01-31'])
const selectedMetric = ref<'visitors' | 'pageViews' | 'uniqueVisitors'>('visitors')

// Data
const analyticsOverview = ref<AnalyticsOverview>({
  totalVisitors: 0,
  totalPageViews: 0,
  totalProductClicks: 0,
  avgSessionDuration: '0:00',
  bounceRate: 0,
  topReferrer: ''
})

const visitorData = ref<VisitorData[]>([])
const productClickData = ref<ProductClickData[]>([])

// Search and filters
const productSearch = ref('')
const categoryFilter = ref('all')
const sortBy = ref<'clicks' | 'name' | 'category'>('clicks')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed
const categories = computed(() => {
  const cats = [...new Set(productClickData.value.map(p => p.category))]
  return ['all', ...cats]
})

const filteredProductData = computed(() => {
  let filtered = productClickData.value

  // Filter by search
  if (productSearch.value) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(productSearch.value.toLowerCase())
    )
  }

  // Filter by category
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(p => p.category === categoryFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'clicks':
        comparison = a.clicks - b.clicks
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return filtered
})

// Chart options
const visitorChartOptions = computed(() => ({
  title: {
    text: 'Pengunjung Website',
    left: 'center',
    textStyle: { fontSize: 16, fontWeight: 'bold' }
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const data = params[0]
      return `${data.axisValue}<br/>
              ${data.marker} ${data.seriesName}: ${data.value.toLocaleString()}`
    }
  },
  legend: {
    bottom: 10,
    data: ['Pengunjung', 'Page Views', 'Unique Visitors']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: visitorData.value.map(d => d.date)
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => value.toLocaleString()
    }
  },
  series: [
    {
      name: 'Pengunjung',
      type: 'line',
      smooth: true,
      data: visitorData.value.map(d => d.visitors),
      itemStyle: { color: '#1976d2' },
      areaStyle: { opacity: 0.1 }
    },
    {
      name: 'Page Views',
      type: 'line',
      smooth: true,
      data: visitorData.value.map(d => d.pageViews),
      itemStyle: { color: '#388e3c' },
      areaStyle: { opacity: 0.1 }
    },
    {
      name: 'Unique Visitors',
      type: 'line',
      smooth: true,
      data: visitorData.value.map(d => d.uniqueVisitors),
      itemStyle: { color: '#f57c00' },
      areaStyle: { opacity: 0.1 }
    }
  ],
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      start: 0,
      end: 100,
      height: 20,
      bottom: 40
    }
  ]
}))

const topProductsChartOptions = computed(() => {
  const top10Products = filteredProductData.value.slice(0, 10)
  
  return {
    title: {
      text: 'Top 10 Produk Paling Diklik',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => value.toLocaleString()
      }
    },
    yAxis: {
      type: 'category',
      data: top10Products.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name).reverse()
    },
    series: [{
      type: 'bar',
      data: top10Products.map(p => p.clicks).reverse(),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9']
          return colors[params.dataIndex % colors.length]
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }]
  }
})

// Functions
const fetchAnalyticsData = async () => {
  loading.value = true
  try {
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data
    analyticsOverview.value = {
      totalVisitors: 12847,
      totalPageViews: 45632,
      totalProductClicks: 8934,
      avgSessionDuration: '3:42',
      bounceRate: 34.2,
      topReferrer: 'Google'
    }

    // Generate mock visitor data
    const today = new Date()
    const mockVisitorData: VisitorData[] = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      mockVisitorData.push({
        date: date.toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 1500) + 800,
        uniqueVisitors: Math.floor(Math.random() * 300) + 150
      })
    }
    visitorData.value = mockVisitorData

    // Generate mock product click data
    const mockProducts = [
      'Kantong Plastik HD Premium',
      'Wadah Makanan Food Grade',
      'Botol Plastik 500ml',
      'Ember Plastik Multi Fungsi',
      'Gelas Plastik Set 12pcs',
      'Kotak Penyimpanan 10L',
      'Piring Plastik Melamin',
      'Tempat Sampah 50L',
      'Sedotan Plastik Biodegradable',
      'Keranjang Plastik Anyam',
      'Sendok Plastik Disposable',
      'Tutup Botol Plastik',
      'Kemasan Plastik Vacuum',
      'Kantong Sampah Besar',
      'Wadah Es Krim Plastik'
    ]

    const categories = ['Kantong Plastik', 'Wadah Makanan', 'Botol', 'Alat Rumah Tangga', 'Peralatan Makan', 'Penyimpanan', 'Kebersihan']

    productClickData.value = mockProducts.map((name, index) => ({
      id: index + 1,
      name,
      clicks: Math.floor(Math.random() * 1000) + 50,
      category: categories[Math.floor(Math.random() * categories.length)],
      image: '',
      clickTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10),
      lastClicked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))

  } catch (error) {
    console.error('Error fetching analytics data:', error)
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  console.log('Exporting analytics data...')
  // Implement export functionality
}

const formatNumber = (num: number) => {
  return num.toLocaleString('id-ID')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID')
}

onMounted(() => {
  fetchAnalyticsData()
})
</script>

<route>
{
  meta: {
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
        <p class="text-body-2 text-grey-darken-1">Monitor website traffic dan product engagement</p>
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
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4 text-center" color="blue-lighten-5">
            <v-icon size="40" color="blue">mdi-account-group</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">{{ formatNumber(analyticsOverview.totalVisitors) }}</h3>
            <p class="text-body-2 text-grey-darken-1">Total Pengunjung</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4 text-center" color="green-lighten-5">
            <v-icon size="40" color="green">mdi-eye</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">{{ formatNumber(analyticsOverview.totalPageViews) }}</h3>
            <p class="text-body-2 text-grey-darken-1">Page Views</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4 text-center" color="orange-lighten-5">
            <v-icon size="40" color="orange">mdi-mouse</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">{{ formatNumber(analyticsOverview.totalProductClicks) }}</h3>
            <p class="text-body-2 text-grey-darken-1">Product Clicks</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4 text-center" color="purple-lighten-5">
            <v-icon size="40" color="purple">mdi-clock</v-icon>
            <h3 class="text-h5 font-weight-bold mt-2">{{ analyticsOverview.avgSessionDuration }}</h3>
            <p class="text-body-2 text-grey-darken-1">Avg. Session</p>
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
                style="height: 400px;"
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
                style="height: 400px;"
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
                      { title: 'Kategori', value: 'category' }
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
                  { title: 'Trend 7 Hari', key: 'trend', sortable: false, align: 'center' },
                  { title: 'Terakhir Diklik', key: 'lastClicked', align: 'center' }
                ]"
                :items="filteredProductData"
                :items-per-page="10"
                class="elevation-0"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="40" class="mr-3">
                      <v-img v-if="item.image" :src="item.image" />
                      <v-icon v-else color="primary">mdi-package-variant</v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-grey-darken-1">ID: {{ item.id }}</div>
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
                    <div class="font-weight-bold text-h6">{{ formatNumber(item.clicks) }}</div>
                    <v-icon 
                      :color="item.clicks > 500 ? 'success' : item.clicks > 200 ? 'warning' : 'error'" 
                      size="small"
                    >
                      {{ item.clicks > 500 ? 'mdi-trending-up' : item.clicks > 200 ? 'mdi-trending-neutral' : 'mdi-trending-down' }}
                    </v-icon>
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
                    <div class="text-body-2">{{ formatDate(item.lastClicked) }}</div>
                    <div class="text-caption text-grey-darken-1">
                      {{ Math.floor((Date.now() - new Date(item.lastClicked).getTime()) / (1000 * 60 * 60 * 24)) }} hari lalu
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
