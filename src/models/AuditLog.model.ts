import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: string;
  entityType: 'user' | 'product' | 'vendor' | 'category' | 'order' | 'other';
  entityId: mongoose.Types.ObjectId;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  reason?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['user', 'product', 'vendor', 'category', 'order', 'other'],
      required: true,
      index: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    reason: { type: String },
  },
  { timestamps: true },
);

// Define compound indexes
AuditLogSchema.index({ admin: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, createdAt: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
