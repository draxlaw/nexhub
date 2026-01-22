import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  usagePerUser?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  excludedProducts?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderAmount: {
      type: Number,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usagePerUser: {
      type: Number,
      min: 1,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    excludedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index for active coupons lookup
CouponSchema.index({ code: 1, isActive: 1 });

// Validate discount value for percentage type
CouponSchema.pre<ICoupon>('save', function () {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    throw new Error('Percentage discount cannot exceed 100%');
  }
});

// Virtual to check if coupon is currently valid
CouponSchema.virtual('isValid').get(function () {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
});

// Ensure virtuals are included in JSON output
CouponSchema.set('toJSON', { virtuals: true });
CouponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
