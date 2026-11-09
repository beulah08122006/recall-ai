import mongoose, { Schema, type Document } from 'mongoose';

export interface ICarryListItem extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarryListItemSchema = new Schema<ICarryListItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Everyday Essentials' },
    checked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CarryListItemSchema.index({ userId: 1, checked: 1 });

export const CarryListItem = mongoose.model<ICarryListItem>('CarryListItem', CarryListItemSchema);
