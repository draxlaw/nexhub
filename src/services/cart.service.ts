import Cart, { ICart, ICartItem } from '../models/Cart.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import { ApiError } from '../utils/ApiError';

/**
 * Get or create a cart for a user
 */
export async function getOrCreateCart(userId: string): Promise<ICart> {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug thumbnail price finalPrice stock isActive status',
  });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug thumbnail price finalPrice stock isActive status',
    });
  }

  return cart!;
}

/**
 * Get cart by user ID
 */
export async function getCart(userId: string): Promise<ICart | null> {
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name slug thumbnail price finalPrice stock isActive status images',
    })
    .populate('coupon');

  return cart;
}

/**
 * Add item to cart
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<ICart> {
  // Validate product exists and is available
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.isActive || product.status !== 'published') {
    throw new ApiError(400, 'Product is not available for purchase');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} items available`);
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      throw new ApiError(400, `Cannot add more items. Only ${product.stock} items available`);
    }
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
    cart.items[existingItemIndex].finalPrice = product.finalPrice;
  } else {
    // Add new item
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
      finalPrice: product.finalPrice,
    } as ICartItem);
  }

  await cart.save();

  // Return populated cart
  return getOrCreateCart(userId);
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.splice(itemIndex, 1);
  } else {
    // Validate stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.stock < quantity) {
      throw new ApiError(400, `Insufficient stock. Only ${product.stock} items available`);
    }

    // Update quantity and prices
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    cart.items[itemIndex].finalPrice = product.finalPrice;
  }

  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, productId: string): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Clear all items from cart
 */
export async function clearCart(userId: string): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  cart.coupon = undefined;
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Apply coupon to cart
 */
export async function applyCoupon(userId: string, couponCode: string): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  if (cart.items.length === 0) {
    throw new ApiError(400, 'Cannot apply coupon to empty cart');
  }

  // Find and validate coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon code');
  }

  // Check coupon validity
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    throw new ApiError(400, 'Coupon is not yet active');
  }

  if (coupon.endDate && now > coupon.endDate) {
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  // Calculate cart subtotal for minimum order check
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount of ${coupon.minimumOrderAmount} required for this coupon`,
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  // Apply coupon to cart
  cart.coupon = coupon._id;
  cart.couponCode = coupon.code;
  cart.couponDiscount = discountAmount;

  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(userId: string): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.coupon = undefined;
  cart.couponCode = undefined;
  cart.couponDiscount = 0;

  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Validate cart items (check stock, prices, availability)
 */
export async function validateCart(userId: string): Promise<{
  valid: boolean;
  cart: ICart;
  issues: string[];
}> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const issues: string[] = [];
  let hasChanges = false;

  for (let i = cart.items.length - 1; i >= 0; i--) {
    const item = cart.items[i];
    const product = await Product.findById(item.product);

    if (!product) {
      issues.push(`Product removed: Item no longer exists`);
      cart.items.splice(i, 1);
      hasChanges = true;
      continue;
    }

    if (!product.isActive || product.status !== 'published') {
      issues.push(`${product.name}: Product is no longer available`);
      cart.items.splice(i, 1);
      hasChanges = true;
      continue;
    }

    if (product.stock === 0) {
      issues.push(`${product.name}: Out of stock`);
      cart.items.splice(i, 1);
      hasChanges = true;
      continue;
    }

    if (product.stock < item.quantity) {
      issues.push(
        `${product.name}: Quantity reduced from ${item.quantity} to ${product.stock} (limited stock)`,
      );
      cart.items[i].quantity = product.stock;
      hasChanges = true;
    }

    // Update prices if changed
    if (item.price !== product.price || item.finalPrice !== product.finalPrice) {
      issues.push(`${product.name}: Price updated`);
      cart.items[i].price = product.price;
      cart.items[i].finalPrice = product.finalPrice;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await cart.save();
  }

  const updatedCart = await getOrCreateCart(userId);

  return {
    valid: issues.length === 0,
    cart: updatedCart,
    issues,
  };
}

/**
 * Get cart summary (for checkout preview)
 */
export async function getCartSummary(userId: string): Promise<{
  itemCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    finalPrice: number;
    lineTotal: number;
  }>;
}> {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price finalPrice',
  });

  if (!cart || cart.items.length === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      couponDiscount: 0,
      total: 0,
      items: [],
    };
  }

  const items = cart.items.map((item) => {
    const product = item.product as any;
    return {
      productId: product._id.toString(),
      name: product.name,
      quantity: item.quantity,
      price: item.price,
      finalPrice: item.finalPrice,
      lineTotal: item.finalPrice * item.quantity,
    };
  });

  return {
    itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
    subtotal: cart.subtotal,
    discount: cart.discount,
    couponDiscount: cart.couponDiscount || 0,
    total: cart.total,
    items,
  };
}

/**
 * Sync cart prices with current product prices
 */
export async function syncCartPrices(userId: string): Promise<ICart> {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      item.price = product.price;
      item.finalPrice = product.finalPrice;
    }
  }

  await cart.save();

  return getOrCreateCart(userId);
}

/**
 * Merge guest cart with user cart (for when user logs in)
 */
export async function mergeCarts(
  guestCartId: string,
  userId: string,
): Promise<ICart> {
  const guestCart = await Cart.findById(guestCartId);
  if (!guestCart) {
    return getOrCreateCart(userId);
  }

  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) {
    // Transfer guest cart to user
    guestCart.user = userId as any;
    await guestCart.save();
    return getOrCreateCart(userId);
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingIndex = userCart.items.findIndex(
      (item) => item.product.toString() === guestItem.product.toString(),
    );

    if (existingIndex > -1) {
      // Add quantities
      const product = await Product.findById(guestItem.product);
      if (product) {
        const newQuantity = Math.min(
          userCart.items[existingIndex].quantity + guestItem.quantity,
          product.stock,
        );
        userCart.items[existingIndex].quantity = newQuantity;
      }
    } else {
      // Add new item
      userCart.items.push(guestItem);
    }
  }

  await userCart.save();

  // Delete guest cart
  await Cart.findByIdAndDelete(guestCartId);

  return getOrCreateCart(userId);
}

/**
 * Delete cart (used after successful order)
 */
export async function deleteCart(userId: string): Promise<void> {
  await Cart.findOneAndDelete({ user: userId });
}
