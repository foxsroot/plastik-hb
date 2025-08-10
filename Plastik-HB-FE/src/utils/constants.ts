export const STATUS_OPTIONS = [
  { title: 'Semua Status Produk', value: 'all' },
  { title: 'Aktif', value: 'active' },
  { title: 'Draft', value: 'draft' }
];

export const PRODUCT_STATUS_OPTIONS = [
  { title: 'Aktif', value: 'active' },
  { title: 'Draft', value: 'draft' }
];

export const SORT_OPTIONS = [
  { title: 'Nama A-Z', value: 'name' },
  { title: 'Nama Z-A', value: 'name_desc' },
  { title: 'Harga Terendah', value: 'price_asc' },
  { title: 'Harga Tertinggi', value: 'price_desc' }
];

export const VALIDATION_RULES = {
  name: [
    (v: string) => !!v || 'Nama produk wajib diisi',
    (v: string) => v.length >= 3 || 'Nama produk minimal 3 karakter'
  ],
  price: [
    (v: number) => !!v || 'Harga wajib diisi',
    (v: number) => v > 0 || 'Harga harus lebih dari 0'
  ],
  discount: [
    (v: number) => v >= 0 || 'Discount tidak boleh negatif',
    (v: number) => v <= 100 || 'Discount maksimal 100%'
  ],
  categoryName: [
    (v: string) => !!v || 'Nama kategori wajib diisi',
    (v: string) => v.length >= 2 || 'Nama kategori minimal 2 karakter',
    (v: string) => v.length <= 50 || 'Nama kategori maksimal 50 karakter'
  ]
};
