import { ref, computed } from 'vue';
import { getImageUrl } from '@/utils/formatters';
import AltImageProduk from '@/assets/productImage/Alt-Image-Produk.png';

// Import semua gambar dari folder assets
const productImages = import.meta.glob('@/assets/productImage/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' });

export const useImageHandler = () => {
  // Alt image configuration
  const ALT_IMAGE_FILENAME = AltImageProduk;

  // Reactive state untuk tracking failed images
  const failedImages = ref(new Set<string>());

  // Computed untuk mendapatkan alt image URL
  const altImageUrl = computed(() => {
    return "";
  });

  // Helper untuk get gambar dari assets folder
  const getAssetImage = (filename: string): string | null => {
    // Coba cari image dengan berbagai format path
    const possiblePaths = [
      `/src/assets/productImage/${filename}`,
      `@/assets/productImage/${filename}`,
      `/assets/productImage/${filename}`
    ];

    for (const path of possiblePaths) {
      if (productImages[path]) {
        return productImages[path] as string;
      }
    }

    // Coba juga tanpa extension dan dengan extension
    const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '');
    const extensions = ['.png', '.jpg', '.jpeg', '.svg'];

    for (const ext of extensions) {
      for (const path of possiblePaths) {
        const fullPath = path.replace(filename, `${nameWithoutExt}${ext}`);
        if (productImages[fullPath]) {
          return productImages[fullPath] as string;
        }
      }
    }

    return null;
  };

  // Helper untuk get image URL atau fallback ke alt - ENHANCED VERSION
  const getImageOrAlt = (imageFilename: string | null | undefined): string => {
    // Jika tidak ada image filename, langsung return alt
    if (!imageFilename || imageFilename === '' || imageFilename === '/placeholder.jpg') {
      return altImageUrl.value;
    }

    // Jika base64, return as is
    if (imageFilename.startsWith('data:')) {
      return imageFilename;
    }

    // Jika sudah URL lengkap (http/https), return as is
    if (imageFilename.startsWith('http')) {
      return imageFilename;
    }

    // Jika sudah pernah failed, langsung return alt
    if (failedImages.value.has(imageFilename)) {
      return altImageUrl.value;
    }

    // 1. Coba cari di assets folder dulu (prioritas utama)
    const assetImage = getAssetImage(imageFilename);
    if (assetImage) {
      return assetImage;
    }

    // 2. Coba sebagai backend URL
    const backendUrl = getImageUrl(`${imageFilename}`);
    return backendUrl;
  };

  // Helper untuk cek apakah image sudah failed
  const shouldUseAltImage = (imageFilename: string | null | undefined): boolean => {
    if (!imageFilename || imageFilename === '' || imageFilename === '/placeholder.jpg') {
      return true;
    }

    if (imageFilename.startsWith('data:')) {
      return false;
    }

    return failedImages.value.has(imageFilename);
  };

  // Mark image as failed
  const markImageAsFailed = (imageUrl: string) => {
    failedImages.value.add(imageUrl);
  };

  // Handle image error dengan simple fallback
  const handleImageError = (event: Event, fallbackAction?: () => void) => {
    const img = event.target as HTMLImageElement;
    const originalUrl = img.src;

    // Mark as failed
    markImageAsFailed(originalUrl);

    // Langsung ganti ke alt image
    img.src = altImageUrl.value;

    // Execute fallback action if provided
    if (fallbackAction) {
      fallbackAction();
    }
  };

  // Reset image state for retry
  const retryFailedImage = (imageUrl: string) => {
    failedImages.value.delete(imageUrl);
  };

  // Clear all failed images (untuk refresh)
  const clearFailedImages = () => {
    failedImages.value.clear();
  };

  // Get main image URL dari product assets
  const getMainImageUrl = (product: any): string => {
    // Cek apakah ada assets dan ambil yang order = 1 (main image)
    if (product.assets && product.assets.length > 0) {
      const mainAsset = product.assets.find((asset: any) => asset.order === 1);
      if (mainAsset && mainAsset.url) {
        return getImageOrAlt(mainAsset.url);
      }
    }

    // Fallback ke image field jika ada
    if (product.image) {
      return getImageOrAlt(product.image);
    }

    // Fallback final ke alt image
    return altImageUrl.value;
  };

  // Get additional images URLs dari product assets
  const getAdditionalImagesUrls = (product: any): string[] => {
    if (!product.assets || product.assets.length <= 1) {
      return [];
    }

    // Filter dan sort assets dengan order > 1
    return product.assets
      .filter((asset: any) => asset.order > 1)
      .sort((a: any, b: any) => a.order - b.order)
      .map((asset: any) => getImageOrAlt(asset.url));
  };

  // Get all images URLs dari product (main + additional)
  const getAllImagesUrls = (product: any): string[] => {
    const mainImage = getMainImageUrl(product);
    const additionalImages = getAdditionalImagesUrls(product);

    return [mainImage, ...additionalImages];
  };

  // Get all available asset images (untuk debugging)
  const getAvailableAssetImages = (): string[] => {
    return Object.keys(productImages);
  };

  // Get all imported images URLs (untuk debugging)
  const getImportedImageUrls = (): Record<string, string> => {
    const urls: Record<string, string> = {};
    Object.entries(productImages).forEach(([path, url]) => {
      const filename = path.split('/').pop() || path;
      urls[filename] = url as string;
    });
    return urls;
  };

  return {
    // Reactive state
    failedImages,
    altImageUrl,

    // Core functions
    getImageOrAlt,
    shouldUseAltImage,
    markImageAsFailed,
    handleImageError,
    retryFailedImage,
    clearFailedImages,

    // Asset functions
    getAssetImage,
    getAvailableAssetImages,
    getImportedImageUrls,

    // Product-specific functions
    getMainImageUrl,
    getAdditionalImagesUrls,
    getAllImagesUrls,

    // Constants
    ALT_IMAGE_FILENAME
  };
};

// Export untuk penggunaan non-composable
export const imageUtils = {
  ALT_IMAGE_FILENAME: AltImageProduk,
  getAltImageUrl: () => AltImageProduk,
};
