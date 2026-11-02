export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutResult {
  id: string | number;
  items: CartItem[];
  total: number;
  createdAt?: string;
}
