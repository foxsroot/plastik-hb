<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import index from "../index.vue";
import { getPage, updateHomepage } from "../../api/pageApi";
import { fetchFeaturedProducts, fetchProducts } from "../../api/productApi";
import { updateFeaturedProducts } from "../../api/updateFeaturedProducts";
import { uploadImage } from "../../api/uploadApi";

// Image Backend URL
const imageBackendUrl = "http://localhost:5000";

// Banner Interface
interface Banner {
  order: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

// Achievement Interface
interface Achievement {
  order: number;
  title: string;
  percentage: number;
  description: string;
  image?: string;
}

// Asset Interface
interface Asset {
  id: string;
  url: string;
  alt: string;
  type: "IMAGE" | "VIDEO";
  created_at: string;
  updated_at: string;
  product_id: string;
}

// Category Interface
interface CategoryObj {
  id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Featured Product Interface
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  specification: string;
  category_id: string;
  discount?: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  assets: Asset[];
  category: CategoryObj;
}

interface TrustedByPartner {
  order: number;
  title: string;
  image: string;
}

// Page Data Interface
interface PageData {
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: Array<{
    type: string;
    order: number;
    visible: boolean;
    data: {
      banners?: Banner[];
      achievements?: Achievement[];
      partners?: TrustedByPartner[];
    };
  }>;
}

// Alert state
const alertVisible = ref(false);
const alertType = ref<"success" | "error">("success");
const alertTitle = ref("");
const alertMessage = ref("");

// Form state
const loading = ref(false);
const saveLoading = ref(false);
const catalogLoading = ref(false);

// All products from catalog
const catalogProducts = ref<Product[]>([]);
const pageData = ref<PageData | null>(null);
const errorMessage = ref("");

async function fetchAllProducts() {
  try {
    if (Array.isArray(await fetchProducts())) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value =
        (response as any).data || (response as any).products || [];
    }
  } catch (error: any) {
    showAlert("error", "Gagal", error);
  }
}

// Product selection dialog
const productSelectionDialog = ref(false);
const selectedProductIdsDialog = ref<string[]>([]);
// Single product selection (for addSelectedProduct, legacy support)
const selectedProductId = ref<string | null>(null);

// File input refs
const bannerFileInputRefs = ref<(HTMLInputElement | null)[]>([])
const achievementFileInputRefs = ref<(HTMLInputElement | null)[]>([])
const trustedByFileInputRefs = ref<(HTMLInputElement | null)[]>([])

// Computed properties
const selectedProductIds = computed(() =>
  featuredProducts.value.map((p) => p.id),
);

const availableProducts = computed(() =>
  catalogProducts.value.filter(
    (product) => !selectedProductIds.value.includes(product.id),
  ),
);

// Product search for selection dialog
const productSearch = ref("");
const filteredAvailableProducts = computed(() => {
  if (!productSearch.value) return availableProducts.value;
  return availableProducts.value.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
      product.description
        ?.toLowerCase()
        .includes(productSearch.value.toLowerCase()),
  );
});

// Remove featuredProducts computed and instead fetch featured products from API
const featuredProducts = ref<Product[]>([]);

async function fetchFeatured() {
  try {
    const response = await fetchFeaturedProducts();
    featuredProducts.value = Array.isArray(response)
      ? response
      : (response as any).data || [];
  } catch (error: any) {
    errorMessage.value = error;
  }
}

// Alert functions
const showAlert = (
  type: "success" | "error",
  title: string,
  message: string,
) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;

  setTimeout(() => {
    alertVisible.value = false;
  }, 5000);
};

// --- Banner State as Ref ---
const banners = ref<Banner[]>([]);

// Sync banners with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    // Accept both BANNER and BANNERS for section type
    const arr = val?.sections.find(
      (s) => s.type === "BANNERS" || s.type === "BANNER",
    )?.data.banners;
    banners.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
    // Always show at least one banner form
    if (banners.value.length === 0) {
      banners.value.push({
        order: 1,
        image: "",
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
      });
    }
  },
  { immediate: true },
);

// Automatically sync banners to pageData.sections[0] when they change
watch(
  banners,
  (newBanners) => {
    if (
      pageData.value &&
      pageData.value.sections &&
      pageData.value.sections[0] &&
      pageData.value.sections[0].data
    ) {
      pageData.value.sections[0].data.banners = JSON.parse(
        JSON.stringify(newBanners),
      );
    }
  },
  { deep: true },
);

// Update pageData banners before save
const syncBannersToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find((s) => s.type === "BANNERS");
    if (section)
      section.data.banners = JSON.parse(JSON.stringify(banners.value));
  }
};

// Banner functions (keeping existing banner functions)
const addBanner = () => {
  banners.value.push({
    order: banners.value.length + 1,
    image: "",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });
};

const removeBanner = (index: number) => {
  if (banners.value.length > 1) {
    banners.value.splice(index, 1);
  }
};

const handleBannerImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      banners.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const openBannerFileInput = (index: number) => {
  bannerFileInputRefs.value[index]?.click();
};

// --- Achievements State as Ref ---
const achievements = ref<Achievement[]>([]);

// Sync achievements with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    const arr = val?.sections.find((s) => s.type === "ACHIEVEMENTS")?.data
      .achievements;
    achievements.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
  },
  { immediate: true },
);

// Automatically sync banners and achievements to pageData.sections when they change
watch(
  achievements,
  (newAchievements) => {
    if (
      pageData.value &&
      pageData.value.sections &&
      pageData.value.sections[1] &&
      pageData.value.sections[1].data
    ) {
      pageData.value.sections[1].data.achievements = JSON.parse(
        JSON.stringify(newAchievements),
      );
    }
  },
  { deep: true },
);

// Update pageData achievements before save
const syncAchievementsToPageData = () => {
  if (pageData.value) {
    const section = pageData.value.sections.find(
      (s) => s.type === "ACHIEVEMENTS",
    );
    if (section)
      section.data.achievements = JSON.parse(
        JSON.stringify(achievements.value),
      );
  }
};

// Update add/remove/clear/upload to use achievements ref
const addAchievement = () => {
  achievements.value.push({
    order: achievements.value.length + 1,
    title: "",
    percentage: 0,
    description: "",
    image: "",
  });
};
const removeAchievement = (index: number) => {
  if (achievements.value.length > 1) achievements.value.splice(index, 1);
};
const handleAchievementImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      achievements.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};
const openAchievementFileInput = (index: number) => {
  achievementFileInputRefs.value[index]?.click();
};

// --- Trusted By State as Ref ---
const trustedByPartners = ref<{ order: number; title: string; image: string }[]>([]);

// Sync trustedByPartners with pageData on fetch
watch(
  () => pageData.value,
  (val) => {
    const arr = val?.sections.find(s => s.type === "TRUSTEDBY")?.data.partners;
    trustedByPartners.value = arr ? JSON.parse(JSON.stringify(arr)) : [];
  },
  { immediate: true }
);

// Automatically sync trustedByPartners to pageData.sections when they change
watch(trustedByPartners, (newPartners) => {
  if (pageData.value) {
    const section = pageData.value.sections.find(s => s.type === "TRUSTEDBY");
    if (section) section.data.partners = JSON.parse(JSON.stringify(newPartners));
  }
}, { deep: true });

// Trusted By Editor functions
const addTrustedByPartner = () => {
  trustedByPartners.value.push({
    order: trustedByPartners.value.length + 1,
    title: '',
    image: ''
  });
};
const removeTrustedByPartner = (index: number) => {
  if (trustedByPartners.value.length > 1) trustedByPartners.value.splice(index, 1);
};
const handleTrustedByImageUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      trustedByPartners.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};
const openTrustedByFileInput = (index: number) => {
  trustedByFileInputRefs.value[index]?.click();
};
const clearTrustedByImage = (index: number) => {
  trustedByPartners.value[index].image = '';
};
// Drag and drop for Trusted By
const dragTrustedByIndex = ref<number | null>(null);
const dragOverTrustedByIndex = ref<number | null>(null);
const onTrustedByDragStart = (index: number) => {
  dragTrustedByIndex.value = index;
};
const onTrustedByDragOver = (index: number) => {
  dragOverTrustedByIndex.value = index;
};
const onTrustedByDrop = (index: number) => {
  if (dragTrustedByIndex.value !== null && dragTrustedByIndex.value !== index) {
    const moved = trustedByPartners.value.splice(dragTrustedByIndex.value, 1)[0];
    trustedByPartners.value.splice(index, 0, moved);
  }
  dragTrustedByIndex.value = null;
  dragOverTrustedByIndex.value = null;
};
const onTrustedByDragEnd = () => {
  dragTrustedByIndex.value = null;
  dragOverTrustedByIndex.value = null;
};

// Fetch catalog products
const fetchCatalogProducts = async () => {
  catalogLoading.value = true;
  try {
    if (Array.isArray(await fetchProducts())) {
      catalogProducts.value = (await fetchProducts()) as Product[];
    } else {
      const response = await fetchProducts();
      catalogProducts.value =
        (response as any).data || (response as any).products || [];
    }
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    // Optionally show an alert or handle error
  } finally {
    catalogLoading.value = false;
  }
};

// Fetch homepage data
const fetchPageData = async () => {
  loading.value = true;
  try {
    const response = await getPage("homepage");
    // Handle both direct data and wrapped response
    pageData.value = response as PageData;

    if (!pageData.value) {
      throw new Error("No page data received from server");
    }

    console.log("Page data loaded successfully:", pageData.value);
  } catch (error: any) {
    console.error("Failed to fetch page data:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load page data.";
    showAlert("error", "Gagal", "Gagal memuat data halaman utama");
  } finally {
    loading.value = false;
  }
};

// Save homepage data
const saveHomepageData = async () => {
  saveLoading.value = true;
  try {
    // Validate pageData exists
    if (!pageData.value) {
      throw new Error("No page data to save");
    }

    // Validate required fields
    if (!pageData.value.title || !pageData.value.sections) {
      throw new Error("Missing required fields: title and sections");
    }

    // Sync banners and achievements to pageData before saving
    syncBannersToPageData();
    syncAchievementsToPageData();

    console.log("Saving homepage data:", pageData.value);

    // Save featured products
    await updateFeaturedProducts(featuredProducts.value.map((p) => p.id));

    // Save homepage content
    const response = await updateHomepage({
      title: pageData.value.title,
      description: pageData.value.description,
      published: pageData.value.published,
      sections: pageData.value.sections,
    });
    
    showAlert(
      "success",
      "Berhasil",
      "Data halaman utama & produk andalan berhasil disimpan!",
    );

    // Refresh only the live preview after successful save
    setTimeout(() => {
      refreshPreview();
    }, 1000);
  } catch (error: any) {
    console.error("Error saving homepage data:", error);
    showAlert(
      "error",
      "Gagal",
      error?.message || "Gagal menyimpan data halaman utama",
    );
  } finally {
    saveLoading.value = false;
  }
};

// Preview state
const previewKey = ref(0);
const previewTimestamp = ref(Date.now());

// Preview functions
const refreshPreview = () => {
  previewKey.value += 1;
  previewTimestamp.value = Date.now();
};

const openHomepage = () => {
  window.open("/", "_blank");
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Featured Products Section (NEW)
const removeFeaturedProduct = (index: number) => {
  if (featuredProducts.value.length > 0) {
    featuredProducts.value.splice(index, 1);
  }
};

// Add product to featuredProducts
const addSelectedProduct = () => {
  if (selectedProductId.value) {
    const product = catalogProducts.value.find(
      (p) => p.id === selectedProductId.value,
    );
    if (product && !featuredProducts.value.some((fp) => fp.id === product.id)) {
      featuredProducts.value.push(product);
      selectedProductId.value = null;
      productSelectionDialog.value = false;
    }
  }
};

// Update addSelectedProduct for bulk add
const addSelectedProducts = () => {
  const newProducts = catalogProducts.value.filter(
    (p) =>
      selectedProductIdsDialog.value.includes(p.id) &&
      !featuredProducts.value.some((fp) => fp.id === p.id),
  );
  featuredProducts.value.push(...newProducts);
  selectedProductIdsDialog.value = [];
  productSelectionDialog.value = false;
};

// Drag and drop states for banners
const dragOverBannerIndex = ref<number | null>(null);
const hoveredBannerIndex = ref<number | null>(null);

const onBannerDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverBannerIndex.value = index;
};

const onBannerDragLeave = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (dragOverBannerIndex.value === index) {
    dragOverBannerIndex.value = null;
  }
};

const onBannerDrop = (event: DragEvent, index: number) => {
  event.preventDefault();
  dragOverBannerIndex.value = null;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      banners.value[index].image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Clear banner image
const clearBannerImage = (index: number) => {
  banners.value[index].image = "";
};

// --- Banner Editor Modal State ---
const bannerEditorDialog = ref(false);
const editingBannerIndex = ref<number | null>(null);
const editingBanner = ref<Banner | null>(null);
const bannerEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Banner Card Menu State ---
const bannerMenuOpenIndex = ref<number | null>(null);

// --- Banner Drag State (for new editor) ---
const dragBannerIndex = ref<number | null>(null);
const dragOverBannerEditorIndex = ref<number | null>(null);

// --- Banner Editor Functions ---
const openBannerMenu = (index: number) => {
  bannerMenuOpenIndex.value = index;
};
const closeBannerMenu = () => {
  bannerMenuOpenIndex.value = null;
};
const openBannerEditor = (index: number) => {
  editingBannerIndex.value = index;
  editingBanner.value = { ...banners.value[index] };
  bannerEditorDialog.value = true;
  closeBannerMenu();
};
const closeBannerEditor = () => {
  bannerEditorDialog.value = false;
  editingBannerIndex.value = null;
  editingBanner.value = null;
};
const saveBannerEdit = () => {
  if (editingBannerIndex.value !== null && editingBanner.value) {
    banners.value[editingBannerIndex.value] = { ...editingBanner.value };
    closeBannerEditor();
  }
};
// Banner Editor image upload
const handleBannerEditorImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && editingBanner.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingBanner.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar banner");
    }
  }
};
const openBannerEditorFileInput = () => {
  bannerEditorFileInputRef.value?.click();
};
const clearBannerEditorImage = () => {
  if (editingBanner.value) editingBanner.value.image = "";
};
const deleteBannerFromMenu = (index: number) => {
  if (banners.value.length > 1) banners.value.splice(index, 1);
  closeBannerMenu();
};
// Drag-and-drop for new editor
const onBannerEditorDragStart = (index: number) => {
  dragBannerIndex.value = index;
};
const onBannerEditorDragOver = (index: number) => {
  dragOverBannerEditorIndex.value = index;
};
const onBannerEditorDrop = (index: number) => {
  if (dragBannerIndex.value !== null && dragBannerIndex.value !== index) {
    const moved = banners.value.splice(dragBannerIndex.value, 1)[0];
    banners.value.splice(index, 0, moved);
  }
  dragBannerIndex.value = null;
  dragOverBannerEditorIndex.value = null;
};
const onBannerEditorDragEnd = () => {
  dragBannerIndex.value = null;
  dragOverBannerEditorIndex.value = null;
};

// --- Achievement Drag State ---
const dragAchievementIndex = ref<number | null>(null);
const dragOverAchievementIndex = ref<number | null>(null);

const onAchievementDragStart = (index: number) => {
  dragAchievementIndex.value = index;
};
const onAchievementDragOver = (index: number) => {
  dragOverAchievementIndex.value = index;
};
const onAchievementDrop = (index: number) => {
  if (
    dragAchievementIndex.value !== null &&
    dragAchievementIndex.value !== index
  ) {
    const moved = achievements.value.splice(dragAchievementIndex.value, 1)[0];
    achievements.value.splice(index, 0, moved);
  }
  dragAchievementIndex.value = null;
  dragOverAchievementIndex.value = null;
};
const onAchievementDragEnd = () => {
  dragAchievementIndex.value = null;
  dragOverAchievementIndex.value = null;
};

// --- Achievement Card Menu & Editor State ---
const achievementMenuOpenIndex = ref<number | null>(null);
const achievementEditorDialog = ref(false);
const editingAchievementIndex = ref<number | null>(null);
const editingAchievement = ref<Achievement | null>(null);
const achievementEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Achievement Card Menu Functions ---
const openAchievementMenu = (index: number) => {
  achievementMenuOpenIndex.value = index;
};
const closeAchievementMenu = () => {
  achievementMenuOpenIndex.value = null;
};

// --- Achievement Editor Functions ---
const openAchievementEditor = (index: number) => {
  editingAchievementIndex.value = index;
  editingAchievement.value = { ...achievements.value[index] };
  achievementEditorDialog.value = true;
  closeAchievementMenu();
};
const closeAchievementEditor = () => {
  achievementEditorDialog.value = false;
  editingAchievementIndex.value = null;
  editingAchievement.value = null;
};
const saveAchievementEdit = () => {
  if (editingAchievementIndex.value !== null && editingAchievement.value) {
    achievements.value[editingAchievementIndex.value] = {
      ...editingAchievement.value,
    };
    closeAchievementEditor();
  }
};
// Achievement Editor image upload
const handleAchievementEditorImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && editingAchievement.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingAchievement.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar achievement");
    }
  }
};
const openAchievementEditorFileInput = () => {
  achievementEditorFileInputRef.value?.click();
};
const clearAchievementEditorImage = () => {
  if (editingAchievement.value) editingAchievement.value.image = "";
};
const deleteAchievementFromMenu = (index: number) => {
  if (achievements.value.length > 1) achievements.value.splice(index, 1);
  closeAchievementMenu();
};

// Toggle product selection in the dialog
const toggleProductSelection = (productId: string) => {
  const idx = selectedProductIdsDialog.value.indexOf(productId);
  if (idx === -1) {
    selectedProductIdsDialog.value.push(productId);
  } else {
    selectedProductIdsDialog.value.splice(idx, 1);
  }
};

// Banner Editor: Drag & Drop Image Upload
const handleBannerEditorImageDrop = async (event: DragEvent) => {
  event.preventDefault();
  if (!editingBanner.value) return;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    try {
      const imageUrl = await uploadImage(file);
      editingBanner.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar banner");
    }
  }
};

// Achievement Editor: Drag & Drop Image Upload
const handleAchievementEditorImageDrop = async (event: DragEvent) => {
  event.preventDefault();
  if (!editingAchievement.value) return;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    try {
      const imageUrl = await uploadImage(file);
      editingAchievement.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert("error", "Upload Gagal", "Gagal mengupload gambar achievement");
    }
  }
};

// --- Trusted By Editor Modal State ---
const trustedByMenuOpenIndex = ref<number | null>(null);
const trustedByEditorDialog = ref(false);
const editingTrustedByIndex = ref<number | null>(null);
const editingTrustedBy = ref<TrustedByPartner | null>(null);
const trustedByEditorFileInputRef = ref<HTMLInputElement | null>(null);

// --- Achievement Card Menu Functions ---
const openTrustedByMenu = (index: number) => {
  trustedByMenuOpenIndex.value = index;
};
const closeTrustedByMenu = () => {
  trustedByMenuOpenIndex.value = null;
};

const openTrustedByEditor = (index: number) => {
  editingTrustedByIndex.value = index;
  editingTrustedBy.value = { ...trustedByPartners.value[index] };
  trustedByEditorDialog.value = true;
  closeTrustedByMenu();
};
const closeTrustedByEditor = () => {
  trustedByEditorDialog.value = false;
  editingTrustedByIndex.value = null;
  editingTrustedBy.value = null;
};
const saveTrustedByEdit = () => {
  if (editingTrustedByIndex.value !== null && editingTrustedBy.value) {
    trustedByPartners.value[editingTrustedByIndex.value] = { ...editingTrustedBy.value };
    closeTrustedByEditor();
  }
};
const openTrustedByEditorFileInput = () => {
  trustedByEditorFileInputRef.value?.click();
};
const handleTrustedByEditorImageDrop = async (event: DragEvent) => {
  event.preventDefault();
  if (!editingTrustedBy.value) return;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    try {
      const imageUrl = await uploadImage(file);
      editingTrustedBy.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert('error', 'Upload Gagal', 'Gagal mengupload logo partner');
    }
  }
};
const handleTrustedByEditorImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && editingTrustedBy.value) {
    try {
      const imageUrl = await uploadImage(file);
      editingTrustedBy.value.image = imageBackendUrl + imageUrl;
    } catch (err) {
      showAlert('error', 'Upload Gagal', 'Gagal mengupload logo partner');
    }
  }
};
const clearTrustedByEditorImage = () => {
  if (editingTrustedBy.value) editingTrustedBy.value.image = '';
};

onMounted(async () => {
  await fetchPageData();
  await fetchAllProducts();
  await fetchFeatured();
  await fetchCatalogProducts();
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
    <!-- Alert -->
    <v-alert
      v-model="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :text="alertMessage"
      closable
      class="mb-4"
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      "
    />

    <!-- Product Selection Dialog -->
    <v-dialog v-model="productSelectionDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          Pilih Produk untuk Featured
        </v-card-title>

        <v-card-text class="pa-0">
          <v-container class="pa-4">
            <v-text-field
              v-model="productSearch"
              label="Cari Produk"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-row v-if="catalogLoading" class="justify-center">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Memuat katalog produk...</p>
              </v-col>
            </v-row>

            <v-row
              v-else-if="filteredAvailableProducts.length === 0"
              class="justify-center"
            >
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey-lighten-1"
                  >mdi-package-variant-closed</v-icon
                >
                <p class="text-grey-darken-1 mt-2">
                  Tidak ada produk yang tersedia untuk dipilih
                </p>
              </v-col>
            </v-row>

            <v-row v-else>
              <v-col
                v-for="product in filteredAvailableProducts"
                :key="product.id"
                cols="12"
                md="6"
              >
                <v-card
                  variant="outlined"
                  :class="[
                    'product-select-card',
                    {
                      'v-card--selected': selectedProductIdsDialog.includes(
                        product.id,
                      ),
                    },
                  ]"
                  @click="toggleProductSelection(product.id)"
                  class="cursor-pointer product-select-card"
                >
                  <v-row no-gutters>
                    <v-col cols="1" class="d-flex align-center justify-center">
                      <v-checkbox
                        :model-value="
                          selectedProductIdsDialog.includes(product.id)
                        "
                        @update:model-value="toggleProductSelection(product.id)"
                        hide-details
                        density="compact"
                        color="primary"
                        class="ma-0 pa-0"
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-img
                        :src="product.assets[0]?.url || '/placeholder.jpg'"
                        height="100"
                        cover
                      >
                        <template v-slot:placeholder>
                          <div
                            class="d-flex align-center justify-center fill-height"
                          >
                            <v-icon size="40" color="grey-lighten-1"
                              >mdi-package-variant</v-icon
                            >
                          </div>
                        </template>
                      </v-img>
                    </v-col>
                    <v-col cols="8">
                      <v-card-text class="pa-3">
                        <h4 class="text-subtitle-2 mb-1">{{ product.name }}</h4>
                        <p class="text-caption text-grey-darken-1 mb-2">
                          {{ product.description }}
                        </p>
                        <div class="d-flex align-center justify-space-between">
                          <span
                            v-if="product.discount && product.discount > 0"
                            class="text-subtitle-2 font-weight-bold text-grey-darken-1 mr-2"
                            style="text-decoration: line-through"
                          >
                            {{ formatPrice(product.price) }}
                          </span>
                          <span
                            v-if="product.discount && product.discount > 0"
                            class="text-subtitle-2 font-weight-bold text-primary"
                          >
                            {{
                              formatPrice(
                                product.price -
                                  (product.price * product.discount) / 100,
                              )
                            }}
                          </span>
                          <span
                            v-else
                            class="text-subtitle-2 font-weight-bold text-primary"
                          >
                            {{ formatPrice(product.price) }}
                          </span>
                        </div>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-overlay
                    v-if="selectedProductIdsDialog.includes(product.id)"
                    contained
                    class="d-flex align-center justify-center"
                    opacity="0.1"
                  >
                    <v-icon size="48" color="primary">mdi-check-circle</v-icon>
                  </v-overlay>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            :disabled="selectedProductIdsDialog.length === 0"
            color="primary"
            variant="elevated"
            @click="addSelectedProducts"
          >
            Tambahkan
          </v-btn>
          <v-btn @click="productSelectionDialog = false" variant="outlined">
            Batal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Halaman Utama</h1>
        <p class="text-body-2 text-grey-darken-1">
          Kelola konten halaman utama website dan lihat preview
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4">Memuat data halaman utama...</p>
    </div>

    <!-- Main Content -->
    <v-row v-else>
      <!-- Left Side - Form -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Editor Konten
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveHomepageData">
              <!-- Banner Section (replace old with new editor, styled like Achievement) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Banner Carousel</h3>
                  <v-btn
                    @click="addBanner"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                <div class="banner-list">
                  <div
                    v-for="(banner, index) in banners"
                    :key="'editor-form-' + index"
                    class="mb-3"
                  >
                    <v-card
                      class="d-flex align-center pa-2 mb-2 banner-card"
                      variant="outlined"
                      draggable="true"
                      @dragstart="onBannerEditorDragStart(index)"
                      @dragover.prevent="onBannerEditorDragOver(index)"
                      @drop.prevent="onBannerEditorDrop(index)"
                      @dragend="onBannerEditorDragEnd"
                      :class="{
                        'banner-card--dragover':
                          dragOverBannerEditorIndex === index,
                      }"
                      style="
                        transition:
                          background 0.2s,
                          border 0.2s;
                      "
                    >
                      <v-btn
                        icon="mdi-drag"
                        variant="text"
                        size="small"
                        class="mr-2 drag-btn"
                        style="
                          cursor: grab;
                          color: var(--v-theme-on-surface, #888);
                        "
                      />
                      <v-avatar size="40" class="mr-3">
                        <v-img
                          :src="banner.image || '/placeholder.jpg'"
                          cover
                        />
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-white text-truncate">
                          {{ banner.title || "Judul Banner " + (index + 1) }}
                        </div>
                        <div
                          class="text-caption text-grey-lighten-1 text-truncate"
                        >
                          {{ banner.subtitle }}
                        </div>
                      </div>
                      <v-menu
                        :model-value="bannerMenuOpenIndex === index"
                        @update:model-value="
                          (val) => (bannerMenuOpenIndex = val ? index : null)
                        "
                        :close-on-content-click="false"
                        location="bottom right"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="small"
                            v-bind="props"
                            @click.stop="openBannerMenu(index)"
                            class="menu-btn"
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="openBannerEditor(index)">
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteBannerFromMenu(index)">
                            <v-list-item-title class="text-error"
                              >Delete</v-list-item-title
                            >
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Achievement Section (styled like Banner Promosi, now draggable) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Achievement</h3>
                  <v-btn
                    @click="addAchievement"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                  />
                </div>
                <div class="achievement-list">
                  <div
                    v-for="(achievement, index) in achievements"
                    :key="achievement.order ?? index"
                    class="mb-3"
                  >
                    <v-card
                      variant="outlined"
                      class="d-flex align-center pa-2 mb-2 achievement-card"
                      draggable="true"
                      @dragstart="onAchievementDragStart(index)"
                      @dragover.prevent="onAchievementDragOver(index)"
                      @drop.prevent="onAchievementDrop(index)"
                      @dragend="onAchievementDragEnd"
                      :class="{
                        'achievement-card--dragover':
                          dragOverAchievementIndex === index,
                      }"
                      style="
                        transition:
                          background 0.2s,
                          border 0.2s;
                      "
                    >
                      <v-btn
                        icon="mdi-drag"
                        variant="text"
                        size="small"
                        class="mr-2 drag-btn"
                        style="
                          cursor: grab;
                          color: var(--v-theme-on-surface, #888);
                        "
                      />
                      <v-avatar size="40" class="mr-3">
                        <v-img
                          v-if="achievement.image"
                          :src="achievement.image"
                          cover
                        />
                        <v-icon v-else size="40" color="amber"
                          >mdi-trophy</v-icon
                        >
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-white text-truncate">
                          {{
                            achievement.title || "Achievement " + (index + 1)
                          }}
                        </div>
                        <div
                          class="text-caption text-grey-lighten-1 text-truncate"
                        >
                          {{ achievement.description }}
                        </div>
                      </div>
                      <v-menu
                        :model-value="achievementMenuOpenIndex === index"
                        @update:model-value="
                          (val) =>
                            (achievementMenuOpenIndex = val ? index : null)
                        "
                        :close-on-content-click="false"
                        location="bottom right"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="small"
                            v-bind="props"
                            @click.stop="openAchievementMenu(index)"
                            class="menu-btn"
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="openAchievementEditor(index)">
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item
                            @click="deleteAchievementFromMenu(index)"
                          >
                            <v-list-item-title class="text-error"
                              >Delete</v-list-item-title
                            >
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Trusted By Editor Section -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Trusted By</h3>
                  <v-btn @click="addTrustedByPartner" icon="mdi-plus" variant="outlined" size="small" color="primary" class="icon-btn-square" />
                </div>
                <div class="achievement-list">
                  <div v-for="(partner, index) in trustedByPartners" :key="partner.order ?? index" class="mb-3">
                    <v-card
                      variant="outlined"
                      class="d-flex align-center pa-2 mb-2 achievement-card"
                      draggable="true"
                      @dragstart="onTrustedByDragStart(index)"
                      @dragover.prevent="onTrustedByDragOver(index)"
                      @drop.prevent="onTrustedByDrop(index)"
                      @dragend="onTrustedByDragEnd"
                      :class="{ 'achievement-card--dragover': dragOverTrustedByIndex === index }"
                      style="transition: background 0.2s, border 0.2s;"
                    >
                      <v-btn icon="mdi-drag" variant="text" size="small" class="mr-2 drag-btn" style="cursor: grab; color: var(--v-theme-on-surface, #888);" />
                      <v-avatar size="40" class="mr-3">
                        <v-img v-if="partner.image" :src="partner.image" cover />
                        <v-icon v-else size="40" color="amber">mdi-handshake</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-white text-truncate">{{ partner.title || 'Partner ' + (index + 1) }}</div>
                      </div>
                      <v-menu :model-value="trustedByMenuOpenIndex === index" @update:model-value="val => trustedByMenuOpenIndex = val ? index : null" :close-on-content-click="false" location="bottom right">
                        <template #activator="{ props }">
                          <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" @click.stop="openTrustedByMenu(index)" class="menu-btn" />
                        </template>
                        <v-list>
                          <v-list-item @click="openTrustedByEditor(index)">
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="removeTrustedByPartner(index)">
                            <v-list-item-title class="text-error">Delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Featured Products Section (NEW) -->
              <div class="mb-6">
                <div class="d-flex align-center mb-4">
                  <h3 class="text-h6 mr-4">Produk Andalan</h3>
                  <v-btn
                    @click="productSelectionDialog = true"
                    icon="mdi-plus"
                    variant="outlined"
                    size="small"
                    color="primary"
                    class="icon-btn-square"
                    :disabled="availableProducts.length === 0"
                  />
                </div>
                <div
                  v-if="featuredProducts.length === 0"
                  class="text-center pa-8"
                >
                  <v-icon size="64" color="grey-lighten-1"
                    >mdi-package-variant-closed</v-icon
                  >
                  <p class="text-grey-darken-1 mt-2">
                    Belum ada produk yang dipilih sebagai featured
                  </p>
                  <v-btn
                    @click="productSelectionDialog = true"
                    color="primary"
                    variant="outlined"
                    :disabled="availableProducts.length === 0"
                  >
                    Pilih Produk
                  </v-btn>
                </div>
                <div v-else>
                  <div
                    v-for="(product, index) in featuredProducts"
                    :key="product.id"
                    class="mb-3"
                  >
                    <v-card
                      variant="outlined"
                      class="pa-4 featured-product-card"
                    >
                      <div class="d-flex align-center mb-3">
                        <div class="featured-product-img">
                          <v-img
                            :src="product.assets[0]?.url || '/placeholder.jpg'"
                            width="64"
                            height="64"
                            cover
                          />
                        </div>
                        <div class="flex-grow-1">
                          <h4 class="text-subtitle-1">{{ product.name }}</h4>
                          <p class="text-caption text-grey-darken-1 mb-0">
                            {{ product.category?.category }}
                          </p>
                        </div>
                        <v-btn
                          @click="removeFeaturedProduct(index)"
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                        />
                      </div>
                      <div class="d-flex mb-3 align-center">
                        <div class="flex-grow-1">
                          <p class="text-body-2 mb-2">
                            {{ product.description }}
                          </p>
                          <div class="d-flex align-center">
                            <span
                              v-if="product.discount && product.discount > 0"
                              class="text-h6 font-weight-bold text-primary mr-2"
                            >
                              {{
                                formatPrice(
                                  product.price -
                                    (product.price * product.discount) / 100,
                                )
                              }}
                            </span>
                            <span
                              v-if="product.discount && product.discount > 0"
                              class="text-h6 font-weight-bold text-grey-darken-1 mr-2"
                              style="text-decoration: line-through"
                            >
                              {{ formatPrice(product.price) }}
                            </span>
                            <span
                              v-else
                              class="text-h6 font-weight-bold text-primary"
                            >
                              {{ formatPrice(product.price) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                :loading="saveLoading"
                block
                size="large"
              >
                Simpan Perubahan
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Side - Preview -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined">
          <v-card-title
            class="bg-grey text-white d-flex justify-space-between align-center"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-eye</v-icon>
              Live Preview
            </div>
            <div class="d-flex gap-2">
              <v-btn
                @click="refreshPreview"
                icon="mdi-refresh"
                variant="text"
                size="small"
                color="white"
                title="Refresh preview"
              />
              <v-btn
                @click="openHomepage"
                icon="mdi-open-in-new"
                variant="text"
                size="small"
                color="white"
                title="Open homepage in new tab"
              />
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <div class="preview-container">
              <div :key="previewKey" class="preview-wrapper">
                <index />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Banner Editor Modal -->
    <v-dialog v-model="bannerEditorDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white">Edit Banner</v-card-title>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <v-card
              height="150"
              variant="outlined"
              class="d-flex align-center justify-center image-upload-card"
              @click="openBannerEditorFileInput"
              @dragover.prevent
              @drop="handleBannerEditorImageDrop"
            >
              <div v-if="!editingBanner?.image" class="text-center">
                <v-icon size="32" color="grey-lighten-1" class="mb-1"
                  >mdi-camera</v-icon
                >
                <p class="text-caption text-grey-darken-1">
                  Banner Image<br />
                </p>
              </div>
              <div v-else class="banner-image-wrapper">
                <v-img
                  :src="editingBanner?.image"
                  cover
                  height="100%"
                  class="rounded"
                />
                <v-btn
                  icon="mdi-close-circle"
                  size="small"
                  color="error"
                  class="clear-image-btn"
                  @click.stop="clearBannerEditorImage"
                  style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 2;
                    background: white;
                  "
                />
              </div>
            </v-card>
            <input
              ref="bannerEditorFileInputRef"
              type="file"
              accept="image"
              style="display: none"
              @change="handleBannerEditorImageUpload"
            />
          </div>
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.subtitle"
            label="Subtitle"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.buttonText"
            label="Button Text"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingBanner"
            v-model="editingBanner.buttonLink"
            label="Button Link"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeBannerEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveBannerEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Achievement Editor Modal -->
    <v-dialog v-model="achievementEditorDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Achievement</v-card-title>
        <v-card-text>
          <!-- Image preview -->
          <div
            class="image-upload-card"
            @drop="handleAchievementEditorImageDrop"
            @dragover.prevent
            @click="openAchievementEditorFileInput"
            style="
              height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
              position: relative;
            "
          >
            <v-img
              v-if="editingAchievement?.image"
              :src="editingAchievement.image"
              height="100"
              width="100%"
              cover
            />
            <v-icon v-else size="48" color="amber">mdi-trophy</v-icon>
            <v-btn
              v-if="editingAchievement?.image"
              icon="mdi-close"
              color="error"
              size="small"
              style="position: absolute; top: 8px; right: 8px"
              @click.stop="clearAchievementEditorImage"
            />
            <input
              ref="achievementEditorFileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAchievementEditorImageUpload"
            />
          </div>
          <v-text-field
            v-if="editingAchievement"
            v-model="editingAchievement.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-if="editingAchievement"
            v-model.number="editingAchievement.percentage"
            label="Percentage"
            type="number"
            min="0"
            max="100"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-textarea
            v-if="editingAchievement"
            v-model="editingAchievement.description"
            label="Description"
            variant="outlined"
            density="compact"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeAchievementEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveAchievementEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Trusted By Editor Modal -->
    <v-dialog v-model="trustedByEditorDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white">Edit Trusted By</v-card-title>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <v-card height="150" variant="outlined" class="d-flex align-center justify-center image-upload-card"
              @click="openTrustedByEditorFileInput"
              @dragover.prevent
              @drop="handleTrustedByEditorImageDrop"
            >
              <div v-if="!editingTrustedBy?.image" class="text-center">
                <v-icon size="32" color="grey-lighten-1" class="mb-1">mdi-camera</v-icon>
                <p class="text-caption text-grey-darken-1">Logo Perusahaan<br /></p>
              </div>
              <div v-else class="banner-image-wrapper">
                <v-img :src="editingTrustedBy?.image" cover height="100%" class="rounded" />
                <v-btn icon="mdi-close-circle" size="small" color="error" class="clear-image-btn" @click.stop="clearTrustedByEditorImage" style="position: absolute; top: 8px; right: 8px; z-index: 2; background: white;" />
              </div>
            </v-card>
            <input ref="trustedByEditorFileInputRef" type="file" accept="image" style="display: none" @change="handleTrustedByEditorImageUpload" />
          </div>
          <v-text-field v-if="editingTrustedBy" v-model="editingTrustedBy.title" label="Title" variant="outlined" density="compact" class="mb-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeTrustedByEditor">Batal</v-btn>
          <v-btn color="primary" @click="saveTrustedByEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.image-upload-card {
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.image-upload-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.preview-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.preview-wrapper {
  transform: scale(0.75);
  transform-origin: top left;
  width: 133.33%;
  min-height: 600px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-btn-square {
  border-radius: 4px !important;
  border: 1px solid currentColor !important;
}

.cursor-pointer {
  cursor: pointer;
}

.v-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.15) !important;
}

.product-select-card {
  min-height: 140px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  border-radius: 8px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.product-select-card .v-row {
  height: 100%;
}
.product-select-card .v-card-text {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-container::-webkit-scrollbar {
  width: 6px;
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive scaling */
@media (max-width: 1400px) {
  .preview-wrapper {
    transform: scale(0.65);
    width: 153.85%;
  }
}

@media (max-width: 1200px) {
  .preview-wrapper {
    transform: scale(0.55);
    width: 181.82%;
  }
}

@media (max-width: 992px) {
  .preview-wrapper {
    transform: scale(0.8);
    width: 125%;
  }
}

@media (max-width: 768px) {
  .preview-wrapper {
    transform: scale(1);
    width: 100%;
  }
}

/* Hide any navbar/footer that might be in the index component */
.preview-wrapper :deep(.navbar),
.preview-wrapper :deep(.footer),
.preview-wrapper :deep(nav),
.preview-wrapper :deep(footer) {
  display: none !important;
}

/* Ensure full width for preview content */
.preview-wrapper :deep(.container),
.preview-wrapper :deep(.v-container) {
  max-width: 100% !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.drag-drop-banner {
  position: relative;
}

.drag-drop-banner.drag-over {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.banner-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.clear-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: white;
}

.banner-list {
  background: transparent;
  padding: 16px 12px;
  border: 2px solid #fff;
  border-radius: 12px;
  margin-top: 0.5rem;
}
.banner-card {
  background: rgba(30, 30, 30, 0.8);
  border: 1.5px solid #fff;
  border-radius: 8px;
  box-shadow: none;
  color: #fff;
}
.banner-card--dragover {
  border-color: var(--v-theme-primary, #1976d2) !important;
  background: rgba(25, 118, 210, 0.08) !important;
}
.drag-btn {
  color: #bbb !important;
}
.menu-btn {
  color: #bbb !important;
}
.banner-card .v-avatar {
  background: #222;
}
.banner-card .v-img {
  border-radius: 50%;
}
.banner-card .font-weight-bold {
  color: #fff;
}
.banner-card .text-caption {
  color: #b0b0b0 !important;
}

.achievement-list {
  background: transparent;
  padding: 16px 12px;
  border: 2px solid #fff;
  border-radius: 12px;
  margin-top: 0.5rem;
}
.achievement-card {
  background: rgba(30, 30, 30, 0.8);
  border: 1.5px solid #fff;
  border-radius: 8px;
  box-shadow: none;
  color: #fff;
}
.achievement-card--dragover {
  border-color: var(--v-theme-primary, #1976d2) !important;
  background: rgba(25, 118, 210, 0.08) !important;
}
.drag-btn {
  color: #bbb !important;
}
.menu-btn {
  color: #bbb !important;
}
.achievement-card .v-avatar {
  background: #222;
}
.achievement-card .v-img {
  border-radius: 50%;
}
.achievement-card .font-weight-bold {
  color: #fff;
}
.achievement-card .text-caption {
  color: #b0b0b0 !important;
}

.featured-product-card {
  display: flex;
  flex-direction: column;
  min-height: 160px;
  height: 100%;
  border-radius: 8px;
  justify-content: stretch;
}
.featured-product-card .featured-product-img {
  width: 64px;
  height: 64px;
  min-width: 64px;
  min-height: 64px;
  max-width: 64px;
  max-height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #222;
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .featured-product-card .featured-product-img {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    max-width: 48px;
    max-height: 48px;
  }
}
</style>
