export interface Category {
  id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  url: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'draft';
  image?: string;
  images?: string[];
  description?: string;
  category?: string;
  category_id?: string;
  specifications?: string;
  discount?: number;
  discounted_price?: number;
  assets?: Asset[];
}

export interface CreateProductData {
  name: string;
  price: number;
  description?: string;
  specification?: string;
  featured?: boolean;
  category_id?: string;
  category_name?: string;
  discount?: number;
  discounted_price?: number;
  status?: 'Aktif' | 'Draft';
}

export interface NewProduct {
  name: string;
  price: number | null;
  status: 'active' | 'draft';
  image?: string;
  images?: string[];
  description?: string;
  category_id?: string;
  category_name?: string;
  specifications?: string;
  discount?: number;
}

export interface ModalState {
  showAddModal: boolean;
  showAddCategoryModal: boolean;
  showCategoryManagerModal: boolean;
  showDeleteDialog: boolean;
}
