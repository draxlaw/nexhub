import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice?: number;
  discount?: number;
  discountType?: 'fixed' | 'percentage';
  finalPrice: number;
  category: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // User who created (admin or vendor)
  stock: number;
  sold: number;
  sku: string;
  images: string[];
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  attributes?: Record<string, string>;
  rating: number;
  totalReviews: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    finalPrice: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    images: { type: [String], default: [] },
    thumbnail: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    isActive: { type: Boolean, default: true, index: true },
    attributes: { type: Schema.Types.Mixed },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String] },
  },
  { timestamps: true },
);

// Create compound indexes
ProductSchema.index({ name: 1, category: 1 });
ProductSchema.index({ vendor: 1, status: 1 });

// Auto-calculate finalPrice when saving
ProductSchema.pre<IProduct>('save', function () {
  if (this.discount && this.discountType) {
    if (this.discountType === 'fixed') {
      this.finalPrice = Math.max(0, this.price - this.discount);
    } else {
      this.finalPrice = this.price * (1 - this.discount / 100);
    }
  } else {
    this.finalPrice = this.price;
  }
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
