import { Types } from 'mongoose';

/**
 * Cart item representation
 */
export interface CartItemDto {
  product: Types.ObjectId | string;
  quantity: number;
  price: number;
  finalPrice: number;
}

/**
 * Add to cart request body
 */
export interface AddToCartDto {
  productId: string;
  quantity?: number;
}

/**
 * Update cart item request body
 */
export interface UpdateCartItemDto {
  quantity: number;
}

/**
 * Apply coupon request body
 */
export interface ApplyCouponDto {
  couponCode: string;
}

/**
 * Cart summary response
 */
export interface CartSummaryDto {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  total: number;
  items: CartSummaryItemDto[];
}

/**
 * Cart summary item
 */
export interface CartSummaryItemDto {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  finalPrice: number;
  lineTotal: number;
}

/**
 * Cart validation result
 */
export interface CartValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Populated cart item with product details
 */
export interface PopulatedCartItem {
  product: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    thumbnail?: string;
    price: number;
    finalPrice: number;
    stock: number;
    isActive: boolean;
    status: string;
    images?: string[];
  };
  quantity: number;
  price: number;
  finalPrice: number;
}

/**
 * Cart response with populated items
 */
export interface CartResponse {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: PopulatedCartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon?: Types.ObjectId;
  couponCode?: string;
  couponDiscount?: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
