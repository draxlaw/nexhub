import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  businessEmail: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isApproved: boolean;
  approvedAt?: Date;
  isActive: boolean;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}

const VendorSchema = new Schema<IVendor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, lowercase: true },
    description: { type: String },
    logo: { type: String },
    bannerImage: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    isApproved: { type: Boolean, default: false, index: true },
    approvedAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
export default Vendor;
