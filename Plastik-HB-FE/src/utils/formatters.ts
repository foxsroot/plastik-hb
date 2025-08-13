export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price);
};

export const calculateDiscountedPrice = (originalPrice: number, discountPercent: number): number => {
  if (!originalPrice || !discountPercent || discountPercent <= 0) {
    return 0;
  }

  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = originalPrice - discountAmount;

  return Math.max(0, Math.round(discountedPrice));
};

export function getImageUrl(imagePath: string): string {
  console.log("getImageUrl called with:", imagePath);
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("data:")) return imagePath; // Base64 images

  // Hardcode backend URL
  // return `${import.meta.env.VITE_API_URL}/uploads/${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
}

// 🔸 Helper functions untuk format input harga
export const formatPriceInput = (value: number | string): string => {
  if (!value) return '';

  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;

  if (isNaN(numValue)) return '';

  // Format dengan pemisah ribuan (titik)
  return numValue.toLocaleString('id-ID');
};

export const parsePriceInput = (value: string): number => {
  if (!value) return 0;

  // Remove all dots (thousand separators) and parse as number
  const cleanValue = value.replace(/\./g, '');
  const numValue = parseFloat(cleanValue);

  return isNaN(numValue) ? 0 : numValue;
};

export const validatePriceInput = (value: string): boolean => {
  if (!value) return false;

  // Remove dots and check if it's a valid number
  const cleanValue = value.replace(/\./g, '');
  const numValue = parseFloat(cleanValue);

  return !isNaN(numValue) && numValue > 0;
};
