import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // Price at time of adding to cart
  finalPrice: number; // Final price after discounts
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponDiscount?: number;
  notes?: string;
  expiresAt?: Date;
  calculateTotals(): void;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0, min: 0 },
    notes: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

// Calculate totals method
CartSchema.methods.calculateTotals = function () {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum: number, item: ICartItem) => {
    return sum + item.finalPrice * item.quantity;
  }, 0);

  // Calculate discount (product discounts already applied in finalPrice)
  this.discount = this.items.reduce((sum: number, item: ICartItem) => {
    return sum + (item.price - item.finalPrice) * item.quantity;
  }, 0);

  // Apply coupon discount if exists
  const couponDiscount = this.couponDiscount || 0;

  // Calculate total
  this.total = Math.max(0, this.subtotal - couponDiscount);
};

// Pre-save hook to calculate totals
CartSchema.pre<ICart>('save', function () {
  this.calculateTotals();
});

// Index for cart expiration (for guest carts or abandoned cart cleanup)
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for item count
CartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((count: number, item: ICartItem) => count + item.quantity, 0);
});

// Ensure virtuals are included in JSON output
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
