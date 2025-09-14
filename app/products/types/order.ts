export interface OrderItem {
  productId: string;
  variantId: string; // matches variant_id from ProductVariant
  name: string; // nom du produit
  variantUnit: string; // unité calculée (500g, 1kg, pièce)
  quantity: number;
  price: number;
  currency: string; // devise (EUR)
  image?: string; // optionnelle
  _id?: string; // optionnelle pour les nouveaux items
}

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  isAdmin?: boolean; // optionnel, pour vérification admin
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  description?: string; // optionnelle
}

export interface DeliveryAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export type OrderStatus = 'en_attente' | 'payé' | 'terminé' | 'annulé';
export type PaymentMethod = 'stripe' | 'paypal' | 'espèces';
export type PickupType = 'store' | 'delivery';

export interface Order {
  _id: string;
  id?: string; // optionnel, peut mapper _id vers id
  customer: Customer;
  items: OrderItem[];
  pickupType: PickupType;
  pickupLocation?: PickupLocation; // optionnel selon pickupType
  deliveryAddress?: DeliveryAddress; // optionnel selon pickupType
  deliveryTime?: string; // 🆕 ISO string ou "HH:mm" pour livraison programmée
  deliveryFee: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  isDelivered: boolean;
  paymentMethod: PaymentMethod;
  discountCode?: string;
  discountAmount?: number;
  notes?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper type for cart items to handle both old and new product structures
export interface CartItem {
  product: {
    id: string;
    title: string;
    Image: string;
    image?: string; // fallback for old structure
  };
  variant?: {
    // Old structure
    id?: string;
    name?: string;
    unit?: string;
    price?: number;
    currency?: string;
  };
  selectedVariant?: {
    // New structure
    variant_id: string;
    variant_name?: string;
    price: number;
    unit_type: 'weight' | 'piece';
    grams?: number | null;
    options?: { name: string; value: string }[];
  };
  quantity: number;
}
