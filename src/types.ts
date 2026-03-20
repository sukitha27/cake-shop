export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  alt: string;
  description: string;
  dietaryTags: string[];
  stockQuantity: number;
  ingredients?: string;
  nutrition?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'out_for_delivery';
  createdAt: string;
  shippingAddress: any;
  paymentMethod: string;
}
