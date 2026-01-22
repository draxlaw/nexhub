// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  vendor: {
    _id: string;
    name: string;
    email: string;
  };
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price-low' | 'price-high' | 'rating';
  limit?: number;
  page?: number;
  featured?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  stock: number;
  tags: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isPublished?: boolean;
}

// Cart Types
export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Order Types
export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Address Types
export interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  user: User;
  product: Product;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wishlist Types
export interface Wishlist {
  _id: string;
  user: User;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  order: Order;
  amount: number;
  currency: string;
  method: 'stripe' | 'paystack';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  user: User;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
}

// Vendor Types
export interface Vendor {
  _id: string;
  user: User;
  businessName: string;
  businessDescription?: string;
  businessAddress: Address;
  taxId?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  isVerified: boolean;
  rating?: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

// Used for API requests (without confirmPassword which is only for client validation)
export interface RegisterApiData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor';
}

// Used for form validation (includes confirmPassword)
export interface RegisterFormData extends RegisterApiData {
  confirmPassword: string;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

export interface UiState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data?: any;
  };
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }[];
  loading: {
    global: boolean;
    buttons: Record<string, boolean>;
  };
  theme: 'light' | 'dark';
}
