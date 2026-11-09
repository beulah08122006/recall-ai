import mongoose, { Schema, type Document } from 'mongoose';

export interface IItem extends Document {
  userId: mongoose.Types.ObjectId;
  itemName: string;
  description?: string;
  personName: string;
  personId?: mongoose.Types.ObjectId;
  direction: 'borrowed' | 'lent';
  date: Date;
  expectedReturnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    personName: { type: String, required: true, trim: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    direction: { type: String, enum: ['borrowed', 'lent'], required: true },
    date: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ItemSchema.index({ userId: 1, direction: 1, status: 1 });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
