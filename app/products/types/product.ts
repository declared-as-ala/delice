export interface ProductVariant {
  variant_id: string; // ex: "citron-jaune-1kg"
  variant_name?: string; // optional name, default ''
  price: number; // price of this variant
  unit_type: 'weight' | 'piece'; // matches backend enum
  grams?: number | null; // optional grams, default null
  options?: { name: string; value: string }[]; // optional variant options
}

export interface Product {
  id: string; // from _id in MongoDB
  Image: string; // main image
  title: string;
  category: string; // defaults to 'Uncategorized'
  variants: ProductVariant[]; // list of variants
  description: string;



  createdAt: string; // timestamp
  updatedAt: string; // timestamp
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}
