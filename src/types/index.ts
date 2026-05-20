export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  specs: Record<string, string>;
  tags: string[];
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BundleDeal {
  id: string;
  products: Product[];
  totalPrice: number;
  savings: number;
  label: string;
}
