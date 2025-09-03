// types/product.ts
export interface ProductVariant {
  id?: string;
  unit: string;
  price: number;
  stock: number;
  isDefault?: boolean;
  quantity?: number;
  currency?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  variants: ProductVariant[];
  isActive: boolean;
  image?: string;
  tags: string[];
}
