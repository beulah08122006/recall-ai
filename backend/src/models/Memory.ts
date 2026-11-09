import mongoose, { Schema, type Document } from 'mongoose';

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  tags: string[];
  personId?: mongoose.Types.ObjectId;
  personName?: string;
  relatedItem?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Personal', index: true },
    tags: [{ type: String, trim: true }],
    personId: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    personName: { type: String, default: '' },
    relatedItem: { type: String, default: '' },
  },
  { timestamps: true }
);

MemorySchema.index({ userId: 1, title: 'text', description: 'text', tags: 'text' });

export const Memory = mongoose.model<IMemory>('Memory', MemorySchema);
