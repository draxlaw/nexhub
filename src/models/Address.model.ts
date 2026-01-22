import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: 'shipping' | 'billing';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['shipping', 'billing'], required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Compound index for user and type
AddressSchema.index({ user: 1, type: 1 });

// Index for default addresses
AddressSchema.index({ user: 1, isDefault: 1 });

// Pre-save hook to ensure only one default address per type per user
AddressSchema.pre<IAddress>('save', async function () {
  if (this.isDefault) {
    await mongoose.model('Address').updateMany(
      { user: this.user, type: this.type, _id: { $ne: this._id } },
      { $set: { isDefault: false } },
    );
  }
});

const Address = mongoose.model<IAddress>('Address', AddressSchema);
export default Address;
